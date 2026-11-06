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
function env(old=false){
 const files={
  '/index.html':old?'<html>MEDIUM MAZES 13x9</html>':'<html data-build="v2-quest1-soft-edges-q5-caravan-r1"><button id="cinematicCaravanTest">Try 5-1</button></html>',
  '/app.js':'/* initPremiumDesert */',
  '/styles.css':'/* .cin-room layout */',
  '/assets/premium-woodland/training-clearing-ground.jpg':'fake-image-bytes',
  '/assets/premium-desert/caravan-ground-q5-r1.webp':'fake-webp-bytes',
 };
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
 assert.equal(body.build,'v2-quest1-soft-edges-q5-caravan-r1');
 assert.equal(body.cinematicAssetsReady,true);
 assert.deepEqual(Object.values(body.checks),[200,200,200,200,200]);
});
test('V2 deployment probe detects accidental 1 November old UI files',async()=>{
 const worker=makeWorker();
 const response=await worker.fetch(new Request(root+'/version'),env(true));
 assert.equal(response.status,200);
 assert.equal((await response.json()).cinematicAssetsReady,false);
});
