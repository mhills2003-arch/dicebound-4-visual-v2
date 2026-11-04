import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {ROOM_WALLS,ROOM_DATA,doorRow} from '../src/engine.mjs';
import {QUARRY_FILES,QUARRY_WALL_BLUEPRINTS,quarryWallsMatch,paintPremiumQuarryFloor,paintPremiumQuarryConnectedWalls,initPremiumQuarry} from '../public/v2-premium-quarry.mjs';
const rooms=['q4r2','q4r3','q4r4','q4r5'];
function reachable(id){
 const rows=QUARRY_WALL_BLUEPRINTS[id],ok=(x,y)=>x>=0&&x<9&&y>=0&&y<7&&rows[y][x]==='.';
 const queue=[[0,3]],seen=new Set(['0,3']);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;
  if(ok(nx,ny)&&!seen.has(k)){seen.add(k);queue.push([nx,ny]);}
 }}return seen;
}
test('four new Quest 4 rooms have complete premium battlefield sources',()=>{
 for(const id of rooms){
  const rel=QUARRY_FILES[id+'Scene'];assert(rel?.endsWith('r3.jpg'));
  const path=new URL('../public/'+rel.replace(/^\.\//,''),import.meta.url);
  assert(statSync(path).size>300000,id+' image too small');
  const buf=readFileSync(path);assert.equal(buf.subarray(0,2).toString('hex'),'ffd8');
 }
});
test('new visual wall footprints match the authoritative maps and keep exits open',()=>{
 for(const id of rooms){
  const rows=QUARRY_WALL_BLUEPRINTS[id],expected=rows.flatMap((r,y)=>[...r].flatMap((c,x)=>c==='#'?[[x,y]]:[]));
  assert.equal(rows.length,7);assert(rows.every(r=>r.length===9));
  assert(quarryWallsMatch(ROOM_WALLS[id],id));
  assert.deepEqual(new Set(expected.map(p=>p.join(','))),new Set(ROOM_WALLS[id].map(p=>p.join(','))));
  assert(rows[3][0]==='.'&&rows[3][8]==='.',id+' exit corridor');
  const seen=reachable(id);assert(seen.has('8,3'),id+' east-side reachable');
  assert.equal(seen.size,63-expected.length,id+' floor connectivity');
  assert.equal(ROOM_DATA[id].quest,4);
 }
});
test('premium scenes paint once, never double the rock obstacle layer',()=>{
 class Img{complete=true;naturalWidth=1152;naturalHeight=896;set src(v){this.url=v;}}
 initPremiumQuarry(Img);
 const calls=[];const ctx={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},drawImage(...args){calls.push(args)},set imageSmoothingEnabled(v){},set imageSmoothingQuality(v){}};
 const s={originX:0,originY:0,cell:100,iso:false};
 for(const id of rooms){
  const before=calls.length;
  assert(paintPremiumQuarryFloor(ctx,s,id,ROOM_WALLS[id]));
  assert.equal(calls.length,before+1,id+' floor once');
  assert(paintPremiumQuarryConnectedWalls(ctx,s,ROOM_WALLS[id],id));
  assert.equal(calls.length,before+1,id+' no duplicated walls');
 }
});
