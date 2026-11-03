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
 assert.match(html,/q3=v2-quest3-giantwood-r4b/);
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


test('Q3 R4 restores R2 floor/walls, keeps the accepted R3 boss and uses whole uncropped tree only on a suitable real obstacle run',async()=>{
 const {giantTreeRuns,GIANT_FILES}=await import('../public/v2-premium-giantwood.mjs');
 const app=load('../public/app.js');const art=load('../public/v2-premium-giantwood.mjs');
 assert.match(app,/paintPremiumGiantWalls\(ctx,s,me.room,state.roomWalls/);
 assert.doesNotMatch(app,/paintPremiumGiantWallGroups/);
 assert.match(art,/boss\?2\.20/);
 assert.match(art,/boss\?\.86:\.58/);
 assert.match(art,/whole-fallen-tree-q3r4/);
 assert.equal(GIANT_FILES.bossD12,'./assets/premium-giantwood/boss-d12-q3r3.png');
 for(const id of GIANT_ROOMS){
  const runs=giantTreeRuns(id,ROOM_WALLS[id]);
  if(id!=='q3r4')assert.equal(runs.length,0,`No speculative image for ${id}`);
  for(const r of runs){for(let dx=0;dx<r.length;dx++)
   assert(ROOM_WALLS[id].some(([x,y])=>x===r.x+dx&&y===r.y),'tree only covers blocked cells');
  }
 }
 assert.match(art,/paintPremiumGiantWall\(ctx,s,x,y,roomId,walls\)/);
 assert.doesNotMatch(art,/paintPremiumGiantWallGroups/);
 assert.match(app,/if\(!anyPremiumActive\(\)\)\{/);
});


test('Q3 R4b floor images resolve to unique continuous cache-safe assets',()=>{
 const names=GIANT_ROOMS.map(id=>GIANT_FILES[id]);
 assert.equal(new Set(names).size,5);
 for(const name of names){
  assert.match(name,/-ground-q3r4\.jpg$/);
  assert(statSync(new URL('../public/'+name.replace('./',''),import.meta.url)).size>200000);
 }
 const app=load('../public/app.js');
 assert.match(app,/v2-quest3-giantwood-20261103-r4b/);
 assert.match(app,/paintPremiumGiantWalls\(ctx,s,me.room,state.roomWalls/);
 assert.doesNotMatch(app,/paintPremiumGiantWallGroups/);
});
