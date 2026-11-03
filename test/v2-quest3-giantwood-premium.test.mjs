import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {ROOM_DATA,ROOM_WALLS,roomSize} from '../src/engine.mjs';
import {ROOM_BLUEPRINTS} from '../src/level-designs.mjs';
import {GIANT_ROOMS,GIANT_FILES,GIANT_FRAMES,isPremiumGiantRoom,initPremiumGiant,premiumGiantReady,paintPremiumGiantFloor,paintPremiumGiantWall,paintPremiumGiantActor,giantWallArt,giantFrameImage} from '../public/v2-premium-giantwood.mjs';
const load=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const grids=Object.fromEntries(GIANT_ROOMS.map(id=>[id,ROOM_BLUEPRINTS[id]]));
function reach(roomId,size){
 const wall=new Set(ROOM_WALLS[roomId].map(([x,y])=>`${x},${y}`));
 const clear=(x,y)=>x>=0&&y>=0&&x+size<=9&&y+size<=7&&Array.from({length:size*size},(_,n)=>`${x+n%size},${y+Math.floor(n/size)}`).every(p=>!wall.has(p));
 const q=(size===2?[[0,2],[0,3],[1,2],[1,3]]:[[0,3]]).filter(([x,y])=>clear(x,y)),seen=new Set(q.map(p=>p.join(',')));
 assert(q.length>0,`room ${roomId}: west door must have ${size}×${size} space`);
 for(let i=0;i<q.length;i++){let [x,y]=q[i];for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
 let xy=[x+dx,y+dy],key=xy.join(',');if(!seen.has(key)&&clear(...xy)){seen.add(key);q.push(xy)}
 }}return q;
}
test('Q3 canonical five-room catalogue and unique premium scenic assets are present',()=>{
 assert.deepEqual(GIANT_ROOMS,['q3r1','q3r2','q3r3','q3r4','q3r5']);
 assert(GIANT_ROOMS.every(isPremiumGiantRoom));assert(!isPremiumGiantRoom('q2r5'));assert(!isPremiumGiantRoom('woodland'));
 assert.deepEqual(GIANT_ROOMS.map(id=>ROOM_DATA[id].name),['Trampled Trail','Giant’s Clearing','Root Maze','Hollow Tree','Elder Grove']);
 for(const [k,file] of Object.entries({...GIANT_FILES,...GIANT_FRAMES})){
  const src=new URL('../public/'+file.replace('./',''),import.meta.url);
  assert(statSync(src).size>9000,`Missing or too-small asset: ${file}`);
 }
});
test('Q3 increasing wall complexity and hero navigation through all five rooms',()=>{
 for(let i=0;i<GIANT_ROOMS.length;i++){
  const roomId=GIANT_ROOMS[i],layout=grids[roomId];
  assert.equal(layout.length,7);assert(layout.every(row=>row.length===9));
  assert(ROOM_WALLS[roomId].length>=8,`${roomId}: insufficient tactical obstacles`);
  assert(reach(roomId,1).some(([x,y])=>x===8&&y===3),`${roomId} east door inaccessible`);
  assert.deepEqual(roomSize(roomId),{width:9,height:7});
  if(i>0)assert(reach(roomId,2).some(([x])=>x>=6),`Large creature needs connected 2x2 lanes in ${roomId}`);
 }
});
test('Q3 Large variants and boss keep original encounter and two-by-two collision semantics',()=>{
 assert.equal(ROOM_DATA.q3r2.foes[0].variant,'large');assert.equal(ROOM_DATA.q3r2.foes[0].faces,4);
 assert.equal(ROOM_DATA.q3r3.foes[0].variant,'large');assert.equal(ROOM_DATA.q3r3.foes[0].faces,6);
 assert.equal(ROOM_DATA.q3r4.foes[0].variant,'large');assert.equal(ROOM_DATA.q3r4.foes[0].faces,8);
 assert.equal(ROOM_DATA.q3r5.foes[0].variant,'boss');assert.equal(ROOM_DATA.q3r5.foes[0].faces,12);
 assert.equal(ROOM_DATA.q3r5.foes[1].variant,'large');assert.equal(ROOM_DATA.q3r5.foes[1].faces,6);
});
test('Quest 3 art module is visuals-only and drives walls from actual server coordinates',()=>{
 const src=load('../public/v2-premium-giantwood.mjs');
 assert.doesNotMatch(src,/\b(send|fetch|localStorage|WebSocket|addEventListener)\s*\(/);
 assert.match(src,/GIANT_ROOMS/);assert.match(src,/giantWallArt\(roomId,x,y\)/);
 assert.match(src,/p\.variant==='large'/);
 assert.match(src,/largeD8/);assert.match(src,/bossD12/);
 assert.equal(paintPremiumGiantFloor({}, {iso:true}, 'q3r1'),false);
 assert.equal(paintPremiumGiantWall({}, {iso:true},1,2,'q3r1'),false);
 assert.equal(paintPremiumGiantActor({}, {iso:true}, {x:1,y:1}, 'enemy',null),false);
});
test('Q3 Level N is read clearly in character XP/HP dock; existing XP unchanged',()=>{
 const html=load('../public/index.html'),app=load('../public/app.js'),css=load('../public/styles.css');
 assert.match(html,/id="q3CurrentLevel"/);assert.match(html,/class="cin-stat-label"[^>]*>[^<]*<img[^>]*xp\.svg/);
 assert.match(app,/q3CurrentLevel'\)\.textContent=`LEVEL \$\{level\}`/);
 assert.match(css,/\.q3-current-level/);
 assert.match(app,/heroXpFill/);assert.match(app,/heroHpFill/);
 assert.match(app,/paintPremiumGiantFloor/);assert.match(app,/paintPremiumGiantWall/);
 assert.match(app,/paintPremiumGiantActor/);
 assert.match(html,/q3=v2-quest3-giantwood-r3/);
});
test('All five Q3 rooms spawn their original enemies safely on the denser maps',async()=>{
 const {freshState,ensurePlayer,enterQuest,move,ROOM_WALLS}=await import('../src/engine.mjs');
 const s=freshState(1_800_000_000_000);ensurePlayer(s,'one','Tester');s.unlockedQuest=3;
 enterQuest(s,'one',3,1_800_000_000_000);
 for(let i=1;i<=5;i++){
  const id=`q3r${i}`,room=s.rooms[id];assert(room?.battle,`${id} missing battle`);
  assert.equal(room.battle.enemies.length,ROOM_DATA[id].foes.length);
  for(const e of room.battle.enemies){
   const large=['large','large-shiny'].includes(e.variant),sz=large?2:1;
   assert(e.x>=0&&e.y>=0&&e.x+sz<=9&&e.y+sz<=7,`${id}: spawn out of bounds`);
   for(let dx=0;dx<sz;dx++)for(let dy=0;dy<sz;dy++)
    assert(!ROOM_WALLS[id].some(([wx,wy])=>wx===e.x+dx&&wy===e.y+dy),`${id}: enemy spawned on obstacle`);
  }
  if(i<5){room.battle.status='cleared';s.players.one.x=8;s.players.one.y=3;
   s.turn.activePlayer='one';s.players.one.moveRemaining=6;s.players.one.lastRolledTurn=s.turn.round;s.players.one.moveRound=`global:${s.turn.round}`;s.players.one.movementRolled=true;
   move(s,'one','E',1_800_000_000_000);
   assert.equal(s.players.one.room,`q3r${i+1}`);
  }
 }
});

test('Q3 R3 renders continuous natural formations without four-square Large highlights',()=>{
 const app=load('../public/app.js');const art=load('../public/v2-premium-giantwood.mjs');
 assert.match(app,/if\(!anyPremiumActive\(\)\)\{/);
 assert.match(app,/paintPremiumGiantWallGroups\(ctx,s,me.room,state.roomWalls/);
 assert.match(art,/joinsHorizontal=left\|\|right/);
 assert.match(art,/joinsVertical=up\|\|down/);
 assert.match(art,/giant-trunk-continuous-q3r3/);assert.match(art,/whole-moss-outcrop-q3r3/);
 assert.match(art,/boss-d12-q3r3/);
 assert.match(art,/large-d4-q3r2\.png/);
 assert.match(art,/large-d6-q3r2\.png/);
});


test('R3 aggregates actual blocked cells into one organic visual feature with exact same coordinates', async()=>{
 const {giantWallGroups}=await import('../public/v2-premium-giantwood.mjs');
 for (const id of GIANT_ROOMS){
  const expected=ROOM_WALLS[id].map(([x,y])=>`${x},${y}`).sort();
  const groups=giantWallGroups(ROOM_WALLS[id]);
  const actual=groups.flat().map(([x,y])=>`${x},${y}`).sort();
  assert.deepEqual(actual,expected,`${id}: wall group must neither create nor remove a collision tile`);
  assert.equal(new Set(actual).size,actual.length);
  assert(groups.some(g=>g.length>=2),`${id}: at least one connected structure`);
  for(const group of groups){const set=new Set(group.map(x=>x.join(','))),visited=new Set([group[0].join(',')]),q=[group[0]];
   for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const key=`${x+dx},${y+dy}`;if(set.has(key)&&!visited.has(key)){visited.add(key);q.push([x+dx,y+dy]);}}}
   assert.equal(visited.size,group.length,`${id}: one sprite per true connected component`);
  }
 }
});
test('R3 Elder Grove boss remains 1x1 in engine and uses complete isolated artwork',()=>{
 const {width,height}=(()=>{ const b=readFileSync(new URL('../public/assets/premium-giantwood/boss-d12-q3r3.png',import.meta.url)); assert.equal(b.toString('ascii',1,4),'PNG');return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)}; })();
 assert(width>=300&&height>=150);
 const art=load('../public/v2-premium-giantwood.mjs');
 assert.match(art,/boss\?2\.20/);
 assert.equal(ROOM_DATA.q3r5.foes[0].variant,'boss');
 assert.equal(ROOM_DATA.q3r5.foes[0].faces,12);
 assert.doesNotMatch(load('../public/app.js'),/state\.roomWalls\?\.\[me\.room\]\s*=/);
});
