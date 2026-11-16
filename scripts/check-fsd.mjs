import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const layers=['app','pages','widgets','features','entities','shared'];
const problems=[];
async function visit(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())await visit(file);
  else if(/\.[tj]sx?$/.test(file)){
   const content=await readFile(file,'utf8');
   const from=path.relative('src',file).split(path.sep);const fromRank=layers.indexOf(from[0]);
   for(const match of content.matchAll(/(?:from\s*|import\s*\()\s*['"](@\/[^'"]+)['"]/g)){
    const to=match[1].slice(2).split('/');const toRank=layers.indexOf(to[0]);
    if(toRank<0)continue;
    const sameSlice=from[0]===to[0]&&from[1]===to[1];
    if(toRank<fromRank || (toRank===fromRank && from[0]!=='shared'&&!sameSlice)) problems.push(`${file}: invalid layer import ${match[1]}`);
    if(!sameSlice && to.length>2 && to[0]!=='shared')problems.push(`${file}: use slice public API: ${match[1]}`);
   }
  }
 }
}
await visit('src');
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log('FSD imports PASS: downward dependencies and slice public APIs.');
