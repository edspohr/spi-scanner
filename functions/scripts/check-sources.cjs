// Checks the live catalog without calling Gemini. --save persists source diagnostics.
const admin=require('firebase-admin');
const {execFileSync}=require('node:child_process');
const {OAuth2Client}=require('google-auth-library');
const oauth=new OAuth2Client();
oauth.setCredentials({access_token:execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim(),expiry_date:Date.now()+3500000});
admin.initializeApp({projectId:'spi-scanner'});
const db=admin.firestore();db.settings({authClient:oauth});
const {getOfficialSources}=require('../lib/sources/catalog');
const {fetchSourceDocuments}=require('../lib/sources/rssFetcher');
const {makeSourceHealth}=require('../lib/sources/health');
const country=process.argv.slice(2).find(value=>['CO','MX','BR','AR','CL','PE'].includes(value));
(async()=>{
 const sources=(await getOfficialSources()).filter(source=>!country||source.country===country);
 // Limit concurrent external requests and PDF parsing.
 let next=0;
 await Promise.all(Array.from({length:Math.min(3,sources.length)},async()=>{
  while(next<sources.length){
   const source=sources[next++];let health;
   try{const result=await fetchSourceDocuments(source,2);health=makeSourceHealth(source,result.documents,result.errors);}
   catch(error){health=makeSourceHealth(source,[],[],error);}
   if(process.argv.includes('--save')){
    const ref=db.collection('official_sources').doc(source.id);
    await db.runTransaction(async transaction=>{
     const current=await transaction.get(ref);
     if(current.exists&&!current.data().deletedAt&&current.data().feedUrl===source.feedUrl)transaction.update(ref,{health});
    });
   }
   console.log(JSON.stringify({id:source.id,...health}));
  }
 }));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
