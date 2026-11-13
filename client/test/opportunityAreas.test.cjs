const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../src/utils/opportunityAreas.ts'),'utf8');
const exportsForTest = {};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:exportsForTest});
const {getPracticeArea,groupByPracticeArea,areaFromHash,areaHash} = exportsForTest;

test('IP matters affecting regulated industries stay with the IP team',()=>{
  assert.equal(getPracticeArea({sectors:['intellectual_property','pharma','medical_devices']}),'intellectual_property');
  assert.equal(getPracticeArea({sectors:['pharma','medical_devices']}),'regulatory');
  assert.equal(getPracticeArea({sectors:['intellectual_property']}),'intellectual_property');
});
test('general view contains every opportunity once, separated by practice area',()=>{
  const opportunities=[{id:'health',sectors:['pharma']},{id:'ip',sectors:['intellectual_property','pharma']},{id:'food',sectors:['food_beverages']}];
  const groups=groupByPracticeArea(opportunities);
  assert.equal(groups.regulatory.length,2);assert.equal(groups.intellectual_property.length,1);
  assert.equal(new Set([...groups.regulatory,...groups.intellectual_property].map(item=>item.id)).size,opportunities.length);
});
test('each area can be bookmarked and restored independently',()=>{
  for(const area of ['all','regulatory','intellectual_property'])assert.equal(areaFromHash(areaHash(area)),area);
  assert.equal(areaFromHash('#unknown'),'all');
});
