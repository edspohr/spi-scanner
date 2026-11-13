// Run with an authorized gcloud account. Never logs access tokens or passwords.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const token = () => execFileSync('gcloud', ['auth', 'print-access-token'], {encoding:'utf8'}).trim();
const { Firestore } = require('@google-cloud/firestore');
const { OAuth2Client } = require('google-auth-library');
const oauth = new OAuth2Client();
oauth.setCredentials({access_token:token(),expiry_date:Date.now()+3500000});
const db=new Firestore({projectId:'spi-scanner',authClient:oauth});
async function authRequest(endpoint, body) {
 const response=await fetch(`https://identitytoolkit.googleapis.com/v1/projects/spi-scanner/${endpoint}`,{method:'POST',headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json','x-goog-user-project':'spi-scanner'},body:JSON.stringify(body)});
 const data=await response.json();if(!response.ok)throw new Error(data.error?.message || `Auth HTTP ${response.status}`);return data;
}
async function main(){
 const command=process.argv[2] || 'inventory';
 if(command==='inventory') {
  for(const name of ['regulatory_opportunities','daily_digests','team_members','official_sources','scan_runs']) {
   const snapshot=await db.collection(name).limit(100).get();
   console.log(name, JSON.stringify(snapshot.docs.map(d=>({id:d.id,title:d.data().title,name:d.data().name,email:d.data().email,sourceUrl:d.data().sourceUrl}))));
  }
  const accounts=await authRequest('accounts:lookup',{email:['jgallo@spiamericas.com','edmundo@spohr.cl']});
  console.log('Accounts',JSON.stringify((accounts.users || []).map(u=>({uid:u.localId,email:u.email,displayName:u.displayName,emailVerified:u.emailVerified,disabled:u.disabled}))));
 }
 if(command==='diagnostics') {
  const sources=await db.collection('official_sources').get();
  const runs=await db.collection('scan_runs').orderBy('startedAt','desc').limit(12).get();
  const result={sources:sources.docs.map(d=>({...d.data(),id:d.id})),runs:runs.docs.map(d=>({...d.data(),id:d.id}))};
  fs.writeFileSync('/tmp/spi-source-diagnostics.json',JSON.stringify(result,null,2));
  for(const r of result.runs)console.log(JSON.stringify(r));
  console.log('Sources:',result.sources.filter(s=>!s.deletedAt).length);
 }
 if(command==='repair-dof-link') {
  const ref=db.collection('official_sources').doc('mx-dof-salud');
  const before=await ref.get();
  if(!before.exists)throw Error('DOF source not found.');
  const dir=path.resolve(__dirname,'../../.local/mvp-backups');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,`dof-${Date.now()}.json`),JSON.stringify(before.data(),null,2),{mode:0o600});
  await db.runTransaction(async transaction=>{
   const current=await transaction.get(ref);const data=current.data();
   if(!data||data.deletedAt||!['https://www.dof.gob.mx/rss/salud.xml','https://dof.gob.mx/rss/salud.xml'].includes(data.feedUrl)){console.log('DOF was customized or removed; preserved.');return;}
   const changes={feedUrl:'https://dof.gob.mx/',itemLinkPattern:'/nota_detalle\\.php$'};
   if(data.name==='Diario Oficial de la Federación (DOF) - Sección Salud & Comercio')changes.name='Diario Oficial de la Federación (DOF) - Publicaciones';
   if(data.portalUrl==='https://www.dof.gob.mx')changes.portalUrl='https://dof.gob.mx';
   transaction.update(ref,changes);console.log('DOF link repaired; activation state preserved.');
  });
 }
 if(command==='bootstrap') {
  const manifest=require('./mock-records.json');
  const legacy=[];
  for(const [collection, ids] of Object.entries(manifest)) {
   for(const id of ids){const ref=db.collection(collection).doc(id);const doc=await ref.get();if(doc.exists)legacy.push({collection,id,data:doc.data()});}
  }
  const digests=await db.collection('daily_digests').get();
  for(const d of digests.docs){
   const items=d.data().opportunities || [];
   if(items.every(item=>manifest.regulatory_opportunities.includes(item.id)) && !legacy.some(x=>x.collection==='daily_digests' && x.id===d.id)) legacy.push({collection:'daily_digests',id:d.id,data:d.data()});
  }
  const backupDir=path.resolve(__dirname,'../../.local/mvp-backups');fs.mkdirSync(backupDir,{recursive:true});
  const backupFile=path.join(backupDir,`legacy-${Date.now()}.json`);fs.writeFileSync(backupFile,JSON.stringify(legacy,null,2),{mode:0o600});
  console.log(`Backup created: ${backupFile} (${legacy.length} records)`);
  const accounts=await authRequest('accounts:lookup',{email:['jgallo@spiamericas.com']});
  let juliana=accounts.users?.[0];
  if(!juliana){const created=await authRequest('accounts',{email:'jgallo@spiamericas.com',displayName:'Juliana Gallo',emailVerified:false,disabled:false});juliana={localId:created.localId,email:'jgallo@spiamericas.com'};}
  if(juliana.disabled)throw new Error('Juliana account is disabled; review before changing access.');
  await db.collection('team_members').doc(juliana.localId).set({name:'Juliana Gallo',email:'jgallo@spiamericas.com',role:'Equipo SPI',specialty:[]},{merge:true});
  const owner=await authRequest('accounts:lookup',{email:['edmundo@spohr.cl']});
  if(owner.users?.[0]){const u=owner.users[0];await db.collection('team_members').doc(u.localId).set({name:u.displayName || 'Edmundo Spohr',email:u.email,role:'Equipo SPI',specialty:[]},{merge:true});}
  const {OFFICIAL_SOURCES_REGISTRY}=require('../lib/sources/registry');
  const batch=db.batch();
  for(const item of legacy)batch.delete(db.collection(item.collection).doc(item.id));
  for(const source of OFFICIAL_SOURCES_REGISTRY){const ref=db.collection('official_sources').doc(source.id);if(!(await ref.get()).exists)batch.create(ref,source);}
  await batch.commit();
  console.log('Juliana account ready:',juliana.email,'; legacy records removed:',legacy.length,'; official sources:',OFFICIAL_SOURCES_REGISTRY.length);
 }
 if(command==='sync-sources') {
  const {OFFICIAL_SOURCES_REGISTRY}=require('../lib/sources/registry');
  const batch=db.batch();
  for(const source of OFFICIAL_SOURCES_REGISTRY){const ref=db.collection('official_sources').doc(source.id);if(!(await ref.get()).exists)batch.create(ref,source);}
  await batch.commit();console.log('Official source registry synchronized.');
 }
 if(command==='verify-config') {
  for(const endpoint of ['config','defaultSupportedIdpConfigs/google.com']) {
   const response=await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/spi-scanner/${endpoint}`,{headers:{Authorization:`Bearer ${token()}`,'x-goog-user-project':'spi-scanner'}});
   const data=await response.json();if(!response.ok)throw Error(data.error?.message);
   console.log(endpoint,JSON.stringify(endpoint==='config'?{authorizedDomains:data.authorizedDomains,emailPassword:data.signIn?.email}: {name:data.name,enabled:data.enabled}));
  }
 }
 if(command==='probe-model') {
  for(const model of ['gemini-3.5-flash','gemini-3.8-flash','gemini-2.5-flash']){
   const response=await fetch(`https://aiplatform.googleapis.com/v1/projects/spi-scanner/locations/global/publishers/google/models/${model}:generateContent`,{method:'POST',headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:'Responde solamente OK'}]}],generationConfig:{maxOutputTokens:100}})});
   const data=await response.json(); console.log(model,response.status, data.error?.message || data.candidates?.[0]?.content?.parts?.map(p=>p.text || '').join(''));
   if(response.ok)break;
  }
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
