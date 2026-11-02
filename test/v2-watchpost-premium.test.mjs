import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {ROOM_DATA,ROOM_WALLS} from '../src/engine.mjs';
import {PREMIUM_ROOMS,PREMIUM_FILES,isPremiumWoodlandRoom,initPremiumWoodland,premiumWoodlandReady,
  paintPremiumWoodlandFloor,paintPremiumWoodlandWall,paintPremiumWoodlandActor} from '../public/v2-premium-woodland.mjs';
class ImageStub { constructor(){this.complete=true;this.naturalWidth=420;this.naturalHeight=420;this.src='stub'} }
initPremiumWoodland(ImageStub);
const ctx=()=>{
  let draw=[],labels=[];return {
   draw,labels,
   canvas:{width:1200,height:920},save(){},restore(){},beginPath(){},closePath(){},rect(){},clip(){},moveTo(){},lineTo(){},arc(){},ellipse(){},roundRect(){},stroke(){},strokeRect(){},fill(){},fillRect(){},translate(){},scale(){},drawImage(img,...args){draw.push([img?.src,...args])},strokeText(x){labels.push(x)},fillText(){},createRadialGradient(){return{addColorStop(){}}},createLinearGradient(){return{addColorStop(){}}}
  }
};
const s={iso:false,originX:40,originY:30,cell:85,at(x,y){return{x:40+(x+.5)*85,y:30+(y+.5)*85}}};

test('Old Watchpost is Quest 1 final room with exactly one authoritative Boss D8',()=>{
  assert.equal(ROOM_DATA.watchpost.quest,1);
  assert.equal(ROOM_DATA.watchpost.final,true);
  assert.deepEqual(ROOM_DATA.watchpost.foes,[{faces:8,variant:'boss'}]);
  assert.deepEqual(ROOM_WALLS.watchpost,[[2,1],[6,1],[2,2],[6,2],[2,4],[6,4],[2,5],[5,5],[6,5]]);
});
test('only Quest 1 has premium assets; old rooms and next quest remain isolated',()=>{
  assert.deepEqual(PREMIUM_ROOMS,['woodland','clearing','watchpost']);
  assert(isPremiumWoodlandRoom('watchpost'));assert.equal(isPremiumWoodlandRoom('q2r1'),false);
  for(const name of ['watchpost','watchpostRuinA','watchpostRuinB','watchpostBoss']){
    assert.equal(typeof PREMIUM_FILES[name],'string');
    assert(statSync(new URL('../public/'+PREMIUM_FILES[name].replace('./',''),import.meta.url)).size>15000,name);
  }
});
test('Watchpost paints unique forest floor and true blocked-square masonry, unchanged positions',()=>{
  assert(premiumWoodlandReady());
  const before=JSON.stringify(ROOM_WALLS.watchpost),c=ctx();
  assert(paintPremiumWoodlandFloor(c,s,'watchpost'));
  assert(c.draw.some(x=>x[0]===PREMIUM_FILES.watchpost));
  for(const [x,y] of ROOM_WALLS.watchpost)assert(paintPremiumWoodlandWall(c,s,x,y,'watchpost'));
  assert.equal(c.draw.length,ROOM_WALLS.watchpost.length+1);
  assert(c.draw.slice(1).every(x=>[PREMIUM_FILES.watchpostRuinA,PREMIUM_FILES.watchpostRuinB].includes(x[0])));
  assert.equal(JSON.stringify(ROOM_WALLS.watchpost),before);
});
test('live boss shows a D8 sprite, label, HP without changing combat properties',()=>{
  const p={id:'watchpost-e1',variant:'boss',faces:8,x:7,y:3,hp:6,maxHp:8};
  const before=JSON.stringify(p),c=ctx();
  assert(paintPremiumWoodlandActor(c,s,p,'enemy',new ImageStub(),{label:'Boss D8',roomId:'watchpost',motion:false}));
  assert(c.draw.some(x=>x[0]===PREMIUM_FILES.watchpostBoss));
  assert(c.labels.includes('Boss D8'));
  assert.equal(JSON.stringify(p),before);
});
test('new app and renderer receive unique cache-busting URLs without changing existing styles',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(html,/app\.js\?build=v2-quest1-watchpost-20261102-r1/);
 assert.match(app,/v2-premium-woodland\.mjs\?build=v2-quest1-watchpost-20261102-r1/);
 assert.match(html,/styles\.css\?build=v2-cinematic-search-keys-20261102-r1/);
});
