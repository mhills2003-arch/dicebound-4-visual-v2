import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {citadel, citadelArt, citadelSprite} from '../public/v2-citadel-plan.mjs';
import {ensureCitadelTrialPlayer} from '../src/crypt-trial.mjs';
import {freshState, ensureWorld, ROOM_WALLS} from '../src/engine.mjs';

test('all Last Roll trials open at the west gate with the planned collision map and encounter', () => {
  const seen = new Set();
  for (const [room,plan] of Object.entries(citadel)) {
    const state = freshState();
    const hero = ensureCitadelTrialPlayer(state,'one','Tester',room);
    assert.deepEqual([hero.room,hero.x,hero.y],[room,0,6]);
    const expectedWalls = plan.blueprint.flatMap((row,y) => [...row].flatMap((c,x) => c==='#' ? [[x,y]] : []));
    assert.deepEqual(ROOM_WALLS[room],expectedWalls);
    const enemies = state.rooms[room].battle.enemies;
    assert.deepEqual(enemies.map(e => [e.x,e.y]),plan.spawns);
    assert.deepEqual(enemies.map(({faces,role,variant}) => ({faces,role,variant})),plan.foes);
    assert.ok(existsSync(new URL('../public/assets/premium-citadel/floors/15-'+room.slice(4)+'.webp',import.meta.url)));
    for (const e of enemies) {
      const key = citadelSprite(room,e);
      seen.add(key);
      assert.equal(e.name,citadelArt[key].name+' · D'+e.faces);
    }
  }
  for (const role of ['armoured','teleporter','ninja']) {
    const key = citadelSprite('q15r15',{variant:'boss',role,faces:120});
    assert.equal(key,'king-'+role);
    seen.add(key);
  }
  assert.deepEqual([...seen].sort(),Object.keys(citadelArt).sort());
  for (const key of seen) assert.ok(existsSync(new URL('../public/assets/premium-citadel/enemies/'+key+'.webp',import.meta.url)));
  assert.equal(citadelSprite('q15r3',{variant:'boss',role:'armoured',faces:28}),'boss-armoured-d80');
  assert.equal(citadelSprite('q15r4',{variant:'normal',role:'normal',clone:true}),'cloner');
});

test('a legacy Citadel save keeps encounter health and relocates a blocked player once', () => {
  const state=freshState(),room='q15r15';
  const hero=ensureCitadelTrialPlayer(state,'one','Tester',room);
  const king=state.rooms[room].battle.enemies.find(e=>e.variant==='boss');
  Object.assign(king,{role:'teleporter',hp:45,faces:36});
  delete state.citadelLayoutVersion;
  [hero.x,hero.y]=ROOM_WALLS[room][0];
  ensureWorld(state);
  assert.equal(citadel[room].blueprint[hero.y][hero.x],'.');
  assert.equal(king.hp,45);
  assert.equal(citadelSprite(room,king),'king-teleporter');
  const position=[hero.x,hero.y];
  ensureWorld(state);
  assert.deepEqual([hero.x,hero.y],position);
});
