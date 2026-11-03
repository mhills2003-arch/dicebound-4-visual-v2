import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {ROOM_WALLS} from '../src/engine.mjs';
import {
 PREMIUM_ROOM,PREMIUM_FILES,initPremiumWoodland,premiumWoodlandReady,
 woodlandObstacleArt,paintPremiumWoodlandFloor,paintPremiumWoodlandGroundLighting,paintPremiumWoodlandWall,paintPremiumWoodlandAtmosphere,paintPremiumWoodlandContactShadow
} from '../public/v2-premium-woodland.mjs';
function mockCtx(){const operations=[];const ctx={
 save(){},restore(){},beginPath(){},closePath(){},rect(){},clip(){},moveTo(){},lineTo(){},arc(){},translate(){},scale(){},fill(){operations.push('light-shape')},stroke(){operations.push('stroke')},strokeRect(){operations.push('outline')},fillRect(){operations.push('fill')},
 drawImage(img,...args){operations.push(['asset',img.src,args])},createRadialGradient(){return{addColorStop(){}}},createLinearGradient(){return{addColorStop(){}}}
};return{ctx,operations}}
const s={cell:60,originX:12,originY:14,iso:false,at(x,y){return{x:12+(x+.5)*60,y:14+(y+.5)*60}}};
test('premium floor consists of independent image assets, not a baked image with UI and enemies',()=>{
 assert.equal(PREMIUM_ROOM,'woodland');
 assert.equal(Object.keys(PREMIUM_FILES).length,12);
 for(const path of Object.values(PREMIUM_FILES)){
  assert.match(path,/^\.\/assets\/premium-woodland\//);
  const file=new URL('../public/'+path.slice(2),import.meta.url);
  assert(statSync(file).size>15000);
 }
});
test('premium room renderer derives props only from the canonical wall coordinates',()=>{
 class MockImage{constructor(){this.complete=true;this.naturalWidth=256;this.src=''}}
 initPremiumWoodland(MockImage);
 assert.equal(premiumWoodlandReady(),true);
 const walls=ROOM_WALLS.woodland.map(([x,y])=>[x,y]),snapshot=JSON.stringify(walls);
 const {ctx,operations}=mockCtx();
 assert(paintPremiumWoodlandFloor(ctx,s));
 assert(paintPremiumWoodlandGroundLighting(ctx,s,walls));
 for(const [x,y] of walls)assert(paintPremiumWoodlandWall(ctx,s,x,y));
 assert(paintPremiumWoodlandAtmosphere(ctx,s));
 assert(paintPremiumWoodlandContactShadow(ctx,s,{x:1,y:3},'one'));
 assert.equal(operations.filter(x=>Array.isArray(x)&&x[0]==='asset').length,1+walls.length);
 assert.equal(operations.filter(x=>x==='outline').length,walls.length);
 assert.equal(JSON.stringify(walls),snapshot);
 assert.deepEqual([...new Set(walls.map(([x,y])=>woodlandObstacleArt(x,y)))].sort(),[...new Set(walls.map(([x,y])=>woodlandObstacleArt(x,y)))].sort());
});
test('Quest 1 premium stays scoped to woodland rooms even when Quest 2 premium is present',()=>{
 const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(js,/premiumActive=\(\)=>artActive\(\)&&isPremiumWoodlandRoom\(me\?\.room\)&&view==='tactical'&&premiumWoodlandReady\(\)/);
 assert.match(js,/if\(premiumActive\(\)\)\{paintPremiumWoodlandFloor\(ctx,s,me.room\);if\(woodlandLightActive\(\)\)paintPremiumWoodlandGroundLighting/);
 assert.match(js,/if\(premiumActive\(\)\)paintPremiumWoodlandWall\(ctx,s,x,y,me.room\)/);
 assert.match(js,/if\(premiumActive\(\)\)paintPremiumWoodlandAtmosphere/);
 assert.match(js,/if\(woodlandLightActive\(\)&&!integrated\)\{if\(premiumMineActive\(\)\)paintPremiumMineContactShadow\(ctx,s,a\.p\);else paintPremiumWoodlandContactShadow/);
 assert.match(js,/if\(!premium\)/);
 const mod=readFileSync(new URL('../public/v2-premium-woodland.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/\bsend\(|\bfetch\(|new WebSocket\(|localStorage\.|\baddEventListener\(/);
});
