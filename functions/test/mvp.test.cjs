const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function load(file, dependencies, globals = {}) {
 const exports = {};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../lib',file), 'utf8'), {exports, require:name => name in dependencies ? dependencies[name] : name.startsWith('.') ? require(path.join(__dirname,'../lib',path.dirname(file),name)) : require(name), console, URL, AbortSignal, Buffer, ...globals});
 return exports;
}
test('backend rejects anonymous, unverified and unauthorized users', () => {
 const {requireSpiMember}=load('auth.js',{});
 for(const auth of [undefined,{uid:'x',token:{email:'a@gmail.com',email_verified:true}},{uid:'x',token:{email:'a@spohr.cl',email_verified:false}},{uid:'x',token:{email:'a@spohr.cl.evil.com',email_verified:true}}]) assert.throws(()=>requireSpiMember({auth}));
 for(const email of ['member@spohr.cl','member@spiamericas.com']) assert.equal(requireSpiMember({auth:{uid:'valid',token:{email,email_verified:true}}}).uid,'valid');
});
test('scanner counts irrelevant, failed and skipped documents separately; failures remain retryable',async()=>{
 const marked=[];const saved=[];
 const {runFullScan}=load('sources/scanner.js',{
  'firebase-admin':{firestore:()=>({collection:()=>({doc:_id=>({create:async data=>saved.push(data),update:async()=>{}})})})},
  './catalog':{getOfficialSources:async()=>[{id:'real',country:'CO',isActive:true},{id:'broken',country:'CO',isActive:true}]},
  './rssFetcher':{fetchSourceDocuments:async s=>{if(s.id==='broken')throw Error('HTTP 404');return {documents:['skipped','irrelevant','failed','relevant'].map(id=>({id,title:id,country:'CO'})),errors:[]};}},
  './deduplicator':{filterAlreadyProcessed:async()=>new Set(['skipped']),markAsProcessed:async id=>marked.push(id)},
  '../ai/geminiAnalyzer':{analyzeRegulatoryDocument:async d=>{if(d.id==='failed')throw Error('Vertex unavailable');return d.id==='relevant'?{id:'opportunity',isRelevant:true}:null;}}
 });
 const result=await runFullScan({countryFilter:'CO'});
 assert.equal(result.documentsFound,4);assert.equal(result.documentsSkipped,1);assert.equal(result.documentsAnalyzed,2);assert.equal(result.documentsFailed,1);assert.equal(result.opportunitiesFound,1);
 assert.equal(result.sourcesSucceeded,1);assert.equal(result.sourcesFailed,1);assert.deepEqual(marked,['irrelevant','relevant']);assert.equal(saved.length,1);
});
test('fetcher follows official article links and extracts content and publication date',async()=>{
 const calls=[];
 const {fetchSourceFeed}=load('sources/rssFetcher.js',{'./publicResource':{fetchPublicResource:async url=>{calls.push(url);return {url,contentType:'text/html',body:Buffer.from(calls.length===1?'<a href="/contact">Contact information and customer service</a><a href="/noticias/norma-real">Actualización de requisitos sanitarios para medicamentos</a>':`<meta property="og:title" content="Norma oficial"><meta property="article:published_time" content="2026-11-11T10:00:00Z"><main><p>${'Texto oficial sobre medicamentos. '.repeat(15)}</p></main>`)};}}});
 const docs=await fetchSourceFeed({id:'official',feedUrl:'https://agency.gov/noticias',country:'CO',entityName:'Agency',itemLinkPattern:'/noticias/.+'},2);
 assert.equal(calls.length,2);assert.equal(docs.length,1);assert.equal(docs[0].title,'Norma oficial');assert.equal(docs[0].publicationDate,'2026-11-11');assert.ok(docs[0].rawContent.includes('Texto oficial'));assert.equal(docs[0].sourceUrl,'https://agency.gov/noticias/norma-real');
});
test('fetcher reports HTTP errors instead of a successful empty scan',async()=>{
 const {fetchSourceFeed}=load('sources/rssFetcher.js',{'./publicResource':{fetchPublicResource:async()=>{throw Error('La fuente respondió HTTP 403.');}}});
 await assert.rejects(fetchSourceFeed({feedUrl:'https://agency.gov'},2),/HTTP 403/);
});


test('catalog excludes deleted sources and does not fall back to built-in sources',async()=>{
 let items=[];
 const {getOfficialSources}=load('sources/catalog.js',{'firebase-admin':{firestore:()=>({collection:()=>({get:async()=>({docs:items.map(item=>({id:item.id,data:()=>item}))})})})}});
 assert.equal((await getOfficialSources()).length,0);
 items=[{id:'kept',isActive:true},{id:'deleted',deletedAt:'2026-11-12',isActive:false}];
 assert.equal((await getOfficialSources()).length,1);assert.equal((await getOfficialSources())[0].id,'kept');
});

test('scanner uses the live catalog and skips paused sources',async()=>{
 const fetched=[];
 const {runFullScan}=load('sources/scanner.js',{
  'firebase-admin':{firestore:()=>({collection:()=>({doc:()=>({update:async()=>{}})})})},
  './catalog':{getOfficialSources:async()=>[{id:'new-source',country:'CL',isActive:true},{id:'paused',country:'CL',isActive:false},{id:'other-country',country:'CO',isActive:true}]},
  './rssFetcher':{fetchSourceDocuments:async source=>{fetched.push(source.id);return {documents:[],errors:[]};}},
  './deduplicator':{filterAlreadyProcessed:async()=>new Set()}
 });
 const result=await runFullScan({countryFilter:'CL'});
 assert.deepEqual(fetched,['new-source']);assert.equal(result.sourcesAttempted,1);
});

test('source validation rejects private URLs and unsafe addresses',()=>{
 const {publicSourceUrl,isPublicAddress}=require('../lib/sources/publicResource');
 for(const url of ['http://agency.gov/feed','https://localhost/feed','https://127.0.0.1/feed','https://169.254.169.254/','https://[::1]/','https://user:password@agency.gov/feed','https://agency.gov:8443/feed'])assert.throws(()=>publicSourceUrl(url));
 assert.equal(publicSourceUrl('https://agency.gov/feed#news').href,'https://agency.gov/feed');
 for(const ip of ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.1','169.254.169.254','::1','fe80::1','::ffff:127.0.0.1'])assert.equal(isPublicAddress(ip),false,ip);
 assert.equal(isPublicAddress('8.8.8.8'),true);
});

test('source management persists creates, pause and deletion; checks membership and duplicates',async()=>{
 const records=new Map();
 function ref(id){return {id,path:id};}
 function snapshot(id){return {id,ref:ref(id),exists:records.has(id),data:()=>records.get(id)};}
 const collection={doc:ref,where:(field,_op,value)=>({field,value})};
 const db={collection:()=>collection,runTransaction:async fn=>fn({
  get:async target=>target.field?{docs:[...records.keys()].filter(id=>records.get(id)[target.field]===target.value).map(snapshot)}:snapshot(target.id),
  set:(target,value)=>records.set(target.id,value),update:(target,value)=>records.set(target.id,{...records.get(target.id),...value})
 })};
 const admin={apps:[{}],firestore:()=>db};
 const {manageOfficialSource}=load('index.js',{
  'firebase-admin':admin,
  'firebase-functions/v2/https':{...require('firebase-functions/v2/https'),onCall:(_config,handler)=>handler,onRequest:(_config,handler)=>handler},
  'firebase-functions/v2/scheduler':{onSchedule:(_config,handler)=>handler}
 });
 const auth={uid:'spi-user',token:{email:'member@spiamericas.com',email_verified:true}};
 const source={name:'Agency official feed',entityName:'Agency',country:'CL',category:'sanitary',feedUrl:'https://agency.gov/feed',isActive:true};
 await assert.rejects(manageOfficialSource({data:{action:'create',source}}),/Inicia sesión/);
 const result=await manageOfficialSource({auth,data:{action:'create',source}});
 assert.equal(records.get(result.id).feedUrl,source.feedUrl);
 await assert.rejects(manageOfficialSource({auth,data:{action:'create',source}}),/ya está en el catálogo/);
 await manageOfficialSource({auth,data:{action:'setActive',id:result.id,isActive:false}});
 assert.equal(records.get(result.id).isActive,false);
 await manageOfficialSource({auth,data:{action:'delete',id:result.id}});
 assert.ok(records.get(result.id).deletedAt);
 const restored=await manageOfficialSource({auth,data:{action:'create',source}});
 assert.equal(restored.id,result.id);assert.equal(records.get(restored.id).deletedAt,undefined);
});


test('PDF bulletin links with short labels are extracted from their row context',async()=>{
 const {fetchSourceDocuments}=load('sources/rssFetcher.js',{'./publicResource':{fetchPublicResource:async url=>({url,contentType:'text/html',body:Buffer.from(url.endsWith('/list')?'<table><tr><td>Boletín 123 — 12/11/2026</td><td><a href="/Uploads/Boletines/123.pdf">Archivo adjunto</a></td></tr></table>':`<article>${'Texto completo del boletín oficial. '.repeat(15)}</article>`)})}});
 const result=await fetchSourceDocuments({id:'inpi',feedUrl:'https://agency.gov/list',entityName:'INPI',country:'AR'},2);
 assert.equal(result.documents.length,1);assert.equal(result.errors.length,0);assert.equal(result.documents[0].publicationDate,'2026-11-12');
});

test('one unreadable document does not discard the other documents of the source',async()=>{
 const {fetchSourceDocuments}=load('sources/rssFetcher.js',{'./publicResource':{fetchPublicResource:async url=>{
  if(url.endsWith('/bad'))throw Error('HTTP 403');
  return {url,contentType:'text/html',body:Buffer.from(url.endsWith('/list')?'<a href="/noticias/good">Normativa oficial con contenido verificable</a><a href="/noticias/bad">Documento oficial que no se puede descargar</a>':`<article>${'Texto legal consultado de la fuente. '.repeat(15)}</article>`)};
 }}});
 const result=await fetchSourceDocuments({id:'official',feedUrl:'https://agency.gov/list',country:'CO',entityName:'Agency'},2);
 assert.equal(result.documents.length,1);assert.equal(result.errors.length,1);
});

test('empty RSS and unavailable pages have different health states',async()=>{
 const {makeSourceHealth}=require('../lib/sources/health');
 const source={feedUrl:'https://agency.gov/feed'};
 assert.equal(makeSourceHealth(source,[]).status,'empty');
 assert.equal(makeSourceHealth(source,[],[],Error('HTTP 403')).status,'blocked');
 assert.equal(makeSourceHealth(source,[],[{url:'https://agency.gov/document',message:'HTTP 403'}]).status,'blocked');
 assert.equal(makeSourceHealth(source,[],[{url:'https://agency.gov/document',message:'El documento supera el límite de 15 MB.'}]).code,'size_limit');
 assert.equal(makeSourceHealth(source,[],[],Error('HTTP 404')).code,'not_found');
 assert.equal(makeSourceHealth(source,[],[],Error('unable to verify the first certificate')).code,'certificate_error');
 const {fetchSourceDocuments}=load('sources/rssFetcher.js',{'./publicResource':{fetchPublicResource:async url=>({url,contentType:'application/rss+xml',body:Buffer.from('<rss><channel></channel></rss>')})}});
 const result=await fetchSourceDocuments(source,2);assert.equal(result.documents.length,0);assert.equal(result.errors.length,0);
});


test('ANVISA uses its official JSON listing instead of the JavaScript placeholder',async()=>{
 const urls=[];
 const {fetchSourceDocuments}=load('sources/rssFetcher.js',{'./publicResource':{fetchPublicResource:async url=>{
  urls.push(url);
  const listing=url.includes('/++api++/');
  return {url,contentType:listing?'application/json':'text/html',body:Buffer.from(listing?JSON.stringify({items:[{'@id':'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2026/norma',title:'Norma oficial Anvisa',effective:'2026-11-12T12:00:00Z'}]}):`<article>${'Texto da nova norma publicada pela Anvisa. '.repeat(15)}</article>`)};
 }}});
 const result=await fetchSourceDocuments({id:'anvisa',feedUrl:'https://www.gov.br/anvisa/pt-br/comunicacao/noticias',entityName:'Anvisa',country:'BR'},2);
 assert.ok(urls[0].includes('/++api++/'));assert.equal(result.documents.length,1);assert.equal(result.documents[0].publicationDate,'2026-11-12');
});

test('scanner preserves readable documents and records partial source health',async()=>{
 const states=[];const saved=[];
 const {runFullScan}=load('sources/scanner.js',{
  'firebase-admin':{firestore:()=>({collection:()=>({doc:()=>({update:async state=>states.push(state),create:async data=>saved.push(data)})})})},
  './catalog':{getOfficialSources:async()=>[{id:'partial',feedUrl:'https://agency.gov',country:'CO',isActive:true}]},
  './rssFetcher':{fetchSourceDocuments:async()=>({documents:[{id:'readable',title:'Official document',sourceUrl:'https://agency.gov/document',publicationDate:'2026-11-12'}],errors:[{url:'https://agency.gov/broken',message:'HTTP 403'}]})},
  './deduplicator':{filterAlreadyProcessed:async()=>new Set(),markAsProcessed:async()=>{}},
  '../ai/geminiAnalyzer':{analyzeRegulatoryDocument:async()=>({id:'opportunity'})}
 });
 const result=await runFullScan({countryFilter:'CO'});
 assert.equal(result.sourcesFailed,1);assert.equal(result.sourcesSucceeded,0);assert.equal(result.documentsAnalyzed,1);assert.equal(saved.length,1);assert.equal(states[0].health.status,'partial');
});


test('listing links between www and the same apex domain are accepted',async()=>{
 const {fetchSourceDocuments}=load('sources/rssFetcher.js',{'./publicResource':{fetchPublicResource:async url=>({url,contentType:'text/html',body:Buffer.from(url==='https://www.agency.gov/list'?'<a href="https://agency.gov/noticias/documento">Documento oficial publicado por la agencia</a><a href="https://different.gov/noticias/documento">Documento de un dominio que no está en la fuente</a>':`<article>${'Texto del documento publicado por la agencia. '.repeat(15)}</article>`)})}});
 const result=await fetchSourceDocuments({id:'official',entityName:'Agency',country:'CL',feedUrl:'https://www.agency.gov/list'},2);
 assert.equal(result.documents.length,1);assert.equal(result.documents[0].sourceUrl,'https://agency.gov/noticias/documento');
});
