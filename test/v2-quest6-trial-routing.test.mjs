import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
test('authenticated Q6 trials are separate and require the existing login',async()=>{
 const sandbox={Request,Response,Headers,URL,TextEncoder,TextDecoder,Uint8Array,Date,crypto:webcrypto,btoa,atob,DurableObject:class{}};
 const source=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8').replace(/^import .+;\s*$/gm,'').replace('export default {','globalThis.worker={').replace('export class GameRoom extends DurableObject','class GameRoom extends DurableObject');
 runInNewContext(source,sandbox);const names=[],headers=[];
 const env={INVITE_TOKEN_1:'A'.repeat(36),INVITE_TOKEN_2:'B'.repeat(36),COOKIE_SECRET:'C'.repeat(48),V2_GAME_ROOM:{idFromName(n){names.push(n);return n},get(){return{fetch(r){headers.push(r.headers.get('x-dicebound-trial'));return new Response('OK')}}}}};
 const login=await sandbox.worker.fetch(new Request('https://test.example/dicebound-v2/api/login',{method:'POST',headers:{Origin:'https://test.example','content-type':'application/x-www-form-urlencoded'},body:'code='+env.INVITE_TOKEN_1}),env);
 const cookie=login.headers.get('set-cookie').split(';')[0];
 for(const suffix of ['','?trial=balance-v9','?trial=caravan-q5-r1','?trial=rushing-dunes-q5-r2',...Array.from({length:6},(_,i)=>'?trial=quest5-room'+(i+3)),...Array.from({length:5},(_,i)=>'?trial=mine-q2-r'+(i+1)),...Array.from({length:8},(_,i)=>'?trial=crypt-q6-r'+(i+1)),'?trial=unrecognised']){
  const r=await sandbox.worker.fetch(new Request('https://test.example/dicebound-v2/api/ws'+suffix,{headers:{cookie,Upgrade:'websocket','x-dicebound-trial':'caravan-q5-r1'}}),env);assert.equal(r.status,200);
 }
 assert.deepEqual(names,['quest-01-two-player-prototype','quest-v9-balance-trial','quest-v2-caravan-q5-r1','quest-v2-rushing-dunes-q5-r2',...Array.from({length:6},(_,i)=>'quest-v2-complete-q5-r'+(i+3)),...Array.from({length:5},(_,i)=>'quest-v2-mine-q2-r'+(i+1)),...Array.from({length:8},(_,i)=>'quest-v2-crypt-q6-r'+(i+1)),'quest-01-two-player-prototype']);
 assert.deepEqual(headers,[null,'balance-v9','caravan-q5-r1','rushing-dunes-q5-r2',...Array.from({length:6},(_,i)=>'quest5-room'+(i+3)),...Array.from({length:5},(_,i)=>'mine-q2-r'+(i+1)),...Array.from({length:8},(_,i)=>'crypt-q6-r'+(i+1)),null]);
 const denied=await sandbox.worker.fetch(new Request('https://test.example/dicebound-v2/api/ws?trial=crypt-q6-r3',{headers:{Upgrade:'websocket'}}),env);
 assert.equal(denied.status,401);assert.equal(names.length,24);
});
