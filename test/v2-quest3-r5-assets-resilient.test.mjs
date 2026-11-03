import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {GIANT_ROOMS,GIANT_FILES,GIANT_FRAMES} from '../public/v2-premium-giantwood.mjs';
const assets={...GIANT_FILES,...GIANT_FRAMES};
test('self-contained Q3 visual assets all exist in deployment package',()=>{
 for(const [key,source] of Object.entries(assets)) {
  const path=new URL('../public/'+source.slice(2),import.meta.url);
  assert(statSync(path).size>9000, `Absent ${key} at ${source}`);
 }
 assert(GIANT_ROOMS.every(id=>GIANT_FILES[id].includes('q3r5.jpg')));
});
test('Q3 floor remains premium even if an optional wall or creature fails to load',async()=>{
 const m=await import('../public/v2-premium-giantwood.mjs?probe='+Date.now());
 class ImageStub { complete=true; naturalWidth=512; naturalHeight=512; set src(v){this._src=v;if(v.includes('premium-moss-boulder')||v.includes('boss-d12'))this.naturalWidth=0;} get src(){return this._src;} }
 m.initPremiumGiant(ImageStub);
 for(const id of GIANT_ROOMS)assert(m.premiumGiantReady(id),`Floor ${id} must work despite absent prop`);
});
test('Q3 premium floor can fall back to original URL when new image missing',async()=>{
 const m=await import('../public/v2-premium-giantwood.mjs?fallback='+Date.now());
 class ImageStub {complete=true;naturalWidth=512;naturalHeight=512;set src(v){this._src=v;if(v.includes('-ground-q3r5.jpg'))this.naturalWidth=0;}get src(){return this._src;}}
 m.initPremiumGiant(ImageStub);
 for(const id of GIANT_ROOMS)assert(m.premiumGiantReady(id));
});
test('Q3 preserved R3 boss art and R5 cache-safe app entrypoint',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const m=readFileSync(new URL('../public/v2-premium-giantwood.mjs',import.meta.url),'utf8');
 assert.match(app,/QUEST 3 GIANTWOOD R5 FULL ASSET RECOVERY/);
 assert.match(app,/isPremiumGiantRoom\(me.room\)\)\)/);
 assert.match(html,/q3=v2-quest3-giantwood-r5/);
 assert.match(m,/boss-d12-q3r3\.png/);
 assert.match(m,/boss\?2\.20/);
});
