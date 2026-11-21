import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {diceworks} from '../public/v2-diceworks-plan.mjs';
import {ensureDiceworksTrialPlayer} from '../src/crypt-trial.mjs';
import {freshState,ROOM_WALLS} from '../src/engine.mjs';

for (const [id,plan] of Object.entries(diceworks)) {
  test(id+' uses the approved occupied cells and defender starts',()=>{
    const game=freshState();
    const hero=ensureDiceworksTrialPlayer(game,'one','Tester',id);
    assert.equal(hero.room,id);
    const enemies=game.rooms[id].battle.enemies;
    assert.deepEqual(enemies.map(e=>[e.x,e.y]),plan.spawns);
    const cells=[];
    const asset=key=>assert.ok(existsSync(new URL('../public/assets/premium-diceworks/'+key+'.webp',import.meta.url)),key);
    asset('floors/8-'+id.slice(-1));
    for (const [name,x,y,w,h] of plan.machinery){
      asset('machinery/'+name);
      for(let j=0;j<h;j++)for(let i=0;i<w;i++)cells.push([x+i,y+j].join(','));
    }
    assert.deepEqual(cells.sort(),ROOM_WALLS[id].map(p=>p.join(',')).sort());
    assert.ok(cells.length>=30&&cells.length<=35);
    for(const e of enemies)asset('enemies/'+(e.variant==='boss'?'boss':e.role)+e.faces);
  });
}
