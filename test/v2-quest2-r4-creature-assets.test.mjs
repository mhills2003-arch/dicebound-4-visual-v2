import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const moduleText=readFileSync('public/v2-premium-mine.mjs','utf8');
const appText=readFileSync('public/app.js','utf8');
const html=readFileSync('public/index.html','utf8');
const r4='v2-quest2-mine-creatures-20261103-r4';
test('Quest 2 r4 cache-busting is referenced from index through app and module',()=>{
 assert.ok(html.includes(r4));assert.ok(appText.includes(r4));
});
test('Quest 2 premium sprites all use new unique filenames',()=>{
 for(const slug of ['normal-d4','normal-d6','shiny-d4','shiny-d6','boss-d12']) {
  const filename=slug+'-q2r4.png';
  assert.ok(moduleText.includes(filename));
  const data=readFileSync('public/assets/premium-mine/'+filename);
  assert.equal(data.subarray(1,4).toString(),'PNG');
 }
});
test('Quest 2 creature sprite selection is preserved',()=>{
 assert.ok(moduleText.includes("if(boss&&p.faces===12&&ready('bossD12'))"));
 assert.ok(moduleText.includes("else if(shiny&&p.faces===4&&ready('shinyD4'))"));
 assert.ok(moduleText.includes("else if(shiny&&p.faces===6&&ready('shinyD6'))"));
 assert.ok(moduleText.includes("else if(kind==='enemy'&&p.faces===4&&ready('normalD4'))"));
 assert.ok(moduleText.includes("else if(kind==='enemy'&&p.faces===6&&ready('normalD6'))"));
});
