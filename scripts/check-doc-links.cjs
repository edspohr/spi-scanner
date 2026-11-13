const fs=require('node:fs');
const path=require('node:path');
const files=[];
function visit(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){if(['node_modules','.git','.local','.firebase','dist','lib'].includes(entry.name))continue;const file=path.join(directory,entry.name);if(entry.isDirectory())visit(file);else if(entry.name.endsWith('.md'))files.push(file);}}
visit('.');
const errors=[];
for(const file of files){const contents=fs.readFileSync(file,'utf8');for(const match of contents.matchAll(/\]\(([^)]+)\)/g)){
 const target=match[1].replace(/^<|>$/g,'').split(/\s+"/)[0];
 if(target.startsWith('file://')){errors.push(`${file}: nonportable file URL ${target}`);continue;}
 if(/^[a-z][a-z0-9+.-]*:/i.test(target)||target.startsWith('#'))continue;
 const location=decodeURIComponent(target.split('#')[0]);if(location&&!fs.existsSync(path.resolve(path.dirname(file),location)))errors.push(`${file}: missing ${location}`);
}}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Verified local links in ${files.length} Markdown files.`);
