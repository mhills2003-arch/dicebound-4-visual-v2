import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {rooms} from '../public/v2-monastery-plan.mjs';
import {ensureMonasteryTrialPlayer} from '../src/crypt-trial.mjs';
import {freshState,ROOM_WALLS,ROOM_DATA} from '../src/engine.mjs';

for(const [room,objects] of Object.entries(rooms)){
  test(room+' starts its isolated encounter with matching artwork and collision footprints',()=>{
    const state=freshState();
    const player=ensureMonasteryTrialPlayer(state,'one','Tester',room);
    assert.equal(player.room,room);
    const cells=[];
    function asset(name){
      assert.ok(existsSync(new URL('../public/assets/premium-monastery/'+name+'.webp',import.meta.url)),name);
    }
    asset('terrain/7-'+room.slice(-1));
    for(const [name,x,y,w,h] of objects){
      asset('obstacles/'+name);
      for(let i=0;i<w;i++)for(let j=0;j<h;j++)cells.push([x+i,y+j].join(','));
    }
    assert.deepEqual(cells.sort(),ROOM_WALLS[room].map(p=>p.join(',')).sort());
    const enemies=state.rooms[room].battle.enemies;
    assert.equal(enemies.length,ROOM_DATA[room].foes.length);
    for(const e of enemies)asset('enemies/'+(e.role==='normal'?'ordinary':e.role)+'-d'+e.faces);
    player.gold=123;
    ensureMonasteryTrialPlayer(state,'one','Tester',room);
    assert.equal(player.gold,123);
    assert.equal(state.rooms[room].battle.enemies.length,enemies.length);
  });
}
