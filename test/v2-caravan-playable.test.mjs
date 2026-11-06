import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import {ROOM_DATA,ROOM_WALLS,freshState,clearLine,resetTestAdventure} from '../src/engine.mjs';
import {ensureCaravanTrialPlayer} from '../src/caravan-trial.mjs';
import {CARAVAN_SCENERY,CARAVAN_WALLS,CARAVAN_SPAWNS} from '../public/v2-caravan-layout.mjs';
import * as art from '../public/v2-premium-desert.mjs';
const wallSet=new Set(ROOM_WALLS.q5r1.map(p=>p.join(',')));
function route(start,end,blocked=new Set()){
 const q=[[...start,0]],seen=new Set([start.join(',')]);
 for(let i=0;i<q.length;i++){const[x,y,d]=q[i];if(end&&x===end[0]&&y===end[1])return d;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,k=`${X},${Y}`;
   if(X<0||X>12||Y<0||Y>8||wallSet.has(k)||blocked.has(k)||seen.has(k))continue;
   seen.add(k);q.push([X,Y,d+1]);}}
 return end?Infinity:seen;
}
test('Caravan Gate meets the obstacle/enemy densities with one footprint shared by art and collision',()=>{
 assert.equal(ROOM_WALLS.q5r1.length,32);assert.equal(wallSet.size,32);
 assert(32/117>=.25&&32/117<=.30);assert.equal(ROOM_DATA.q5r1.foes.length,7);
 assert(117/7>=15&&117/7<=20);
 assert.deepEqual(new Set(CARAVAN_WALLS.map(p=>p.join(','))),wallSet);
 assert.equal(CARAVAN_SCENERY.flatMap(p=>p.cells).length,32);
});
test('all 85 floor cells are reachable; a short central route and longer outer flanks survive',()=>{
 assert.equal(route([0,4]).size,85);
 const direct=route([0,4],[12,4]);assert.equal(direct,14);
 for(const via of [[7,0],[7,8]]){
  const flank=route([0,4],via)+route(via,[12,4]);assert(Number.isFinite(flank));assert(flank>direct);
 }
 assert(Number.isFinite(route([0,4],[12,4],new Set(['8,3','8,4','8,5']))),'blocking the central opening must leave another route');
 assert(!clearLine('q5r1',1,4,11,4),'the well breaks the direct firing line');
 assert(clearLine('q5r1',6,0,11,0),'the upper flank remains open');
});
test('seven enemies spawn at the authored positions; Swift guards cover both flanks',()=>{
 const s=freshState();ensureCaravanTrialPlayer(s,'one','Tester');
 const enemies=s.rooms.q5r1.battle.enemies;
 assert.deepEqual(enemies.map(e=>[e.x,e.y]),CARAVAN_SPAWNS);
 assert.equal(new Set(enemies.map(e=>`${e.x},${e.y}`)).size,7);
 assert(enemies.every(e=>!wallSet.has(`${e.x},${e.y}`)&&route([0,4]).has(`${e.x},${e.y}`)));
 const swift=enemies.filter(e=>e.role==='swift');assert.equal(swift.length,2);assert(swift.some(e=>e.y>=6));
});
test('separate test starts at 5-1 with a usable hero; reconnect preserves progress and does not duplicate gear',()=>{
 const s=freshState(),p=ensureCaravanTrialPlayer(s,'one','Tester');
 assert.equal(p.room,'q5r1');assert.equal(p.level,6);assert.equal(p.inventory.potions.length,3);
 assert.equal(p.inventory.equipment.filter(i=>i.rarity==='Rare').length,2);
 p.gold=42;p.hp=70;const gear=JSON.stringify(p.inventory);
 ensureCaravanTrialPlayer(s,'one','Tester');assert.equal(p.gold,42);assert.equal(p.hp,70);assert.equal(JSON.stringify(p.inventory),gear);
 for(const id of ['two','three','four'])ensureCaravanTrialPlayer(s,id,id);
 assert.equal(new Set(Object.values(s.players).map(p=>`${p.x},${p.y}`)).size,4);
 assert.equal(s.rooms.q5r1.battle.enemies.length,7);
 const reset=resetTestAdventure(s);for(const id of Object.keys(reset.players))ensureCaravanTrialPlayer(reset,id,id);
 assert.equal(reset.players.one.level,6);assert.equal(reset.rooms.q5r1.battle.enemies.length,7);
 const ordinary=freshState();assert.equal(ordinary.unlockedQuest,1);assert(!ordinary.caravanTrial);
});
class ImageStub {complete=true;naturalWidth=640;naturalHeight=640;}
art.initPremiumDesert(ImageStub);
function ctx(){const draws=[],rects=[];return{draws,rects,save(){},restore(){},beginPath(){},clip(){},rect(...r){rects.push(r)},translate(){},rotate(){},scale(){},drawImage(img,...args){draws.push({src:img.src,args})},getTransform(){return{a:1}}};}
test('desert art draws seven scenery pieces clipped to exactly the 32 blocked cells, with no obstacle stroke',()=>{
 const c=ctx(),s={cell:60,originX:10,originY:20};
 assert(art.paintPremiumDesertWalls(c,s,ROOM_WALLS.q5r1,'q5r1'));
 assert.equal(c.draws.length,7);assert.equal(c.rects.length,33);
 assert.deepEqual(new Set(c.rects.slice(1).map(([x,y])=>`${(x-10)/60},${(y-20)/60}`)),wallSet);
 for(const path of Object.values(art.DESERT_FILES)){
  const file=new URL('../public/'+path.replace('./',''),import.meta.url);assert(existsSync(file),path);
  const bytes=readFileSync(file);assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
});
test('premium pass waits for all assets so an unloaded obstacle can never disappear',async()=>{
 const delayed=await import('../public/v2-premium-desert.mjs?delayed');
 class PendingImage extends ImageStub {set src(v){this.path=v;if(v.includes('well'))this.complete=false;}get src(){return this.path}}
 delayed.initPremiumDesert(PendingImage);assert(!delayed.premiumDesertReady('q5r1'));
 assert.equal(delayed.paintPremiumDesertWalls(ctx(),{cell:60},ROOM_WALLS.q5r1,'q5r1'),false);
 assert(!art.premiumDesertReady('q5r2'));
});
test('authenticated Caravan trial is routed to its own persistent world, separate from both previous saves',async()=>{
 const sandbox={Request,Response,Headers,URL,TextEncoder,TextDecoder,Uint8Array,Date,crypto:webcrypto,btoa,atob,DurableObject:class{}};
 const source=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8').replace(/^import .+;\s*$/gm,'').replace('export default {','globalThis.worker={').replace('export class GameRoom extends DurableObject','class GameRoom extends DurableObject');
 runInNewContext(source,sandbox);const names=[],headers=[];
 const env={INVITE_TOKEN_1:'A'.repeat(36),INVITE_TOKEN_2:'B'.repeat(36),COOKIE_SECRET:'C'.repeat(48),V2_GAME_ROOM:{idFromName(n){names.push(n);return n},get(){return{fetch(r){headers.push(r.headers.get('x-dicebound-trial'));return new Response('OK')}}}}};
 const login=await sandbox.worker.fetch(new Request('https://test.example/dicebound-v2/api/login',{method:'POST',headers:{Origin:'https://test.example','content-type':'application/x-www-form-urlencoded'},body:'code='+env.INVITE_TOKEN_1}),env);
 const cookie=login.headers.get('set-cookie').split(';')[0];
 for(const suffix of ['','?trial=balance-v9','?trial=caravan-q5-r1']){
  const r=await sandbox.worker.fetch(new Request('https://test.example/dicebound-v2/api/ws'+suffix,{headers:{cookie,Upgrade:'websocket','x-dicebound-trial':'caravan-q5-r1'}}),env);assert.equal(r.status,200);
 }
 assert.deepEqual(names,['quest-01-two-player-prototype','quest-v9-balance-trial','quest-v2-caravan-q5-r1']);
 assert.deepEqual(headers,[null,'balance-v9','caravan-q5-r1']);
 const denied=await sandbox.worker.fetch(new Request('https://test.example/dicebound-v2/api/ws?trial=caravan-q5-r1',{headers:{Upgrade:'websocket'}}),env);
 assert.equal(denied.status,401);assert.equal(names.length,3);
});
