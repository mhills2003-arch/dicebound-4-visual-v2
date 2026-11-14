import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOM_WALLS} from '../src/engine.mjs';
import {MINE_ROOMS,MINE_WALL_BLUEPRINTS,MINE_SCENERY,initPremiumMine,paintPremiumMineConnectedWalls,paintPremiumMineWall} from '../public/v2-premium-mine.mjs';
class ImageStub{complete=true;naturalWidth=640;naturalHeight=640;}
for(const id of MINE_ROOMS)initPremiumMine(ImageStub,id);
const s={cell:60,originX:10,originY:20,iso:false,at(x,y){return{x:10+(x+.5)*60,y:20+(y+.5)*60}}};
function context(){return{draws:[],rects:[],save(){},restore(){},beginPath(){},clip(){},rect(...r){this.rects.push(r)},drawImage(img,...args){this.draws.push({src:img.src,args})},strokeRect(){throw new Error('Obstacle square outlines are forbidden')}};}
test('five mine scenes cover the unchanged server collision cells exactly once',()=>{
 for(const id of MINE_ROOMS){
  const walls=ROOM_WALLS[id].map(p=>p.join(',')),plan=MINE_SCENERY[id].flatMap(p=>p.cells.map(c=>c.join(',')));
  const blueprint=MINE_WALL_BLUEPRINTS[id].flatMap((row,y)=>[...row].flatMap((v,x)=>v==='#'?[`${x},${y}`]:[]));
  assert.deepEqual(new Set(blueprint),new Set(walls));assert.deepEqual(new Set(plan),new Set(walls));assert.equal(plan.length,walls.length);
  const seen=new Set(['0,3']),queue=[[0,3]];
  for(let i=0;i<queue.length;i++)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const x=queue[i][0]+dx,y=queue[i][1]+dy,key=`${x},${y}`;
   if(x<0||x>8||y<0||y>6||walls.includes(key)||seen.has(key))continue;
   seen.add(key);queue.push([x,y]);
  }
  assert.equal(seen.size,63-walls.length);assert(seen.has('8,3'));
 }
});
test('continuous scenery is clipped to blocked cells with no obstacle square outlines',()=>{
 for(const id of MINE_ROOMS){
  const c=context();assert(paintPremiumMineConnectedWalls(c,s,ROOM_WALLS[id],id));
  assert.equal(c.draws.length,MINE_SCENERY[id].length);
  assert.deepEqual(new Set(c.rects.map(([x,y])=>`${(x-10)/60},${(y-20)/60}`)),new Set(ROOM_WALLS[id].map(p=>p.join(','))));
  assert(paintPremiumMineWall(context(),s,1,1,id));
 }
});
test('a changed or duplicate wall set uses the per-cell fallback instead of misleading connected art',()=>{
 for(const id of MINE_ROOMS){
  const c=context(),walls=ROOM_WALLS[id];
  for(const altered of [walls.slice(1),[...walls,[0,0]],[walls[1],...walls.slice(1)]]){
   assert.equal(paintPremiumMineConnectedWalls(c,s,altered,id),false);assert.equal(c.draws.length,0);
  }
 }
});
test('assets load per room, shared images load once, and the scene waits for every critical prop',async()=>{
 const art=await import('../public/v2-premium-mine.mjs?loading-test'),images=[];
 class PendingImage extends ImageStub{constructor(){super();images.push(this)}set src(v){this.path=v;if(v.includes('ore-cart'))this.complete=false}get src(){return this.path}}
 art.initPremiumMine(PendingImage,'q2r1');assert(!art.premiumMineReady('q2r1'));assert(!art.premiumMineReady('q2r2'));
 assert(!images.some(i=>i.src.includes('hollow-ground')));
 assert.equal(art.paintPremiumMineConnectedWalls(context(),s,ROOM_WALLS.q2r1,'q2r1'),false);
 images.find(i=>i.src.includes('ore-cart')).complete=true;assert(art.premiumMineReady('q2r1'));
 const count=images.length;art.initPremiumMine(PendingImage,'q2r1');assert.equal(images.length,count);
 art.initPremiumMine(PendingImage,'q2r4');assert(art.premiumMineReady('q2r4'));
 assert.equal(images.filter(i=>i.src.includes('normal-d6')).length,1);
 assert.equal(images.filter(i=>i.src.includes('frame-left')).length,1);
});
