import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ROOM_DATA,resetTestAdventure} from '../src/engine.mjs';
import {ensureMineTrialPlayer} from '../src/mine-trial.mjs';
test('each Q2 room can be reviewed in a separate level-three test save',()=>{
 for(let n=1;n<=5;n++){
  const game=freshState(),id='q2r'+n,p=ensureMineTrialPlayer(game,'one','Tester',id);
  assert.equal(p.room,id);assert.equal(p.level,3);assert.equal(game.mineTrialRoom,id);assert.equal(game.unlockedQuest,2);
  assert.equal(p.inventory.potions.length,3);assert.equal(p.inventory.equipment.filter(i=>i.rarity==='Common'&&i.level===3).length,2);
  assert.deepEqual(game.rooms[id].battle.enemies.map(e=>e.faces),ROOM_DATA[id].foes.map(e=>e.faces));
  p.gold=41;p.hp=33;const inventory=JSON.stringify(p.inventory);
  ensureMineTrialPlayer(game,'one','Tester',id);assert.equal(p.gold,41);assert.equal(p.hp,33);assert.equal(JSON.stringify(p.inventory),inventory);
  for(const player of ['two','three','four'])ensureMineTrialPlayer(game,player,player,id);
  assert.equal(new Set(Object.values(game.players).map(p=>`${p.x},${p.y}`)).size,4);
  const reset=resetTestAdventure(game);ensureMineTrialPlayer(reset,'one','Tester',id);assert.equal(reset.players.one.room,id);
 }
 const campaign=freshState();assert.equal(campaign.unlockedQuest,1);assert(!campaign.mineTrial);
 assert.throws(()=>ensureMineTrialPlayer(campaign,'one','Tester','q5r1'),/Unknown Quest 2/);
 assert(!campaign.mineTrial);assert.equal(Object.keys(campaign.players).length,0);
});
