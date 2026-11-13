const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const exportsForTest={};
const source=fs.readFileSync(path.join(__dirname,'../src/utils/opportunityPriorities.ts'),'utf8');
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:exportsForTest});
const {getNextDeadline,matchesPriority,priorityCounts}=exportsForTest;
const today=new Date(2026,10,13,12);
const opportunity=overrides=>({status:'nueva',urgency:'medium',...overrides});

test('attention includes urgent and upcoming or overdue matters, excluding closed matters',()=>{
  for(const urgency of ['critical','high'])assert.equal(matchesPriority(opportunity({urgency}),'attention',today),true);
  assert.equal(matchesPriority(opportunity({transitionalDeadline:'2026-12-13'}),'attention',today),true);
  assert.equal(matchesPriority(opportunity({transitionalDeadline:'2026-12-14'}),'attention',today),false);
  assert.equal(matchesPriority(opportunity({commentsDeadline:'2026-11-12'}),'attention',today),true);
  assert.equal(matchesPriority(opportunity({status:'cerrada',urgency:'critical',transitionalDeadline:'2026-11-12'}),'attention',today),false);
});
test('only actual, valid deadline dates produce a next deadline',()=>{
  assert.equal(getNextDeadline(opportunity({effectiveDate:'2026-11-14'}),today),null);
  assert.equal(getNextDeadline(opportunity({commentsDeadline:'No aplica',transitionalDeadline:'2026-02-30'}),today),null);
  const deadline=getNextDeadline(opportunity({commentsDeadline:'2026-11-16',transitionalDeadline:'2026-11-20'}),today);
  assert.equal(deadline.date,'2026-11-16');assert.equal(deadline.label,'Comentarios');assert.equal(deadline.daysRemaining,3);
  assert.equal(getNextDeadline(opportunity({commentsDeadline:'2026-11-12',transitionalDeadline:'2026-11-20'}),today).date,'2026-11-20');
});
test('unassigned and in-progress reflect ownership and open workflow status',()=>{
  assert.equal(matchesPriority(opportunity({}),'unassigned',today),true);
  assert.equal(matchesPriority(opportunity({status:'cerrada'}),'unassigned',today),false);
  assert.equal(matchesPriority(opportunity({assignedTo:{id:'member'}}),'unassigned',today),false);
  for(const status of ['en_evaluacion','asignada','contactando_clientes'])assert.equal(matchesPriority(opportunity({status}),'in_progress',today),true);
  assert.equal(matchesPriority(opportunity({status:'cerrada'}),'in_progress',today),false);
});
test('priority counters match filters and count closed matters only in the complete overview',()=>{
  const items=[opportunity({urgency:'critical'}),opportunity({status:'en_evaluacion',assignedTo:{id:'member'}}),opportunity({status:'cerrada',urgency:'critical'})];
  const counts=priorityCounts(items,today);
  assert.equal(counts.all,3);assert.equal(counts.attention,1);assert.equal(counts.unassigned,1);assert.equal(counts.in_progress,1);
  for(const key of ['all','attention','unassigned','in_progress'])assert.equal(counts[key],items.filter(item=>matchesPriority(item,key,today)).length);
});
