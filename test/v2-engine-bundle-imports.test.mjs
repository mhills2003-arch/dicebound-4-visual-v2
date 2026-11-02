import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
const src=path.resolve(fileURLToPath(new URL('../src/',import.meta.url)));
test('every internal named Worker import exists, preventing Wrangler missing-export regressions',async()=>{
 const source=fs.readFileSync(path.join(src,'worker.mjs'),'utf8');
 const maze=fs.readFileSync(path.join(src,'maze-play.mjs'),'utf8');
 for(const content of [source,maze]){
  const imports=[...content.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"](\.\/[^'"]+)['"]/gs)];
  for(const [,names,rel]of imports){
   const filename=rel+'.'.repeat(0);
   const moduleName=path.join(src,filename);
   const exported=await import(pathToFileURL(moduleName).href);
   for(const name of names.split(',').map(v=>v.trim().split(' as ')[0]))
    assert.ok(Object.hasOwn(exported,name),`Missing export ${name} in ${rel}`);
  }
 }
});
