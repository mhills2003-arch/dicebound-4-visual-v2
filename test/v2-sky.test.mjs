import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync} from 'node:fs';
import {sky, skyArt, skySprite} from '../public/v2-sky-plan.mjs';
import {ensureSkyTrialPlayer} from '../src/crypt-trial.mjs';
import {freshState, ensureWorld, ROOM_WALLS, HARD_HAZARDS} from '../src/engine.mjs';

test('sky room trials use the painted footprint, authored spawns, gusts and all twelve sprites', () => {
  const sprites = new Set();
  for (const [room, plan] of Object.entries(sky)) {
    const state = freshState();
    const hero = ensureSkyTrialPlayer(state, 'one', 'Tester', room);
    assert.deepEqual([hero.room, hero.x, hero.y], [room, 0, 6]);
    const enemies = state.rooms[room].battle.enemies;
    assert.deepEqual(enemies.map(e => [e.x, e.y]), plan.spawns);
    assert.deepEqual(enemies.map(({faces, role, variant}) => ({faces, role, variant})), plan.foes);
    assert.deepEqual(HARD_HAZARDS[room], plan.hazards);
    assert.ok(existsSync(new URL('../public/assets/premium-sky/floors/13-'+room.slice(4)+'.webp', import.meta.url)));
    for (const enemy of enemies) {
      const key = skySprite(enemy);
      sprites.add(key);
      assert.equal(enemy.name, skyArt[key].name+' · D'+enemy.faces);
      assert.ok(existsSync(new URL('../public/assets/premium-sky/enemies/'+key+'.webp', import.meta.url)));
    }
  }
  assert.deepEqual([...sprites].sort(), Object.keys(skyArt).sort());
});
test('migration moves a stranded hero and preserves an active battle on reload', () => {
  const state = freshState();
  const hero = ensureSkyTrialPlayer(state, 'one', 'Tester', 'q13r1');
  const enemy = state.rooms.q13r1.battle.enemies[0];
  enemy.hp = 8;
  [hero.x, hero.y] = ROOM_WALLS.q13r1[0];
  delete state.skyLayoutVersion;
  ensureWorld(state);
  assert.equal(sky.q13r1.blueprint[hero.y][hero.x], '.');
  assert.equal(enemy.hp, 8);
  assert.equal(state.rooms.q13r1.battle.status, 'active');
});
