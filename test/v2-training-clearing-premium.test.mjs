import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {ROOM_WALLS,ROOM_DATA} from '../src/engine.mjs';
import {PREMIUM_ROOMS,PREMIUM_FILES,isPremiumWoodlandRoom,initPremiumWoodland,premiumWoodlandReady,
  paintPremiumWoodlandFloor,paintPremiumWoodlandWall,paintPremiumWoodlandGroundLighting,
  paintPremiumWoodlandAtmosphere,paintPremiumWoodlandActor} from '../public/v2-premium-woodland.mjs';
class ImageStub { constructor(){this.complete=true;this.naturalWidth=1152;this.naturalHeight=896;this.src='stub'} }
initPremiumWoodland(ImageStub);
const walls=ROOM_WALLS.clearing;
const s={cell:60,originX:20,originY:19,iso:false,at(x,y){return{x:20+(x+.5)*60,y:19+(y+.5)*60}}};
function spy(){
 const calls=[];
 const ctx={canvas:{width:800,height:580},save(){calls.push('save')},restore(){calls.push('restore')},beginPath(){},closePath(){},rect(){},clip(){},moveTo(){},lineTo(){},arc(){},ellipse(){},roundRect(){},stroke(){calls.push('stroke')},strokeRect(){calls.push('wall-outline')},fill(){},fillRect(){},translate(){},scale(){},drawImage(img,...coords){calls.push(['image',img?.src,...coords])},strokeText(x){calls.push(['label',x])},fillText(){},createRadialGradient(){return{addColorStop(){}}},createLinearGradient(){return{addColorStop(){}}}};
 return {ctx,calls};
}
test('1-2 is precisely the authoritative Training Clearing room with two D6 creatures',()=>{
 assert.equal(ROOM_DATA.clearing.quest,1);assert.equal(ROOM_DATA.clearing.encounter.length,2);
 assert.deepEqual(ROOM_DATA.clearing.encounter,[6,6]);
 assert.equal(new Set(walls.map(a=>a.join(','))).size,walls.length);
 assert.notDeepEqual(walls,ROOM_WALLS.woodland,'1-2 must use its own wall positions');
});
test('premium renderer supports all three Quest 1 rooms and stops at Quest 2',()=>{
 assert.deepEqual(PREMIUM_ROOMS,['woodland','clearing','watchpost']);
 for(const id of ['woodland','clearing','watchpost'])assert(isPremiumWoodlandRoom(id));
 for(const id of ['q2r1','q15r8','camp','__proto__',null])assert.equal(isPremiumWoodlandRoom(id),false);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/premiumActive=\(\)=>artActive\(\)&&isPremiumWoodlandRoom\(me\?\.room\)&&view==='tactical'&&premiumWoodlandReady\(\)/);
 assert.match(app,/paintPremiumWoodlandFloor\(ctx,s,me\.room\)/);
 assert.match(app,/paintPremiumWoodlandWall\(ctx,s,x,y,me\.room\)/);
 assert.match(app,/paintPremiumWoodlandAtmosphere\(ctx,s,woodlandLightingEnabled,me\.room\)/);
});
test('1-2 displays independent painted clearing ground and the real obstacle silhouettes',()=>{
 assert(premiumWoodlandReady());
 assert.equal(PREMIUM_FILES.clearing,'./assets/premium-woodland/training-clearing-ground.jpg');
 assert(statSync(new URL('../public/assets/premium-woodland/training-clearing-ground.jpg',import.meta.url)).size>100000);
 const orig=JSON.stringify(walls),{ctx,calls}=spy();
 assert(paintPremiumWoodlandFloor(ctx,s,'clearing'));
 assert(calls[0]==='save');
 assert(calls.some(x=>Array.isArray(x)&&x[1]===PREMIUM_FILES.clearing));
 assert(paintPremiumWoodlandGroundLighting(ctx,s,walls,'clearing'));
 const beforeWallAssets=calls.filter(x=>Array.isArray(x)&&x[0]==='image').length;
 for(const [x,y] of walls)assert(paintPremiumWoodlandWall(ctx,s,x,y,'clearing'));
 assert.equal(calls.filter(x=>Array.isArray(x)&&x[0]==='image').length-beforeWallAssets,walls.length);
 assert.equal(calls.filter(x=>x==='wall-outline').length,walls.length);
 assert(paintPremiumWoodlandAtmosphere(ctx,s,true,'clearing'));
 assert.equal(JSON.stringify(walls),orig);
 assert.equal(calls.filter(x=>x==='save').length,calls.filter(x=>x==='restore').length);
});
test('D6 encounter units draw independent real-position sprites and live labels, no baked health bars',()=>{
 const p={id:'clearing-e1',x:5,y:3,name:'D6',faces:6,hp:3,maxHp:6,variant:'normal'};
 const snapshot=JSON.stringify(p),{ctx,calls}=spy();
 assert(paintPremiumWoodlandActor(ctx,s,p,'enemy',new ImageStub(),{label:'D6',selected:true,timeMs:0,roomId:'clearing'}));
 assert(calls.some(x=>x[0]==='image'&&x.length===10),'source crop excludes old embedded HUD');
 assert(calls.some(x=>x[0]==='label'&&x[1]==='D6'));
 assert.equal(JSON.stringify(p),snapshot);
});
