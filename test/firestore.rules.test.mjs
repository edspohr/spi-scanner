import {before,after,beforeEach,test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc} from 'firebase/firestore';

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run npm run test:rules. This suite requires the local Firestore emulator.');
const [host,port]=process.env.FIRESTORE_EMULATOR_HOST.split(':');
let environment;
before(async()=>{
  environment=await initializeTestEnvironment({projectId:'demo-spi-scanner',firestore:{host,port:Number(port),rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
});
after(async()=>{await environment?.cleanup();});
beforeEach(async()=>{
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async context=>{
    for(const collection of ['regulatory_opportunities','official_sources','team_members','daily_digests','scan_runs','processed_documents','scanner_state'])await setDoc(doc(context.firestore(),collection,'synthetic'),{title:'Synthetic test record'});
  });
});
const member=(email='member@spiamericas.com',verified=true)=>environment.authenticatedContext('synthetic-member',{email,email_verified:verified}).firestore();

test('anonymous clients cannot read or write business data',async()=>{
  const db=environment.unauthenticatedContext().firestore();
  for(const collection of ['regulatory_opportunities','official_sources','team_members','daily_digests','scan_runs','processed_documents']){
    await assertFails(getDoc(doc(db,collection,'synthetic')));
    await assertFails(setDoc(doc(db,collection,'new'),{title:'Synthetic mutation'}));
  }
});
for(const domain of ['spiamericas.com','spohr.cl'])test(`verified ${domain} members can read and manage opportunities`,async()=>{
  const db=member(`member@${domain}`);
  await assertSucceeds(getDoc(doc(db,'regulatory_opportunities','synthetic')));
  await assertSucceeds(setDoc(doc(db,'regulatory_opportunities','new'),{title:'Synthetic opportunity',status:'nueva'}));
  await assertSucceeds(getDoc(doc(db,'team_members','synthetic')));
});
test('unverified email cannot access the application data',async()=>{
  await assertFails(getDoc(doc(member('member@spiamericas.com',false),'regulatory_opportunities','synthetic')));
});
test('lookalike and unauthorized domains are rejected',async()=>{
  for(const email of ['member@example.org','member@evilspiamericas.com','member@spohr.cl.example.org'])await assertFails(getDoc(doc(member(email),'regulatory_opportunities','synthetic')));
});
test('catalog is readable but mutations require the callable backend',async()=>{
  const db=member();await assertSucceeds(getDoc(doc(db,'official_sources','synthetic')));
  await assertFails(setDoc(doc(db,'official_sources','new'),{name:'Synthetic source'}));
});
test('reports, scans and deduplication records are read only for members',async()=>{
  const db=member();
  for(const collection of ['daily_digests','scan_runs','processed_documents']){
    await assertSucceeds(getDoc(doc(db,collection,'synthetic')));
    await assertFails(setDoc(doc(db,collection,'new'),{title:'Synthetic mutation'}));
  }
});
test('scanner locks and unknown collections are inaccessible to clients',async()=>{
  const db=member();
  for(const collection of ['scanner_state','unknown_collection']){
    await assertFails(getDoc(doc(db,collection,'synthetic')));
    await assertFails(setDoc(doc(db,collection,'new'),{title:'Synthetic mutation'}));
  }
});
