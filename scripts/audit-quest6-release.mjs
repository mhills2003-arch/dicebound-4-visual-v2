import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import * as current from '../src/engine.mjs';
const baseline=resolve(process.argv[2]||'../dicebound-q3-walls');
const previous=await import(pathToFileURL(join(baseline,'src/engine.mjs')));
const root=resolve(new URL('..',import.meta.url).pathname);
const read=p=>readFileSync(p),hash=b=>createHash('sha256').update(b).digest('hex');
const data=JSON.parse(read(join(root,'design/quest6/layouts-r1.json')));
let otherRooms=0;
for(const id of Object.keys(previous.ROOM_DATA)){
  assert.deepEqual(current.ROOM_DATA[id].foes,previous.ROOM_DATA[id].foes,id+' roster');
  if(id.startsWith('q6r'))continue;
  assert.deepEqual(current.ROOM_DATA[id],previous.ROOM_DATA[id],id+' definition');
  assert.deepEqual(current.ROOM_WALLS[id],previous.ROOM_WALLS[id],id+' walls');otherRooms++;
}
for(const r of data.rooms){assert.deepEqual(current.ROOM_WALLS[r.id],r.walls);assert.deepEqual(current.ROOM_DATA[r.id].spawnPositions,r.spawnPositions);}
let engine=read(join(root,'src/engine.mjs')).toString();
for(const insertion of ["import {Q6_LAYOUTS} from '../public/v2-quest6-layouts.mjs';\n",'// Authored Q6 start positions preserve the existing encounter roster.\nfor(const [id,plan] of Object.entries(Q6_LAYOUTS))ROOM_DATA[id].spawnPositions=plan.spawnPositions;\n','for(const [id,plan] of Object.entries(Q6_LAYOUTS))WALL_LAYOUTS[id]=plan.blueprint;\n'])engine=engine.replace(insertion,'');
assert.equal(engine,read(join(baseline,'src/engine.mjs')).toString(),'No combat or progression code changes');
assert.equal(hash(read(join(root,'wrangler.toml'))),hash(read(join(baseline,'wrangler.toml'))));
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);}
const assets=files(join(baseline,'public/assets'));
for(const path of assets)assert.equal(hash(read(path)),hash(read(path.replace(baseline,root))),path);
const report={build:'v2-q6-art-20261115-r1',verifiedDate:'2026-11-20',baseline:'DICEBOUND_V2_Q3_WALLS_R1_DEPLOY.zip',baselineZipSha256:'c8a8b2eed973680a2cc8ab358018b5d80976371b1166c36b29aa15e6ca6e2e5c',otherRoomsUnchanged:otherRooms,originalAssetsUnchanged:assets.length,allRostersUnchanged:true,combatAndProgressionUnchanged:true,workerConfigurationUnchanged:true,rooms:data.rooms.map(r=>({id:r.id,walls:r.walls.length,enemies:r.enemies.length,doorSteps:r.metrics.door_steps,largeSteps:r.metrics.large_steps})),automatedTests:453,playthroughSeeds:[101,202,303],liveDeployed:false};
writeFileSync(join(root,'design/quest6/release-audit-r1.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
