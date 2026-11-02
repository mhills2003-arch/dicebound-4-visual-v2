import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../src/engine.mjs';
import * as maze from '../src/maze-play.mjs';
const required = ['awardXp','classFindChance','classGoldBonus','classBonusAttackDie','classBonusDefenceDie','classBombDie','claimQuestReward','selectClass'];
test('V2 engine exposes all functions required by Worker and Maze',()=>{
  for(const name of required) assert.equal(typeof engine[name], 'function', `${name} must be exported`);
  assert.equal(typeof maze.createMaze,'function');
});
