import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {freshState,ROOM_WALLS} from '../src/engine.mjs';
import {ensureWarrensTrialPlayer} from '../src/crypt-trial.mjs';
import {warrens} from '../public/v2-warrens-plan.mjs';
import * as art from '../public/v2-premium-monastery.mjs';

test('Warrens encounters, ordinary and rare nests, and tactical artwork',t=>{
  t.mock.method(Math,'random',()=>0);
  globalThis.Image=class {set src(url){assert.ok(existsSync(url),url.href);this.complete=true;this.naturalWidth=480;this.naturalHeight=480;this.url=url.pathname;}};
  try{
    for(const [id,room] of Object.entries(warrens)){
      const game=freshState();
      ensureWarrensTrialPlayer(game,'one','Tester',id);
      const {enemies,nests}=game.rooms[id].battle;
      assert.deepEqual(enemies.map(e=>[e.x,e.y]),room.spawns);
      const walls=ROOM_WALLS[id];
      const cells=room.blueprint.flatMap((row,y)=>[...row].flatMap((v,x)=>v==='#'?[[x,y]]:[]));
      assert.deepEqual(walls.map(String).sort(),cells.map(String).sort());
      assert.equal(nests.length,Number(id.slice(-1))<=2?2:1);
      for(const n of nests)assert.equal(room.blueprint[n.y][n.x],'.');
      art.loadRoom(id,[...enemies,{role:'swift',clone:true,parentId:'nest',faces:10},...([10,12,14,20].map(faces=>({role:'normal',faces,clone:true,parentId:'parent'})))]);
      assert(art.ready(id,walls));assert(!art.ready(id,[]));
      let calls=0;
      art.floor({drawImage(image){assert(image.url.endsWith('9-'+id.slice(-1)+'.webp'));calls++}}, {cell:80,originX:0,originY:0},id,walls);
      assert.equal(calls,1);assert(art.walls({}, {},id,walls));
    }
  }finally{delete globalThis.Image;}
});
