// Bounded real scan for initialization. Uses the operator's active gcloud session.
const admin=require('firebase-admin');
const {execFileSync}=require('node:child_process');
const {OAuth2Client}=require('google-auth-library');
const {VertexAI}=require('@google-cloud/vertexai');
const oauth=new OAuth2Client();
oauth.setCredentials({access_token:execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim(),expiry_date:Date.now()+3500000});
const vertex=new VertexAI({project:'spi-scanner',location:'global',apiEndpoint:'aiplatform.googleapis.com',googleAuthOptions:{authClient:oauth}});
const {analyzeRegulatoryDocument}=require('../lib/ai/geminiAnalyzer');
admin.initializeApp({projectId:'spi-scanner'});
const {runFullScan}=require('../lib/sources/scanner');
const {generateDailyExecutiveDigest}=require('../lib/ai/dailyDigest');
(async()=>{
 const db=admin.firestore();
 db.settings({authClient:oauth});
 const runRef=db.collection('scan_runs').doc();
 await runRef.set({status:'running',country:process.argv[2]||'CO',startedAt:new Date().toISOString(),initiatedBy:'initialization'});
 try {
  const result=await runFullScan({countryFilter:process.argv[2]||'CO',maxItemsPerSource:Math.min(5,Math.max(1,Number(process.argv[3])||3)),maxSources:1}, doc=>analyzeRegulatoryDocument(doc,vertex));
  const {newOpportunities,...summary}=result;
  await runRef.update({...summary,status:result.errors.length?'partial':'completed',finishedAt:new Date().toISOString()});
  if(result.sourcesSucceeded){
   const recent=await db.collection('regulatory_opportunities').where('lastUpdated','>=',new Date(Date.now()-86400000).toISOString()).get();
   const digest=await generateDailyExecutiveDigest(recent.docs.map(d=>d.data()),undefined,vertex);
   digest.totalScanned=result.documentsFound;
   digest.executiveBriefingText+=`\n\nCobertura de inicialización: ${process.argv[2]||'CO'}, ${result.sourcesSucceeded}/${result.sourcesAttempted} fuentes; ${result.documentsFound} documentos encontrados, ${result.documentsAnalyzed} analizados y ${result.documentsFailed} errores de análisis. No equivale a una revisión completa de todas las fuentes.`;
   await db.collection('daily_digests').doc(digest.id).set(digest);
  }
  console.log(JSON.stringify({runId:runRef.id,...summary,opportunities:newOpportunities.map(o=>({id:o.id,title:o.title,url:o.sourceUrl}))},null,2));
  if(result.errors.length)process.exitCode=1;
 } catch(error){await runRef.update({status:'failed',finishedAt:new Date().toISOString()});throw error;}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
