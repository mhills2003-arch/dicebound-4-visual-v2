import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {ROOM_DATA,ROOM_WALLS} from '../src/engine.mjs';
import {MINE_ROOMS,MINE_FILES,initPremiumMine,premiumMineReady,isPremiumMineRoom,mineWallArt,
 paintPremiumMineFloor,paintPremiumMineLighting,paintPremiumMineWall,paintPremiumMineActor,
 paintPremiumMineAtmosphere,paintPremiumMineForeground} from '../public/v2-premium-mine.mjs';
class ImageStub{constructor(){this.complete=true;this.naturalWidth=420;this.naturalHeight=420;this.src='stub'}}
initPremiumMine(ImageStub);
function context(){const drawn=[],labels=[];const ctx={drawn,labels,
 save(){},restore(){},beginPath(){},closePath(){},rect(){},clip(){},moveTo(){},lineTo(){},ellipse(){},arc(){},roundRect(){},stroke(){},strokeRect(){},fill(){},fillRect(){},translate(){},scale(){},
 drawImage(image,...args){drawn.push([image?.src,...args])},strokeText(t){labels.push(t)},fillText(){},
 createRadialGradient(){return{addColorStop(){}}},createLinearGradient(){return{addColorStop(){}}}
 };return ctx}
const s={cell:70,originX:15,originY:12,iso:false,at(x,y){return{x:15+(x+.5)*70,y:12+(y+.5)*70}}};
test('Quest 2 is the five correct existing Easy rooms with unchanged encounters',()=>{
 assert.deepEqual(MINE_ROOMS,['q2r1','q2r2','q2r3','q2r4','q2r5']);
 assert.deepEqual(MINE_ROOMS.map(id=>ROOM_DATA[id].name),['Abandoned Mine','Crystal Hollow','Glittering Gallery','Miners’ Vault','Crystal Heart']);
 assert.equal(ROOM_DATA.q2r2.foes[0].variant,'shiny');assert.equal(ROOM_DATA.q2r2.foes[0].faces,4);
 assert(ROOM_DATA.q2r3.foes.some(e=>e.variant==='shiny'&&e.faces===6));
 assert(ROOM_DATA.q2r5.foes.some(e=>e.variant==='boss'&&e.faces===12));
 assert(ROOM_DATA.q2r5.foes.some(e=>e.variant==='shiny'&&e.faces===6));
 assert.equal(ROOM_DATA.q2r5.final,true);
});
test('five distinct background images, real environment props and dice sprites are packaged',()=>{
 assert.equal(Object.keys(MINE_FILES).length,17);
 for(const [key,path] of Object.entries(MINE_FILES)){
  assert.match(path,/^\.\/assets\/premium-mine\//);
  assert(statSync(new URL('../public/'+path.slice(2),import.meta.url)).size>1000,key);
 }
 for(const id of MINE_ROOMS)assert(premiumMineReady(id));
 assert(!isPremiumMineRoom('woodland'));assert(!isPremiumMineRoom('q3r1'));
});
test('five floor and wall types use original authoritative blocked cells, never mutate them',()=>{
 for(const id of MINE_ROOMS){
  const before=JSON.stringify(ROOM_WALLS[id]),ctx=context();
  assert(paintPremiumMineFloor(ctx,s,id));
  assert(paintPremiumMineLighting(ctx,s,ROOM_WALLS[id],id));
  for(const [x,y] of ROOM_WALLS[id]){
   assert(['rubble','timber','cyan','amber','amethyst'].includes(mineWallArt(id,x,y)));
   assert(paintPremiumMineWall(ctx,s,x,y,id));
  }
  assert(paintPremiumMineAtmosphere(ctx,s,id,5000,false));
  assert(paintPremiumMineForeground(ctx,s,[],5000,false,id));
  assert.equal(ctx.drawn.length,1+ROOM_WALLS[id].length);
  assert.equal(ctx.drawn[0][0],MINE_FILES[id]);
  assert.equal(JSON.stringify(ROOM_WALLS[id]),before);
 }
});
test('shiny and boss graphics display live names/HP, without modifying combat objects',()=>{
 for(const [id,variant,faces,expected] of [['q2r2','shiny',4,MINE_FILES.shinyD4],['q2r3','shiny',6,MINE_FILES.shinyD6],['q2r5','boss',12,MINE_FILES.bossD12]]){
  const p={id:'enemy',x:5,y:3,faces,variant,name:`D${faces}`,hp:faces,maxHp:faces*2};
  const snap=JSON.stringify(p),ctx=context();
  assert(paintPremiumMineActor(ctx,s,p,'enemy',new ImageStub(),{label:`D${faces}`,roomId:id,motion:false}));
  assert(ctx.drawn.some(x=>x[0]===expected));
  assert(ctx.labels.includes(`D${faces}`));
  assert.equal(JSON.stringify(p),snap);
 }
});
test('ordinary D4/D6 creatures have matching die faces, not misleading D8 portraits',()=>{
 for(const [faces,asset] of [[4,MINE_FILES.normalD4],[6,MINE_FILES.normalD6]]){
  const ctx=context();const p={x:4,y:3,variant:'normal',faces,hp:faces,maxHp:faces};
  assert(paintPremiumMineActor(ctx,s,p,'enemy',new ImageStub(),{roomId:'q2r1',motion:false}));
  assert(ctx.drawn.some(x=>x[0]===asset));
 }
});
test('Quest 2 is frontend-only, with unique cache-busting and no networking or input',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const mod=readFileSync(new URL('../public/v2-premium-mine.mjs',import.meta.url),'utf8');
 assert.match(app,/premiumMineActive=\(\)=>artActive\(\)&&isPremiumMineRoom\(me\?\.room\)&&view==='tactical'&&premiumMineReady\(me\?\.room\)/);
 assert.match(app,/paintPremiumMineActor\(ctx,s,a.p,a.kind,baseSprite,visualOptions\)/);
 assert.match(html,/app\.js\?build=v2-quest1-watchpost-20261102-r1&mine=v2-quest2-mine-20261102-r1/);
 assert.match(app,/v2-premium-mine\.mjs\?build=v2-quest2-mine-20261102-r1/);
 assert.doesNotMatch(mod,/\bsend\(|\bfetch\(|new WebSocket\(|localStorage\.|\baddEventListener\(/);
});
