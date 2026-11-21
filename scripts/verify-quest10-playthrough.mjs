// Reproducible full Quest 10 engine playthrough using legal commands only.
// Uses the existing level-22 rare trial loadout and camp/shop supplies between rooms.
import {freshState, ROOM_WALLS, rollMovement, move, submitSequentialAction, endTurn, returnToCamp, resumeQuest, buyFromShop, usePotion, replayQuest} from '../src/engine.mjs';
import {ensureChaosTrialPlayer} from '../src/crypt-trial.mjs';
import assert from 'node:assert/strict';

const dirs=[[1,0,'E'],[-1,0,'W'],[0,1,'S'],[0,-1,'N']];
function paths(game, hero) {
  const walls=new Set(ROOM_WALLS[hero.room].map(p=>p.join(',')));
  for(const e of game.rooms[hero.room].battle.enemies.filter(e=>e.hp>0))walls.add([e.x,e.y].join(','));
  for(const n of game.rooms[hero.room].battle.nests||[])if(n.active)walls.add([n.x,n.y].join(','));
  const paths=new Map([[[hero.x,hero.y].join(','),[]]]),queue=[[hero.x,hero.y]];
  for(let i=0;i<queue.length;i++)for(const [dx,dy,d]of dirs){
    const [x,y]=[queue[i][0]+dx,queue[i][1]+dy],key=[x,y].join(',');
    if(x<0||x>14||y<0||y>10||walls.has(key)||paths.has(key))continue;
    paths.set(key,[...paths.get(queue[i].join(',')),d]);queue.push([x,y]);
  }
  return paths;
}
function rng(seed) { let a=seed>>>0;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}; }

function battle(game, hero, random) {
  const room=hero.room,b=game.rooms[room].battle;let turns=0;
  while(b.status==='active'&&turns++<120){
    assert.equal(hero.room,room,'unexpected defeat/retreat');assert(hero.hp>0);
    if(hero.lastRolledTurn!==game.turn.round)rollMovement(game,hero.id,Date.now(),random);
    else if(!hero.movementRolled){endTurn(game,hero.id,Date.now(),random);continue;}
    const routes=paths(game,hero),candidates=[];
    for(const e of b.enemies.filter(e=>e.hp>0))for(const [dx,dy] of dirs){
      const route=routes.get([e.x+dx,e.y+dy].join(','));
      if(route)candidates.push({e,route,priority:route.length+(e.role==='ranged'?-0.5:0)+e.hp/100});
    }
    for(const e of (b.nests||[]).filter(n=>n.active))for(const [dx,dy] of dirs){
      const route=routes.get([e.x+dx,e.y+dy].join(','));if(route)candidates.push({e,route,priority:route.length-4});
    }
    candidates.sort((a,b)=>a.priority-b.priority);const chosen=candidates[0];
    for(const d of (chosen?.route||[]).slice(0,hero.moveRemaining))move(game,hero.id,d);
    const adjacent=b.enemies.filter(e=>e.hp>0&&Math.abs(hero.x-e.x)+Math.abs(hero.y-e.y)<=1).sort((a,b)=>a.hp-b.hp);
    if(hero.hp<hero.maxHp*.55&&hero.inventory.potions.length)submitSequentialAction(game,hero.id,{type:'potion',target:hero.id});
    else if((b.nests||[]).some(n=>n.active&&Math.abs(n.x-hero.x)+Math.abs(n.y-hero.y)===1))submitSequentialAction(game,hero.id,{type:'nest'});
    else if(adjacent.length)submitSequentialAction(game,hero.id,{type:'attack',target:adjacent[0].id});
    else submitSequentialAction(game,hero.id,{type:'defend'});
    endTurn(game,hero.id,Date.now(),random);
  }
  assert.equal(b.status,'cleared',room+' did not clear');
  return {room,turns,hp:hero.hp,level:hero.level,potions:hero.inventory.potions.length};
}
function walkEast(game, hero, random) {
  const room=hero.room;
  for(let turn=0;turn<20&&hero.room===room;turn++){
    if(hero.lastRolledTurn!==game.turn.round)rollMovement(game,hero.id,Date.now(),random);
    else if(!hero.movementRolled){endTurn(game,hero.id,Date.now(),random);continue;}
    const route=paths(game,hero).get('14,5');assert(route);
    for(const d of [...route,'E'].slice(0,hero.moveRemaining))move(game,hero.id,d);
    if(hero.room===room)endTurn(game,hero.id,Date.now(),random);
  }
  assert.notEqual(hero.room,room);
}
const report=[];
for(const seed of [101,202,303]) {
 const random=rng(seed);Math.random=random;const game=freshState(),hero=ensureChaosTrialPlayer(game,'one','Tester','q10r1'),rooms=[];
 for(let n=1;n<=10;n++) {
  assert.equal(hero.room,'q10r'+n);rooms.push(battle(game,hero,random));
  // Use the existing camp, shop and resume flow between rooms, with earned/starter gold.
  returnToCamp(game,hero.id);
  while(hero.inventory.potions.length<3&&hero.gold>=10)buyFromShop(game,hero.id,'potion');
  while(hero.hp<hero.maxHp&&hero.inventory.potions.length)usePotion(game,hero.id,hero.id);
  resumeQuest(game,hero.id);
  if(n<10)walkEast(game,hero,random);
 }
 assert(game.completedQuests.includes(10));
 walkEast(game,hero,random);assert.equal(hero.room,'camp');
 replayQuest(game,hero.id,10);assert.equal(hero.room,'q10r1');
 assert.equal(game.rooms.q10r10.battle.status,'dormant');
 report.push({seed,rooms,completed:true,replay:true});
}
console.log(JSON.stringify(report,null,2));
