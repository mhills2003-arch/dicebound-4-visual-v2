import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_WALLS} from '../src/engine.mjs';
import {initPremiumWoodland,paintPremiumWoodlandGroundLighting,paintPremiumWoodlandAtmosphere,paintPremiumWoodlandContactShadow} from '../public/v2-premium-woodland.mjs';
class MockImage{constructor(){this.complete=true;this.naturalWidth=300;this.src=''}}
initPremiumWoodland(MockImage);
function tracker(){
 const events=[];
 const ctx={save(){events.push('save')},restore(){events.push('restore')},beginPath(){},closePath(){},rect(){},clip(){},arc(){events.push('arc')},moveTo(){},lineTo(){},translate(){},scale(){},fill(){events.push('fill')},fillRect(){events.push('fillRect')},createRadialGradient(){events.push('radial');return{addColorStop(){}}},createLinearGradient(){events.push('linear');return{addColorStop(){}}}};
 return {ctx,events};
}
const s={originX:0,originY:4,cell:70,iso:false,at(x,y){return {x:(x+.5)*70,y:4+(y+.5)*70}}};
test('light passes are finite, deterministic, and only read existing obstacle positions',()=>{
 const walls=ROOM_WALLS.woodland.map(p=>[...p]);const snapshot=JSON.stringify(walls);
 const one=tracker(),two=tracker();
 assert.equal(paintPremiumWoodlandGroundLighting(one.ctx,s,walls),true);
 assert.equal(paintPremiumWoodlandGroundLighting(two.ctx,s,walls),true);
 assert.deepEqual(one.events,two.events);
 assert.equal(JSON.stringify(walls),snapshot);
 assert(one.events.filter(x=>x==='radial').length>40);
 assert(two.events.includes('linear'));
});
test('atmospheric shafts stay within Canvas state and do not depend on actor state',()=>{
 const {ctx,events}=tracker();
 assert.equal(paintPremiumWoodlandAtmosphere(ctx,s),true);
 assert.equal(events[0],'save');assert.equal(events.at(-1),'restore');
 assert(events.filter(x=>x==='radial').length>=20);
});
test('contact shadows accept all four player IDs, do not edit player positions or draw tokens',()=>{
 for(const kind of ['one','two','three','four','enemy']){
   const player={x:1,y:3,hp:50};const snap=JSON.stringify(player);const {ctx,events}=tracker();
   assert.equal(paintPremiumWoodlandContactShadow(ctx,s,player,kind),true);
   assert.equal(JSON.stringify(player),snap);
   assert.equal(events.filter(e=>e==='radial').length,2);
 }
 const m=tracker();assert.equal(paintPremiumWoodlandContactShadow(m.ctx,{...s,iso:true},{x:1,y:3}),false);
 assert.equal(paintPremiumWoodlandGroundLighting(m.ctx,{...s,iso:true},ROOM_WALLS.woodland),false);
});
test('lighting stays confined to premium Woodland Path tactical renderer',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/premiumActive=\(\)=>artActive\(\)&&me\?\.room==='woodland'&&view==='tactical'&&premiumWoodlandReady\(\)/);
 assert.match(app,/paintPremiumWoodlandGroundLighting\(ctx,s,state\.roomWalls\?\.\[me\.room\]\|\|\[\]\)/);
 assert.match(app,/if\(woodlandLightActive\(\)\)paintPremiumWoodlandContactShadow/);
 assert.match(app,/if\(premiumActive\(\)\)paintPremiumWoodlandAtmosphere/);
 assert.match(app,/const woodlandLightActive=\(\)=>premiumActive\(\)\&\&woodlandLightingEnabled/);
 assert.match(app,/woodlandLightingToggle\.addEventListener\('click'/);
 const mod=readFileSync(new URL('../public/v2-premium-woodland.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/\b(send|fetch|localStorage|WebSocket|addEventListener)\s*\(/);
});

test('light switch reproduces original atmosphere when disabled',()=>{
 const {ctx,events}=tracker();
 assert(paintPremiumWoodlandAtmosphere(ctx,s,false));
 assert.equal(events.filter(e=>e==='radial').length,2);
 assert.equal(paintPremiumWoodlandContactShadow(ctx,s,{x:1,y:3},'enemy'),true);
});
