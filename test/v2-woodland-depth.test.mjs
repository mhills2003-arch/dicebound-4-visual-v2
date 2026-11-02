import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {ROOM_WALLS} from '../src/engine.mjs';
import {
  initPremiumWoodland,premiumWoodlandReady,PREMIUM_FILES,
  WOODLAND_FOREGROUND_POSITIONS,paintPremiumWoodlandUnderbrush,
  paintPremiumWoodlandForeground,paintPremiumWoodlandForestLife
} from '../public/v2-premium-woodland.mjs';
class MockImage {constructor(){this.complete=true;this.naturalWidth=256;this.src=''}}
initPremiumWoodland(MockImage);
function spy(){
  const log=[];
  const ctx={save(){log.push('save')},restore(){log.push('restore')},beginPath(){},rect(){},clip(){},translate(){},rotate(){},ellipse(){},fill(){log.push('leaf')},drawImage(img,...args){log.push(['image',img.src,args])}};
  return {ctx,log};
}
const s={cell:64,originX:32,originY:20,iso:false,at(x,y){return{x:32+(x+.5)*64,y:20+(y+.5)*64}}};
const walls=ROOM_WALLS.woodland.map(p=>[...p]);
const actors=[{p:{x:1,y:3,hp:50},kind:'one'},{p:{x:5,y:3,hp:6},kind:'enemy'}];
test('foreground uses independent transparent assets alongside the approved art',()=>{
  assert(premiumWoodlandReady());
  assert.equal(PREMIUM_FILES.canopyA,'./assets/premium-woodland/canopy-a.png');
  assert.equal(PREMIUM_FILES.canopyB,'./assets/premium-woodland/canopy-b.png');
  for(const name of ['canopy-a.png','canopy-b.png'])assert(statSync(new URL('../public/assets/premium-woodland/'+name,import.meta.url)).size>2000);
  assert(WOODLAND_FOREGROUND_POSITIONS.length>=8);
});
test('underbrush uses only real walls, no new room geometry or actor changes',()=>{
  const snapshot=JSON.stringify({walls,actors});const a=spy(),b=spy();
  assert.equal(paintPremiumWoodlandUnderbrush(a.ctx,s,walls,12345,true),true);
  assert.equal(paintPremiumWoodlandUnderbrush(b.ctx,s,walls,12345,true),true);
  assert.deepEqual(a.log,b.log);
  assert(a.log.filter(v=>Array.isArray(v)).length>=3);
  assert.equal(JSON.stringify({walls,actors}),snapshot);
});
test('foreground fades near actors, keeps every Canvas save/restore balanced',()=>{
  const a=spy(),b=spy();const original=JSON.stringify(actors);
  assert.equal(paintPremiumWoodlandForeground(a.ctx,s,actors,22345,true),true);
  assert.equal(paintPremiumWoodlandForeground(b.ctx,s,actors,22345,true),true);
  assert.deepEqual(a.log,b.log);
  assert.equal(a.log.filter(v=>v==='save').length,a.log.filter(v=>v==='restore').length);
  assert.equal(JSON.stringify(actors),original);
});
test('animated forest life is optional and can be disabled for reduced motion',()=>{
  const a=spy(),b=spy();
  assert.equal(paintPremiumWoodlandForestLife(a.ctx,s,actors,10000,true),true);
  assert.equal(paintPremiumWoodlandForestLife(b.ctx,s,actors,10000,true),true);
  assert.deepEqual(a.log,b.log);assert(a.log.filter(v=>v==='leaf').length>=10);
  const staticSpy=spy();
  assert.equal(paintPremiumWoodlandForestLife(staticSpy.ctx,s,actors,10000,false),false);
  assert.equal(staticSpy.log.length,0);
  assert.equal(paintPremiumWoodlandForeground(spy().ctx,{...s,iso:true},actors,0),false);
  assert.equal(paintPremiumWoodlandUnderbrush(spy().ctx,{...s,iso:true},walls,0),false);
});
test('V2 integration draws underbrush below units and foreground above; not in other rooms',()=>{
  const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(app,/premiumActive=\(\)=>artActive\(\)&&isPremiumWoodlandRoom\(me\?\.room\)&&view==='tactical'&&premiumWoodlandReady\(\)/);
  assert.match(app,/woodlandDepthEnabled=localStorage\.getItem\('db4_v2_woodland_depth'\)/);
  assert.match(app,/matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(app,/woodlandDepthToggle\.addEventListener\('click'/);
  assert.match(app,/paintPremiumWoodlandUnderbrush\(ctx,s,state\.roomWalls\?\.\[me\.room\]\|\|\[\]/);
  assert.match(app,/paintPremiumWoodlandForeground\(ctx,s,actors/);
  assert.match(app,/paintPremiumWoodlandForestLife\(ctx,s,actors/);
  const underbrush=app.indexOf('paintPremiumWoodlandUnderbrush(ctx,s,state.roomWalls');
  const units=app.indexOf('for(const a of actors)');
  const foreground=app.indexOf('paintPremiumWoodlandForeground(ctx,s,actors');
  assert(underbrush>0&&underbrush<units&&units<foreground);
  const renderer=readFileSync(new URL('../public/v2-premium-woodland.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(renderer,/\b(send|fetch|localStorage|WebSocket|addEventListener)\s*\(/);
});
