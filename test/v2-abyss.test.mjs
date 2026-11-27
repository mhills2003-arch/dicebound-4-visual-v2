import {ABYSS_LANTERNS} from '../src/extreme-rooms.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync} from 'node:fs';
import {abyss, abyssArt, abyssSprite} from '../public/v2-abyss-plan.mjs';
import {ensureAbyssTrialPlayer} from '../src/crypt-trial.mjs';
import {freshState, ensureWorld, ROOM_WALLS, resolveRound} from '../src/engine.mjs';

test('abyss room trials use the painted footprint, authored spawns, lanterns and all ten sprites', () => {
  const sprites = new Set();
  for (const [room, plan] of Object.entries(abyss)) {
    const state = freshState();
    const hero = ensureAbyssTrialPlayer(state, 'one', 'Tester', room);
    assert.deepEqual([hero.room, hero.x, hero.y], [room, 0, 6]);
    const enemies = state.rooms[room].battle.enemies;
    assert.deepEqual(enemies.map(e => [e.x, e.y]), plan.spawns);
    assert.deepEqual(enemies.map(({faces, role, variant}) => ({faces, role, variant})), plan.foes);
    assert.deepEqual(ABYSS_LANTERNS[room], plan.lanterns);
    for(const [x,y] of plan.lanterns) assert.equal(plan.blueprint[y][x], '.');
    assert.ok(existsSync(new URL('../public/assets/premium-abyss/floors/14-'+room.slice(4)+'.webp', import.meta.url)));
    for (const enemy of enemies) {
      const key = abyssSprite(enemy);
      sprites.add(key);
      assert.equal(enemy.name, abyssArt[key].name+' · D'+enemy.faces);
      assert.ok(existsSync(new URL('../public/assets/premium-abyss/enemies/'+key+'.webp', import.meta.url)));
    }
  }
  assert.deepEqual([...sprites].sort(), Object.keys(abyssArt).sort());
});
test('migration moves a stranded hero and preserves an active battle on reload', () => {
  const state = freshState();
  const hero = ensureAbyssTrialPlayer(state, 'one', 'Tester', 'q14r1');
  const enemy = state.rooms.q14r1.battle.enemies[0];
  enemy.hp = 8;
  [hero.x, hero.y] = ROOM_WALLS.q14r1[0];
  delete state.abyssLayoutVersion;
  ensureWorld(state);
  assert.equal(abyss.q14r1.blueprint[hero.y][hero.x], '.');
  assert.equal(enemy.hp, 8);
  assert.equal(state.rooms.q14r1.battle.status, 'active');
});

test('first Abyss lamp protects three orthogonal steps, and entrance light follows the new door', () => {
  const room = 'q14r1';
  for (const [x, y, lit, expectedDamage] of [[6,3,true,0],[7,3,true,2],[6,3,false,2],[0,8,false,0],[0,9,false,2]]) {
    const state = freshState();
    const hero = ensureAbyssTrialPlayer(state, 'one', 'Tester', room);
    const battle = state.rooms[room].battle;
    Object.assign(hero, {x,y});
    battle.litLanterns = lit ? [0] : [];
    battle.enemyPhases = 2 - abyss[room].hazardPhaseOffset;
    battle.actions.one = {type:'defend',resolved:true};
    battle.enemies = [{...battle.enemies[0], role:'normal', x:15, y:0}];
    const hp = hero.hp;
    resolveRound(state,room,Date.now(),()=>0.5);
    assert.equal(hp-hero.hp,expectedDamage);
  }
});
