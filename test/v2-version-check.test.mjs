import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
const source=fs.readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
const root='https://test.example/dicebound-v2';
function makeWorker(){
 const sandbox={Request, Response, Headers, URL, TextEncoder, TextDecoder, Uint8Array, Date, crypto:webcrypto, btoa, atob, DurableObject:class {}};
 const stripped=source.replace(/^import .+;\s*$/gm,'').replace('export default {','globalThis.worker = {').replace('export class GameRoom extends DurableObject','class GameRoom extends DurableObject');
 runInNewContext(stripped,sandbox);
 return sandbox.worker;
}
function env(old=false,missing=null){
 const files={
  '/index.html':old?'<html>MEDIUM MAZES 13x9</html>':'<html data-build="v2-q6-art-20261115-r1"><select id="cinematicQ5Room"></select></html>',
  '/app.js':'/* initPremiumDesert v2-premium-giantwood.mjs?build=v2-q3-walls-20261114-r1 v2-premium-crypt.mjs?build=v2-q6-art-20261115-r1 */',
  '/styles.css':'/* .cin-room layout */',
  '/assets/premium-woodland/training-clearing-ground.jpg':'fake-image-bytes',
  '/assets/premium-desert/caravan-ground-q5-r1.webp':'fake-webp-bytes',
  '/assets/premium-desert/rushing-dunes-ground-r1.webp':'fake-dune-bytes',
 };
 for (const name of ['ridge-ground','caravan-ground','crossing-ground','shieldwall-ground','smuggler-ground','toll-ground','toll-boss-d16']) files['/assets/premium-desert/q5-' + name + '-r1.webp'] = 'fake-art';
 for(const name of ['entrance-ground','hollow-ground','gallery-ground','vault-ground','heart-ground','normal-d8','boss-d12'])files['/assets/premium-mine/q2-'+name+'-r2.webp']='fake-mine-art';
 for(const name of ['ruin-horizontal','ruin-vertical','ruin-corner-south','ruin-corner-north','ruin-step','hollow-root-bank'])files['/assets/premium-giantwood/'+name+'-walls-r1.webp']='fake-giant-wall-art';
 for(const name of ['crypt-floor','graveyard-floor','crypt-masonry','sarcophagus','ghost-atlas','zombie-atlas','teleporter-atlas','sentinel-atlas','drowned-boss'])files['/assets/premium-crypt/'+name+'-r1.webp']='fake-crypt-art';
 for(const name of ['v2-premium-crypt','v2-quest6-layouts','v2-crypt-sprite-crops'])files['/'+name+'.mjs']='fake-module';
 if(missing)delete files[missing];
 return {ASSETS:{fetch:async req=>{
   const value=files[new URL(req.url).pathname];
   return value===undefined?new Response('Missing',{status:404}):new Response(value);
 }}};
}
test('V2 public version endpoint confirms the matching Worker and cinematic assets',async()=>{
 const worker=makeWorker();
 const response=await worker.fetch(new Request(root+'/version'),env());
 assert.equal(response.status,200);
 const body=await response.json();
 assert.equal(body.worker,'dicebound-4-visual-v2');
 assert.equal(body.build,'v2-q6-art-20261115-r1');
 assert.equal(body.cinematicAssetsReady,true);
 assert.deepEqual(Object.values(body.checks),Array(38).fill(200));
});
test('V2 deployment probe detects accidental 1 November old UI files',async()=>{
 const worker=makeWorker();
 const response=await worker.fetch(new Request(root+'/version'),env(true));
 assert.equal(response.status,200);
 assert.equal((await response.json()).cinematicAssetsReady,false);
});
test('V2 deployment probe detects any missing new Quest 3 wall sprite',async()=>{
 const worker=makeWorker();
 for(const name of ['ruin-horizontal','ruin-vertical','ruin-corner-south','ruin-corner-north','ruin-step','hollow-root-bank']){
  const response=await worker.fetch(new Request(root+'/version'),env(false,'/assets/premium-giantwood/'+name+'-walls-r1.webp'));
  const body=await response.json();
  assert.equal(body.cinematicAssetsReady,false);
  assert.equal(body.checks['giant-'+name],404);
 }
});

test('V2 deployment probe detects missing Q6 artwork or renderer modules',async()=>{
 const worker=makeWorker();
 for(const [key,path] of [['crypt-ghost-atlas','/assets/premium-crypt/ghost-atlas-r1.webp'],['crypt-crypt-masonry','/assets/premium-crypt/crypt-masonry-r1.webp'],['crypt-renderer','/v2-premium-crypt.mjs'],['crypt-layouts','/v2-quest6-layouts.mjs'],['crypt-crops','/v2-crypt-sprite-crops.mjs']]){
  const response=await worker.fetch(new Request(root+'/version'),env(false,path));
  const body=await response.json();assert.equal(body.cinematicAssetsReady,false);assert.equal(body.checks[key],404);
 }
});
