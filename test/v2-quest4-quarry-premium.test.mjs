import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {ROOM_WALLS,ROOM_DATA} from '../src/engine.mjs';
import {QUARRY_ROOMS,QUARRY_FILES,QUARRY_WALL_BLUEPRINTS,quarryWallsMatch,
 initPremiumQuarry,premiumQuarryReady,paintPremiumQuarryConnectedWalls,
 isPremiumQuarryRoom,paintPremiumQuarryActor} from '../public/v2-premium-quarry.mjs';
const root=new URL('../',import.meta.url);
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
function filename(path){return new URL('../public/'+path.replace(/^\.\//,''),import.meta.url);}
function wallsFor(rows){return rows.flatMap((r,y)=>[...r].flatMap((c,x)=>c==='#'?[[x,y]]:[]));}
test('Q4 five existing room definitions and enemy waves remain unchanged',()=>{
 const expected=[
  [['normal',6]], [['large',4],['shiny',4]], [['large-shiny',4]],
  [['normal',6],['normal',8]], [['large-shiny',4]]
 ];
 for(let i=0;i<5;i++){
  const id=`q4r${i+1}`;
  assert(isPremiumQuarryRoom(id));
  assert.equal(ROOM_DATA[id].quest,4);
  assert.deepEqual(ROOM_DATA[id].foes.map(e=>[e.variant,e.faces]),expected[i]);
 }
});
test('Q4 artwork matches server authoritative obstacle squares exactly',()=>{
 assert.equal(QUARRY_ROOMS.length,5);
 for(const id of QUARRY_ROOMS){
  const rows=QUARRY_WALL_BLUEPRINTS[id];
  assert.equal(rows.length,7);assert(rows.every(row=>row.length===9));
  const cells=wallsFor(rows);
  assert.deepEqual(new Set(cells.map(([x,y])=>`${x},${y}`)),
   new Set(ROOM_WALLS[id].map(([x,y])=>`${x},${y}`)));
  assert(quarryWallsMatch(cells,id));
  assert(!quarryWallsMatch([[0,0]],id));
 }
});
test('all standalone premium quarry room images are bundled and valid',()=>{
 for(const [key,path] of Object.entries(QUARRY_FILES)){
  assert(existsSync(filename(path)),`${key}: ${path}`);
  const data=readFileSync(filename(path));
  if(path.endsWith('.png'))assert.equal(data.subarray(1,4).toString('ascii'),'PNG');
  else if(path.endsWith('.jpg'))assert.equal(data.subarray(0,2).toString('hex'),'ffd8');
 }
});
test('one missing OPTIONAL Q4 image never disables all Q4 floors',()=>{
 class ImageStub{
  complete=true;naturalWidth=512;naturalHeight=512;
  set src(value){this.url=value;if(value.includes('d8-q4r1.png'))this.naturalWidth=0;}
 }
 initPremiumQuarry(ImageStub);
 for(const id of QUARRY_ROOMS)assert(premiumQuarryReady(id));
});
test('Q4 wall overlays are conditional on live collision map being identical',()=>{
 const ctx={count:0,save(){},restore(){},drawImage(){this.count++;}};
 const s={iso:false,cell:100,originX:0,originY:0};
 for(const id of QUARRY_ROOMS){
  const before=ctx.count;
  assert.equal(paintPremiumQuarryConnectedWalls(ctx,s,wallsFor(QUARRY_WALL_BLUEPRINTS[id]),id),true);
  assert.equal(ctx.count,before+(id==='q4r1'?0:1));
  assert.equal(paintPremiumQuarryConnectedWalls(ctx,s,[[0,0]],id),false);
  assert.equal(ctx.count,before+(id==='q4r1'?0:1));
 }
});
test('Q4 app integration is visual only and does not alter network/quest rules',()=>{
 const mod=readFileSync(new URL('../public/v2-premium-quarry.mjs',import.meta.url),'utf8');
 assert.match(app,/premiumQuarryActive/);assert.match(app,/paintPremiumQuarryConnectedWalls/);
 assert.match(app,/paintPremiumQuarryActor/);assert.match(app,/paintCinematicQuarrySurround/);
 assert.match(app,/QUEST 4 THE GLITTERING GIANTS R1/);
 assert.doesNotMatch(mod,/new WebSocket\(|fetch\(|localStorage\.|send\(\{type:/);
 const original=readFileSync(new URL('../src/engine.mjs',import.meta.url),'utf8');
 assert.match(original,/q4r3: \[/);
});

test('Quarry Entrance single-board scene is exact-geometry and only used on matched walls',()=>{
 const mod=readFileSync(new URL('../public/v2-premium-quarry.mjs',import.meta.url),'utf8');
 assert.match(mod,/q4r1Scene/);
 assert.match(mod,/fullScene=id==='q4r1'&&quarryWallsMatch\(walls,id\)/);
 assert.match(app,/paintPremiumQuarryFloor\(ctx,s,me.room,state.roomWalls\?\.\[me.room\]\|\|\[\]\)/);
 assert(existsSync(filename(QUARRY_FILES.q4r1Scene)));
});


test('Grade A Q4 Entrance is a single clean scene with playable west and east exits',()=>{
 const rows=QUARRY_WALL_BLUEPRINTS.q4r1;
 const pass=(x,y)=>x>=0&&x<9&&y>=0&&y<7&&rows[y][x]==='.';
 const queue=[[0,3]], visited=new Set(['0,3']);
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];
  for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
   if(pass(nx,ny)&&!visited.has(`${nx},${ny}`)){visited.add(`${nx},${ny}`);queue.push([nx,ny]);}
  }
 }
 assert(visited.has('8,3'),'east exit must be reachable');
 assert(visited.has('7,3'),'enemy approach must be reachable');
 assert.equal(visited.size,rows.join('').split('').filter(c=>c==='.' ).length,'all open cells connected');
 assert.match(QUARRY_FILES.q4r1Scene,/grade-a-r2\.jpg$/);
 const file=readFileSync(filename(QUARRY_FILES.q4r1Scene));
 assert(file.length>500000,'premium scene image is full-resolution');
});
