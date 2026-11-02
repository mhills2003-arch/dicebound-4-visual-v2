import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {initPremiumWoodland,paintPremiumWoodlandActor} from '../public/v2-premium-woodland.mjs';
import {ROOM_WALLS} from '../src/engine.mjs';
class ImageStub { constructor(){this.complete=true;this.naturalWidth=355;this.src='stub'} }
initPremiumWoodland(ImageStub);
function spy(){
 const calls=[];
 const ctx={save(){calls.push('save')},restore(){calls.push('restore')},translate(){},scale(){},beginPath(){},arc(){},ellipse(){calls.push('ellipse')},roundRect(){calls.push('roundRect')},stroke(){},fill(){},fillRect(...p){calls.push(['fillRect',...p])},drawImage(img,...p){calls.push(['sprite',img?.src,...p])},strokeText(s){calls.push(['label',s])},fillText(){},createRadialGradient(){return{addColorStop(){}}}};
 return {ctx,calls};
}
const s={cell:70,originX:30,originY:22,iso:false,at(x,y){return{x:30+(x+.5)*70,y:22+(y+.5)*70}}};
const sprite=new ImageStub();
test('illustrated actor uses existing transparent original sprite assets',()=>{
 for(const name of ['gary.png','outlaw.png','d8.png']){
  const file=new URL('../public/assets/'+name,import.meta.url);
  assert(statSync(file).size>2000);
 }
 const png=readFileSync(new URL('../public/assets/gary.png',import.meta.url));
 assert.equal(png.toString('ascii',1,4),'PNG');
 assert.equal(png[25],6,'source PNG should be an RGBA sprite');
});
test('actor compositor paints silhouette, label and enemy HP without framed tile',()=>{
 for(const kind of ['one','two','three','four','enemy']){
  const {ctx,calls}=spy();const player={x:2,y:3,hp:5,maxHp:10,name:'Test',faces:6};
  const original=JSON.stringify(player),walls=JSON.stringify(ROOM_WALLS.woodland);
  assert.equal(paintPremiumWoodlandActor(ctx,s,player,kind,sprite,{label:kind==='enemy'?'D6':'Test',timeMs:5000}),true);
  assert.equal(calls.filter(x=>x[0]==='sprite').length,1);
  assert(calls.some(x=>Array.isArray(x)&&x[0]==='label'&&x[1]===(kind==='enemy'?'D6':'Test')));
  assert.equal(calls.filter(x=>x==='save').length,calls.filter(x=>x==='restore').length);
  assert.equal(JSON.stringify(player),original);
  assert.equal(JSON.stringify(ROOM_WALLS.woodland),walls);
 }
});
test('2x2 enemy sprite supports selection and preserves server coordinates',()=>{
 const enemy={x:3,y:2,hp:2,maxHp:7,faces:8,variant:'large'};
 const {ctx,calls}=spy();
 assert(paintPremiumWoodlandActor(ctx,s,enemy,'enemy',sprite,{selected:true,light:false,motion:false}));
 assert(calls.filter(x=>x==='ellipse').length>=1);
 assert(calls.some(x=>Array.isArray(x)&&x[0]==='sprite'));
 assert.deepEqual([enemy.x,enemy.y],[3,2]);
});
test('safe fallback outside premium tactical scene, no image, no coordinates',()=>{
 for(const args of [[{...s,iso:true},{x:2,y:2},sprite],[s,{x:2,y:2},null],[s,{x:NaN,y:2},sprite]]){
  const {ctx,calls}=spy();
  assert.equal(paintPremiumWoodlandActor(ctx,args[0],args[1],'one',args[2]),false);
  assert.equal(calls.length,0);
 }
});
test('V2 integrates in-world sprites only for premium Woodland Path and keeps toggle and fallback',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/premiumActive=\(\)=>artActive\(\)&&isPremiumWoodlandRoom\(me\?\.room\)&&view==='tactical'&&premiumWoodlandReady\(\)/);
 assert.match(app,/woodlandCharactersToggle\.addEventListener\('click'/);
 assert.match(app,/if\(!drew\)iconAt\(/);
 assert.match(app,/paintPremiumWoodlandActor\(ctx,s,a\.p,a\.kind,images\[/);
 const mod=readFileSync(new URL('../public/v2-premium-woodland.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/\bsend\(|\bfetch\(|WebSocket\(|localStorage\.|\baddEventListener\(/);
});
