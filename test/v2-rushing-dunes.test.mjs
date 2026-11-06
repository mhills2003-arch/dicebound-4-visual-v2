import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState, ensurePlayer, rollMovement, move, isWall, ROOM_WALLS} from '../src/engine.mjs';
import {ensureCaravanTrialPlayer} from '../src/caravan-trial.mjs';
import {DUNE_SCENERY} from '../public/v2-rushing-dunes-layout.mjs';
import {DUNE_FILES, initPremiumDesert, premiumDesertReady, paintPremiumDesertWalls} from '../public/v2-premium-desert.mjs';

const room = 'q5r2';
const square = (x, y) => String.fromCharCode(65 + y) + (x + 1);
// Read directly from panel 02. These independent coordinates protect the approved layout.
const blocked = [
  'A2','A7','A11','B2','B4','B7','B10','B11','C2','C4','C7','C10','C11',
  'D4','D8','D10','E4','E8','F4','F8','F11','G2','G6','G8','G11',
  'H2','H6','H8','H11','I2','I6'
];
const guards = {
  B6: 'D8', C12: 'D8', D5: 'Swift D6', D9: 'Swift D6',
  F7: 'Swift D6', F10: 'D6', H12: 'D6'
};
function checkGuards(game) {
  const enemies = game.rooms[room].battle.enemies;
  assert.equal(enemies.length, 7);
  assert.deepEqual(Object.fromEntries(enemies.map(e => [square(e.x, e.y), e.name])), guards);
}

test('all 117 Rushing Dunes cells match panel 02, including both open corners of the offset bank', () => {
  assert.deepEqual(ROOM_WALLS[room].map(([x, y]) => square(x, y)), blocked);
  const artCells = DUNE_SCENERY.flatMap(p => p.cells.map(([x, y]) => square(x, y)));
  assert.equal(artCells.length, 31);
  assert.deepEqual(new Set(artCells), new Set(blocked));
  assert.equal(isWall(room, 9, 0), false);
  assert.equal(isWall(room, 10, 3), false);
});

test('normal east-door entry from Caravan Gate starts all seven exact dice at their approved squares', () => {
  const game = freshState();
  const hero = ensureCaravanTrialPlayer(game, 'one', 'Tester');
  game.rooms.q5r1.battle.status = 'cleared';
  hero.x = 12; hero.y = 4;
  rollMovement(game, hero.id);
  move(game, hero.id, 'E');
  assert.equal(hero.room, room);
  assert.equal(square(hero.x, hero.y), 'E1');
  checkGuards(game);
});

test('direct Rushing Dunes trial uses normal combat, supports four arrivals and resumes progress once', () => {
  const game = freshState();
  const hero = ensureCaravanTrialPlayer(game, 'one', 'Tester', room);
  checkGuards(game);
  assert.equal(game.rooms.q5r1.battle.status, 'dormant');
  assert.equal(game.rooms[room].battle.status, 'active');
  rollMovement(game, hero.id, Date.now(), () => .9);
  move(game, hero.id, 'E');
  move(game, hero.id, 'E');
  const movesBeforeWall = hero.moveRemaining;
  move(game, hero.id, 'E');
  assert.match(game.log.at(-1).text, /square is blocked/i);
  assert.equal(hero.moveRemaining, movesBeforeWall);
  assert.equal(square(hero.x, hero.y), 'E3');
  hero.hp = 78;
  const gear = structuredClone(hero.inventory);
  for (const id of ['two', 'three', 'four']) ensureCaravanTrialPlayer(game, id, id, room);
  ensureCaravanTrialPlayer(game, hero.id, 'Tester', room);
  assert.equal(hero.hp, 78);
  assert.equal(square(hero.x, hero.y), 'E3');
  assert.deepEqual(hero.inventory, gear);
  assert.equal(new Set(Object.values(game.players).map(p => square(p.x, p.y))).size, 4);
  checkGuards(game);
});

test('reconnecting a legacy character standing under a new dune keeps their HP, gear and battle progress', () => {
  const game = freshState();
  const hero = ensureCaravanTrialPlayer(game, 'one', 'Tester', room);
  hero.x = 1; hero.y = 0; hero.hp = 39;
  const enemies = game.rooms[room].battle.enemies;
  enemies[0].hp = 8;
  enemies.pop();
  const gear = structuredClone(hero.inventory);
  ensurePlayer(game, hero.id, hero.name, null);
  assert(!isWall(room, hero.x, hero.y));
  assert.equal(hero.hp, 39);
  assert.deepEqual(hero.inventory, gear);
  assert.equal(enemies.length, 6);
  assert.equal(enemies[0].hp, 8);
});

test('the eight paintings follow the grid and only load in the room that uses them', () => {
  const loaded = [];
  class Sprite {
    complete = true;
    naturalWidth = 512;
    set src(path) { this.path = path; loaded.push(path); }
    get src() { return this.path; }
  }
  initPremiumDesert(Sprite, room);
  assert(premiumDesertReady(room));
  assert(!premiumDesertReady('q5r1'));
  assert(loaded.every(path => !path.includes('caravan-ground')));
  initPremiumDesert(Sprite, room);
  assert.equal(loaded.length, Object.keys(DUNE_FILES).length);
  const draws = [], rects = [];
  const ctx = {
    save(){}, restore(){}, beginPath(){}, clip(){}, rect(...r){rects.push(r);},
    drawImage(sprite){draws.push(sprite.src);}, getTransform(){return {a:1};}
  };
  assert(paintPremiumDesertWalls(ctx, {originX:0, originY:0, cell:1}, ROOM_WALLS[room], room));
  assert.equal(draws.length, 8);
  assert.deepEqual(new Set(rects.slice(1).map(([x, y]) => square(x, y))), new Set(blocked));
  for (const path of Object.values(DUNE_FILES)) {
    const bytes = readFileSync(new URL('../public/' + path.slice(2), import.meta.url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', path);
  }
});

test('missing dune artwork falls back for this room while the Caravan Gate renderer still works', async () => {
  const module = await import('../public/v2-premium-desert.mjs?missingRidge');
  class DelayedSprite {
    naturalWidth = 256;
    set src(url) { this.complete = !url.includes('west-bank'); }
  }
  module.initPremiumDesert(DelayedSprite, 'q5r1');
  module.initPremiumDesert(DelayedSprite, room);
  assert(module.premiumDesertReady('q5r1'));
  assert(!module.premiumDesertReady(room));
  assert.equal(module.paintPremiumDesertWalls({}, {}, ROOM_WALLS[room], room), false);
});
