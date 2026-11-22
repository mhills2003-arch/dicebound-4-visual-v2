import assert from 'node:assert/strict';
import test from 'node:test';
import {freshState, ensureWorld, ROOM_DATA, ROOM_WALLS, HARD_HAZARDS, publicState, resolveRound} from '../src/engine.mjs';
import {ensureSunkenTrialPlayer} from '../src/crypt-trial.mjs';
import {sunken, sunkenNames, sunkenSprite} from '../public/v2-sunken-plan.mjs';
import {existsSync} from 'node:fs';

test('all ten Sunken Kingdom rooms use their painted footprints, tide tiles and named spawns', () => {
  const keys = new Set();
  let total = 0;
  for (const [id, plan] of Object.entries(sunken)) {
    const state = freshState();
    const hero = ensureSunkenTrialPlayer(state, 'one', 'Tester', id);
    const battle = state.rooms[id].battle;
    assert.deepEqual([hero.x, hero.y], [0, 5]);
    assert.equal(plan.blueprint.length,11);
    assert.ok(plan.blueprint.every(line=>line.length===15));
    const walls = plan.blueprint.flatMap((line,y)=>Array.from(line,(v,x)=>v==='#'?[x,y]:null).filter(Boolean));
    assert.deepEqual(ROOM_WALLS[id],walls);
    assert.ok(walls.length >= 50 && walls.length <= 82);
    assert.ok(plan.foes.length >= 11 && plan.foes.length <= 15);
    assert.deepEqual(HARD_HAZARDS[id],plan.hazards);
    assert.deepEqual(publicState(state,'one').roomHazards[id],plan.hazards);
    assert.equal(ROOM_DATA[id].hazardPhaseOffset,plan.hazardPhaseOffset);
    assert.deepEqual(battle.enemies.map(e=>[e.x,e.y]),plan.spawns);
    assert.deepEqual(battle.enemies.map(({faces,role,variant})=>({faces,role,variant})),plan.foes);
    assert.ok(existsSync(new URL('../public/assets/premium-sunken/floors/11-'+id.slice(4)+'.webp',import.meta.url)));
    for (const e of battle.enemies) {
      const key = sunkenSprite(e);
      keys.add(key);
      assert.equal(e.name,sunkenNames[key]+' · D'+e.faces);
      assert.ok(existsSync(new URL('../public/assets/premium-sunken/enemies/'+key+'.webp',import.meta.url)));
    }
    total += battle.enemies.length;
  }
  assert.equal(total,127);
  assert.deepEqual([...keys].sort(),Object.keys(sunkenNames).sort());
});

test('a saved cathedral battle keeps its progress and relocates a player stranded in new stonework', () => {
  const state=freshState();
  const hero=ensureSunkenTrialPlayer(state,'one','Tester','q11r7');
  const enemy=state.rooms.q11r7.battle.enemies[0];
  enemy.hp=7;
  delete state.sunkenLayoutVersion;
  [hero.x,hero.y]=ROOM_WALLS.q11r7[0];
  ensureWorld(state);
  assert.equal(enemy.hp,7);
  assert.equal(state.rooms.q11r7.battle.status,'active');
  assert.equal(sunken.q11r7.blueprint[hero.y][hero.x],'.');
  const position=[hero.x,hero.y];
  ensureWorld(state);
  assert.deepEqual([hero.x,hero.y],position);
});

test('each Q11 room floods on two phases and rests on the third', () => {
  for(const [id,plan] of Object.entries(sunken)){
    for(let startPhase=0;startPhase<3;startPhase++){
      const state=freshState();
      const hero=ensureSunkenTrialPlayer(state,'one','Tester',id);
      const battle=state.rooms[id].battle;
      const far=battle.enemies[0];
      Object.assign(far,{x:14,y:10,role:'armoured',atk:1});
      battle.enemies=[far];battle.enemyPhases=startPhase;
      [hero.x,hero.y]=plan.hazards[0];
      battle.actions.one={type:'defend'};
      const hp=hero.hp;
      resolveRound(state,id,Date.now(),()=>0.5);
      const phase=(startPhase+1+plan.hazardPhaseOffset)%3;
      assert.equal(battle.hazardPhase,phase);
      assert.equal(hp-hero.hp,phase===0?0:2);
    }
  }
});
