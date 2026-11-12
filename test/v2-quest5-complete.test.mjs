import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_DATA, ROOM_WALLS, freshState, ensurePlayer, rollMovement, move, isWall, clearLine} from '../src/engine.mjs';
import {ensureCaravanTrialPlayer} from '../src/caravan-trial.mjs';
import {Q5_ROOMS} from '../public/v2-quest5-layouts.mjs';
import * as artwork from '../public/v2-premium-desert.mjs';
const square = (x, y) => String.fromCharCode(65+y) + (x+1);
// Independent transcription of the approved map sheets, with numbered columns and lettered rows.
const blocked = {
  "q5r3": "A3 A7 A9 A12 B3 B5 B7 B9 B12 C3 C5 C7 C10 D10 D12 F10 F12 G3 G5 G7 G10 H3 H5 H7 H9 H12 I3 I7 I9 I12",
  "q5r4": "B2 B3 B9 B10 B11 B12 C2 C3 C5 C6 C9 C10 C11 C12 D5 D6 F5 F6 G2 G3 G5 G6 G9 G10 G11 G12 H2 H3 H9 H10 H11 H12",
  "q5r5": "A3 A4 A5 B3 B4 B5 B12 C3 C4 C5 C8 C9 C10 D8 D9 D10 F8 F9 F10 G3 G4 G5 G8 G9 G10 H3 H4 H5 H12 I3 I4 I5",
  "q5r6": "A5 A10 B3 B5 B7 B10 B11 C3 C5 C7 C8 C10 C11 C12 D3 D8 F3 F5 F8 G3 G5 G7 G8 G10 G11 H3 H5 H7 H10 H11 I5 I10",
  "q5r7": "A6 B2 B4 B5 B6 B8 B10 B12 C2 C4 C5 C6 C8 C10 D8 E8 E11 F4 F5 F8 F11 G2 G4 G5 G6 G10 G11 H2 H6 H10 H11 I6",
  "q5r8": "A6 A7 A8 A9 A11 B3 B5 B7 B8 B9 B11 C3 C5 C12 D9 E11 F5 F9 F11 G3 G5 G12 H3 H5 H7 H8 H9 H11 I7 I8 I9 I11"
};
const guards = {
  "q5r3": {
    "C9": "Ranged D6",
    "C12": "Ranged D6",
    "D5": "Swift D6",
    "E8": "D8",
    "F6": "D8",
    "F11": "Ranged D6",
    "G12": "Swift D6"
  },
  "q5r4": {
    "B8": "Swift D6",
    "D8": "Armoured D8",
    "E4": "Swift D6",
    "E11": "Armoured D8",
    "F9": "Armoured D8",
    "F12": "D8",
    "G7": "D8"
  },
  "q5r5": {
    "C12": "Ranged D6",
    "D6": "Swift D8",
    "E8": "Swift D8",
    "F6": "D8",
    "F12": "D8",
    "G11": "Ranged D6",
    "H7": "D8"
  },
  "q5r6": {
    "B8": "D8",
    "D6": "Armoured D8",
    "D12": "Ranged D6",
    "E9": "Armoured D8",
    "E10": "Ranged D6",
    "F7": "Ranged D6",
    "F11": "Armoured D8"
  },
  "q5r7": {
    "B9": "Ranged D8",
    "C12": "Ranged D8",
    "D5": "Swift D8",
    "D11": "Armoured D8",
    "E7": "Armoured D8",
    "F6": "D6",
    "F9": "Swift D8",
    "H12": "D6"
  },
  "q5r8": {
    "B12": "Ranged D8",
    "D6": "Swift D6",
    "D8": "Armoured D8",
    "E10": "Boss D16",
    "F7": "Swift D6",
    "F8": "Armoured D8",
    "H12": "Ranged D8"
  }
};
function flood(room, start=[0,4], extra = new Set()) {
 const walls = new Set(ROOM_WALLS[room].map(p => p.join(',')));
 const seen = new Set([start.join(',')]), queue = [start];
 for(let i=0;i<queue.length;i++) for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
  const [x,y] = [queue[i][0]+dx,queue[i][1]+dy], key = [x,y].join(',');
  if(x<0||x>=13||y<0||y>=9||walls.has(key)||extra.has(key)||seen.has(key))continue;
  seen.add(key);queue.push([x,y]);
 }
 return seen;
}
for (let n=3;n<=8;n++) {
 const room='q5r'+n;
 test(room + ': every obstacle and enemy matches the approved sheet; scenery covers exactly those cells', () => {
  const expected=blocked[room].split(' ');
  assert.deepEqual(ROOM_WALLS[room].map(p=>square(...p)),expected);
  const cells=Q5_ROOMS[room].scenery.flatMap(p=>p.cells.map(c=>square(...c)));
  assert.equal(cells.length,expected.length);
  assert.deepEqual(new Set(cells),new Set(expected));
  const game=freshState();ensureCaravanTrialPlayer(game,'one','Tester',room);
  assert.deepEqual(Object.fromEntries(game.rooms[room].battle.enemies.map(e=>[square(e.x,e.y),e.name])),guards[room]);
  assert.equal(flood(room).size,117-expected.length);
  assert(flood(room).has('12,4'));
  // Both the upper and lower board halves connect to the entrance and exit.
  assert([...flood(room)].some(c=>c.endsWith(',0')));
  assert([...flood(room)].some(c=>c.endsWith(',8')));
 });
 test(room + ': normal doorway entry and four-player arrival use the same authored encounter', () => {
  const game=freshState();const previous='q5r'+(n-1);
  const hero=ensureCaravanTrialPlayer(game,'one','Tester',previous);
  game.rooms[previous].battle.status='cleared';hero.x=12;hero.y=4;
  rollMovement(game,hero.id);move(game,hero.id,'E');
  assert.equal(hero.room,room);assert.equal(square(hero.x,hero.y),'E1');
  assert.deepEqual(Object.fromEntries(game.rooms[room].battle.enemies.map(e=>[square(e.x,e.y),e.name])),guards[room]);
  for(const id of ['two','three','four'])ensureCaravanTrialPlayer(game,id,id,room);
  const players=Object.values(game.players);
  assert(players.every(p=>p.room===room&&!isWall(room,p.x,p.y)));
  assert.equal(new Set(players.map(p=>[p.x,p.y].join(','))).size,4);
  const gear=structuredClone(hero.inventory);hero.hp=53;
  ensureCaravanTrialPlayer(game,'one','Tester',room);
  assert.equal(hero.hp,53);assert.deepEqual(hero.inventory,gear);
 });
}

test('a legacy save relocates units out of new obstacles without replacing enemies, damage or player gear', () => {
 const game=freshState();const hero=ensureCaravanTrialPlayer(game,'one','Tester','q5r8');
 hero.x=2;hero.y=1;hero.hp=45;
 const enemies=game.rooms.q5r8.battle.enemies;
 enemies[0].hp=5;enemies[0].x=4;enemies[0].y=1;enemies.pop();
 const gear=structuredClone(hero.inventory);
 ensurePlayer(game,'one','Tester',null);
 assert(!isWall(hero.room,hero.x,hero.y));assert.equal(hero.hp,45);assert.deepEqual(hero.inventory,gear);
 assert.equal(enemies.length,6);assert.equal(enemies[0].hp,5);
 assert(enemies.every(e=>!isWall(hero.room,e.x,e.y)));
});

test('every new room loads complete WebP layers on demand and draws no occupied-square outlines', () => {
 const loaded=[];
 class Sprite {complete=true;naturalWidth=640;set src(path){this.path=path;loaded.push(path)}get src(){return this.path}}
 for(const [room,files] of Object.entries(artwork.QUEST5_FILES)) {
  artwork.initPremiumDesert(Sprite,room);assert(artwork.premiumDesertReady(room));
  const rects=[],draws=[];
  const ctx={save(){},restore(){},beginPath(){},clip(){},rect(...r){rects.push(r)},drawImage(img){draws.push(img.path)},getTransform(){return {a:1}}};
  assert(artwork.paintPremiumDesertWalls(ctx,{originX:0,originY:0,cell:1},ROOM_WALLS[room],room));
  assert.deepEqual(new Set(rects.slice(1).map(([x,y])=>square(x,y))),new Set(blocked[room].split(' ')));
  assert.equal(draws.length,Q5_ROOMS[room].scenery.length);
  for(const path of Object.values(files))assert.equal(readFileSync(new URL('../public/'+path.slice(2),import.meta.url)).toString('ascii',8,12),'WEBP');
 }
 assert.equal(loaded.length,new Set(loaded).size,'shared paintings are loaded only once');
 assert(!artwork.premiumDesertReady('q5r1'),'new room tests do not preload Caravan Gate');
});

test('an absent boss or obstacle image keeps that room on the complete existing fallback', async () => {
 const module=await import('../public/v2-premium-desert.mjs?missingBoss');
 class Sprite {naturalWidth=256;set src(path){this.complete=!path.includes('toll-boss')}}
 module.initPremiumDesert(Sprite,'q5r3');module.initPremiumDesert(Sprite,'q5r8');
 assert(module.premiumDesertReady('q5r3'));assert(!module.premiumDesertReady('q5r8'));
 assert.equal(module.paintPremiumDesertWalls({}, {}, ROOM_WALLS.q5r8, 'q5r8'),false);
});

test('Quest 5 test entry accepts only its eight authored rooms', () => {
 for(const room of ['q6r1','q5r9','q5r3;reset','camp']) assert.throws(()=>ensureCaravanTrialPlayer(freshState(),'one','Tester',room),/Unknown/);
});
