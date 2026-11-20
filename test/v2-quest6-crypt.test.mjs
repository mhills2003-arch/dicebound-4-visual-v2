import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Q6_LAYOUTS} from '../public/v2-quest6-layouts.mjs';
import {ROOM_DATA,ROOM_WALLS,freshState,ensurePlayer,resetTestAdventure,enterQuest,isWall} from '../src/engine.mjs';
import {ensureCryptTrialPlayer} from '../src/crypt-trial.mjs';
import {CRYPT_FILES,cryptSprite,cryptWallEdges,isPremiumCryptRoom,initPremiumCrypt,premiumCryptReady,paintPremiumCryptActor} from '../public/v2-premium-crypt.mjs';
import {CRYPT_SPRITE_CROPS} from '../public/v2-crypt-sprite-crops.mjs';
const approved=JSON.parse(readFileSync(new URL('../design/quest6/layouts-r1.json',import.meta.url),'utf8'));

test('all Q6 approved layouts and existing rosters reach the shipping engine',()=>{
  assert.equal(Object.keys(Q6_LAYOUTS).length,8);
  for(const r of approved.rooms){
    assert.deepEqual(ROOM_WALLS[r.id],r.walls);assert.deepEqual(ROOM_DATA[r.id].spawnPositions,r.spawnPositions);
    assert.deepEqual(ROOM_DATA[r.id].foes,r.enemies.map(({faces,variant,role})=>({faces,variant,role})));
    assert(ROOM_WALLS[r.id].length>=30&&ROOM_WALLS[r.id].length<=35);
  }
  assert.equal(isPremiumCryptRoom('q5r8'),false);assert.equal(isPremiumCryptRoom('__proto__'),false);
});
test('all 53 foes spawn on authored squares with room for four entrants',()=>{
  let count=0;
  for(const r of approved.rooms){
    const s=freshState();s.unlockedQuest=6;
    for(const id of ['one','two','three','four']){
      const p=ensurePlayer(s,id,id);p.room='camp';p.questBookmarks={6:{room:r.id,x:0,y:4}};enterQuest(s,id,6);
    }
    const enemies=s.rooms[r.id].battle.enemies;count+=enemies.length;
    assert.deepEqual(enemies.map(e=>[e.x,e.y]),r.spawnPositions);
    const actors=[...Object.values(s.players),...enemies];assert.equal(new Set(actors.map(e=>`${e.x},${e.y}`)).size,actors.length);
    assert(actors.every(e=>!isWall(r.id,e.x,e.y)));
  }
  assert.equal(count,53);
});
test('Q6 save reconciliation moves blocked players and ordinary foes while preserving ghosts and progress',()=>{
  const s=freshState();s.unlockedQuest=6;const p=ensurePlayer(s,'one','Tester');p.room='camp';enterQuest(s,'one',6);
  p.room='q6r3';p.x=3;p.y=4;p.gold=321;p.level=8;
  const b=s.rooms.q6r3.battle;b.status='active';b.enemies=[
    {id:'old-normal',faces:8,variant:'normal',role:'normal',x:4,y:4,hp:12,maxHp:24},
    {id:'old-ghost',faces:8,variant:'normal',role:'ghost',x:3,y:5,hp:14,maxHp:24}
  ];
  ensurePlayer(s,'one','Tester');assert(!isWall(p.room,p.x,p.y));assert(!isWall(p.room,b.enemies[0].x,b.enemies[0].y));
  assert.deepEqual([b.enemies[1].x,b.enemies[1].y],[3,5]);assert.equal(p.gold,321);assert.equal(p.level,8);
  assert.equal(b.enemies[0].hp,12);assert.equal(b.enemies[1].hp,14);
});
test('joined wall edges never draw a border between adjacent blocked squares',()=>{
  const edges=cryptWallEdges([[2,2],[3,2],[3,3]]);assert.equal(edges.length,8);
  assert(!edges.some(e=>e.x===2&&e.y===2&&e.side==='east'));assert(!edges.some(e=>e.x===3&&e.y===2&&e.side==='south'));
  for(const r of approved.rooms){
    const wallSet=new Set(r.walls.map(p=>p.join(',')));
    for(const {x,y,side} of cryptWallEdges(r.walls)){
      const [dx,dy]={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]}[side];assert(!wallSet.has(`${x+dx},${y+dy}`));
    }
  }
});
test('each Q6 role and die has real artwork, valid atlas bounds, and independent fallback',()=>{
  const loaded=[];
  class MockImage{complete=true;naturalWidth=2048;naturalHeight=2048;set src(v){this.path=v;loaded.push(this);}}
  initPremiumCrypt(MockImage,'q6r3');
  for(const path of Object.values(CRYPT_FILES))assert(existsSync(new URL('../public/'+path.slice(2),import.meta.url)),path);
  for(const r of approved.rooms)for(const e of r.enemies){
    const spec=cryptSprite(e);assert(spec);const box=CRYPT_SPRITE_CROPS[spec.key][spec.row*spec.cols+spec.col];assert(box&&box[2]>0&&box[3]>0);
  }
  assert(premiumCryptReady('q6r3'));loaded.find(im=>im.path===CRYPT_FILES.ghost).complete=false;
  assert(premiumCryptReady('q6r3'),'one missing creature must not remove the room artwork');
  assert.equal(paintPremiumCryptActor({}, {iso:false}, {role:'ghost',faces:8},'enemy',null,{roomId:'q6r3'}),false);
});
test('Q6 trials support four entrants, preserve reconnect progress and reset into the selected room',()=>{
  for(const room of Object.keys(Q6_LAYOUTS)){
    const s=freshState(),p=ensureCryptTrialPlayer(s,'one','Tester',room);
    assert.equal(p.room,room);assert.equal(p.level,8);assert.equal(p.inventory.potions.length,3);
    assert.equal(p.inventory.equipment.filter(i=>i.rarity==='Uncommon').length,2);
    p.gold=57;p.hp=100;const gear=JSON.stringify(p.inventory);ensureCryptTrialPlayer(s,'one','Tester',room);
    assert.equal(p.gold,57);assert.equal(p.hp,100);assert.equal(JSON.stringify(p.inventory),gear);
    for(const id of ['two','three','four'])ensureCryptTrialPlayer(s,id,id,room);
    assert.equal(new Set(Object.values(s.players).map(p=>`${p.x},${p.y}`)).size,4);
    assert.equal(s.rooms[room].battle.enemies.length,ROOM_DATA[room].foes.length);
    const reset=resetTestAdventure(s);for(const id of Object.keys(reset.players))ensureCryptTrialPlayer(reset,id,id,room);
    assert.equal(reset.players.one.room,room);assert.equal(reset.players.one.level,8);
  }
  const ordinary=freshState();assert.equal(ordinary.unlockedQuest,1);assert(!ordinary.cryptTrial);
  for(const invalid of ['q6r9','q5r3','camp','q6r1;reset'])assert.throws(()=>ensureCryptTrialPlayer(freshState(),'one','Tester',invalid),/Unknown/);
});
