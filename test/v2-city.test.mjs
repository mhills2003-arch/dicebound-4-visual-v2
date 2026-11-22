import assert from 'node:assert/strict';
import test from 'node:test';
import {freshState, ensureWorld, ROOM_WALLS} from '../src/engine.mjs';
import {ensureCityTrialPlayer} from '../src/crypt-trial.mjs';
import {city, cityArt, citySprite} from '../public/v2-city-plan.mjs';
import {existsSync} from 'node:fs';

test('all ten occupied city rooms use their painted footprints and named spawns', () => {
  const keys = new Set();
  let total = 0;
  for (const [id, plan] of Object.entries(city)) {
    const state = freshState();
    const hero = ensureCityTrialPlayer(state, 'one', 'Tester', id);
    const battle = state.rooms[id].battle;
    assert.deepEqual([hero.x, hero.y], [0, 5]);
    assert.equal(plan.blueprint.length,11);
    assert.ok(plan.blueprint.every(line=>line.length===15));
    const walls = plan.blueprint.flatMap((line,y)=>Array.from(line,(v,x)=>v==='#'?[x,y]:null).filter(Boolean));
    assert.deepEqual(ROOM_WALLS[id],walls);
    assert.ok(walls.length >= 50 && walls.length <= 82);
    assert.ok(plan.foes.length >= 11 && plan.foes.length <= 15);
    assert.deepEqual(battle.enemies.map(e=>[e.x,e.y]),plan.spawns);
    assert.deepEqual(battle.enemies.map(({faces,role,variant})=>({faces,role,variant})),plan.foes);
    assert.ok(existsSync(new URL('../public/assets/premium-city/floors/12-'+id.slice(4)+'.webp',import.meta.url)));
    for (const e of battle.enemies) {
      const key = citySprite(e);
      keys.add(key);
      assert.equal(e.name,cityArt[key].name+' · D'+e.faces);
      assert.ok(existsSync(new URL('../public/assets/premium-city/enemies/'+key+'.webp',import.meta.url)));
    }
    total += battle.enemies.length;
  }
  assert.equal(total,130);
  assert.deepEqual([...keys].sort(),Object.keys(cityArt).sort());
});

test('a saved siege battle keeps its progress and relocates a player stranded in new stonework', () => {
  const state=freshState();
  const hero=ensureCityTrialPlayer(state,'one','Tester','q12r7');
  const enemy=state.rooms.q12r7.battle.enemies[0];
  enemy.hp=7;
  delete state.cityLayoutVersion;
  [hero.x,hero.y]=ROOM_WALLS.q12r7[0];
  ensureWorld(state);
  assert.equal(enemy.hp,7);
  assert.equal(state.rooms.q12r7.battle.status,'active');
  assert.equal(city.q12r7.blueprint[hero.y][hero.x],'.');
  const position=[hero.x,hero.y];
  ensureWorld(state);
  assert.deepEqual([hero.x,hero.y],position);
});

