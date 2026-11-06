import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ROOM_WALLS} from '../src/engine.mjs';
import {MINE_WALL_BLUEPRINTS,MINE_FILES,paintPremiumMineConnectedWalls} from '../public/v2-premium-mine.mjs';
test('all five Q2 scenes retain exact server-authoritative collision coordinates',()=>{
 for(let r=1;r<=5;r++){
  const id=`q2r${r}`;const expected=MINE_WALL_BLUEPRINTS[id];
  const cells=expected.flatMap((line,y)=>[...line].flatMap((v,x)=>v==='#'?[[x,y]]:[]));
  assert.deepEqual(new Set(ROOM_WALLS[id].map(([x,y])=>`${x},${y}`)),new Set(cells.map(([x,y])=>`${x},${y}`)));
  assert(MINE_FILES[`${id}Obstacles`]);
  const name=`public/${MINE_FILES[`${id}Obstacles`].slice(2)}`;
  const png=fs.readFileSync(new URL('../'+name,import.meta.url));assert.equal(png.toString('hex',1,4),'504e47');
 }
});
test('rendering isolated and only changes the Quest 2 mine module and import wiring',()=>{
 const source=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(source,/paintPremiumMineConnectedWalls/);
 assert.match(source,/if\(!desertConnectedPainted&&!woodlandConnectedPainted&&!mineConnectedPainted&&!quarryConnectedPainted\)for/);
 assert.equal(typeof paintPremiumMineConnectedWalls,'function');
});

import {initPremiumMine} from '../public/v2-premium-mine.mjs';
test('connected art renders only for exactly matching room wall coordinates',()=>{
 class ImageStub{complete=true;naturalWidth=256;naturalHeight=256;set src(path){this.path=path}}
 initPremiumMine(ImageStub);
 const ctx={drawn:0,save(){},restore(){},drawImage(){this.drawn++}};
 const s={cell:100,originX:0,originY:0,iso:false};
 for(let n=1;n<=5;n++){
  const id=`q2r${n}`;const rows=MINE_WALL_BLUEPRINTS[id];
  const walls=rows.flatMap((row,y)=>[...row].flatMap((ch,x)=>ch==='#'?[[x,y]]:[]));
  const start=ctx.drawn;
  assert.equal(paintPremiumMineConnectedWalls(ctx,s,walls,id),true);
  assert.equal(ctx.drawn,start+1);
  assert.equal(paintPremiumMineConnectedWalls(ctx,s,[[0,0]],id),false);
  assert.equal(ctx.drawn,start+1);
 }
});
