import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';

const workerSource=readFileSync(new URL('../src/worker.mjs', import.meta.url), 'utf8');
const config=readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');

function workerForRoutingTest(){
  // Only the request router is exercised; game Durable Objects are not instantiated.
  const sandbox={Request, Response, Headers, URL, TextEncoder, TextDecoder, Uint8Array, Date, crypto:webcrypto, btoa, atob, DurableObject:class {}};
  const source=workerSource.replace(/^import .+;\s*$/gm,'')
    .replace('export default {','globalThis.worker = {')
    .replace('export class GameRoom extends DurableObject','class GameRoom extends DurableObject');
  runInNewContext(source,sandbox,{filename:'worker-route-under-test.mjs'});
  return sandbox.worker;
}

const ROOT='https://test.example/dicebound-v2';
const vars={INVITE_TOKEN_1:'A'.repeat(36),INVITE_TOKEN_2:'B'.repeat(36),
  INVITE_TOKEN_3:'C'.repeat(36),INVITE_TOKEN_4:'D'.repeat(36),COOKIE_SECRET:'E'.repeat(56)};

function envWithAssets(){
  const hits=[];
  return { ...vars, ASSETS: {fetch: async request => {
    const pathname=new URL(request.url).pathname;
    hits.push(pathname);
    // Cloudflare `html_handling = none` does NOT map '/' to '/index.html'.
    // An invalid assumption here allowed an authenticated 404 regression.
    if(pathname==='/index.html')return new Response('<html>DICEBOUND-V2-APP</html>', {headers:{'content-type':'text/html'}});
    if(pathname==='/v2-art-preview.html')return new Response('<html>V2-ART-LAB</html>', {headers:{'content-type':'text/html'}});
    if(pathname==='/app.js')return new Response('/* app */', {headers:{'content-type':'text/javascript'}});
    return new Response('Not found',{status:404});
  }}, hits};
}

test('V2 disables Cloudflare HTML canonical redirects that leave authenticated prefix',()=>{
  assert.match(config,/^html_handling = "none"$/m);
  assert.match(config,/run_worker_first = true/);
  assert.match(workerSource,/assetUrl\.pathname=\(u\.pathname===ROOT\+'\/'\)\?'\/index\.html'/);
});

test('successful V2 login redirects into prefix and protected game + Art Lab paths resolve',async()=>{
  const worker=workerForRoutingTest();
  const e=envWithAssets();
  const login=new Request(`${ROOT}/api/login`,{
    method:'POST',
    headers:{Origin:'https://test.example','content-type':'application/x-www-form-urlencoded'},
    body:'code='+vars.INVITE_TOKEN_1,
    redirect:'manual'
  });
  const response=await worker.fetch(login,e);
  assert.equal(response.status,303);
  assert.equal(response.headers.get('location'),'/dicebound-v2/');
  const cookie=response.headers.get('set-cookie').split(';')[0];
  for(const [path, marker] of [['/','DICEBOUND-V2-APP'],['/v2-art-preview.html','V2-ART-LAB'],['/app.js','app']]){
    const result=await worker.fetch(new Request(ROOT+path,{headers:{cookie}}),e);
    assert.equal(result.status,200,path);
    assert.match(await result.text(),new RegExp(marker));
    assert.equal(result.headers.get('location'),null,'no unwanted canonical redirect');
  }
  assert.deepEqual(e.hits,['/index.html','/v2-art-preview.html','/app.js']);
  const forbidden=await worker.fetch(new Request(`${ROOT}/v2-art-preview.html`),e);
  assert.equal(forbidden.status,401,'Art Lab must remain gated behind V2 login');
});

// Regression for the user's failure: the *first navigation* to the V2 URL
// must show the login form unless a valid cookie already exists.
test('unauthenticated V2 URL shows login before any sign-in, including ChatGPT tracking query',async()=>{
  const worker=workerForRoutingTest();
  const e=envWithAssets();
  for(const suffix of ['/', '/?utm_source=chatgpt.com']){
    const res=await worker.fetch(new Request(ROOT+suffix),e);
    assert.equal(res.status,401);
    assert.match(await res.text(),/Parent-issued invitation code/);
  }
  assert.deepEqual(e.hits,[], 'unauthenticated requests must never access static assets');
  const outside=await worker.fetch(new Request('https://test.example/different-route'),e);
  assert.equal(outside.status,404);
});


test('non-secret health page identifies whether V2 Worker is receiving requests',async()=>{
  const worker=workerForRoutingTest();
  const e=envWithAssets();
  const res=await worker.fetch(new Request(`${ROOT}/health`),e);
  assert.equal(res.status,200);
  assert.equal(await res.text(),'DICEBOUND V2 router OK');
  assert.deepEqual(e.hits,[],'health should not depend on static asset deployment or login cookie');
});

test('Cloudflare none-mode asset root is not a substitute for explicit index.html',async()=>{
  const e=envWithAssets();
  const root=await e.ASSETS.fetch(new Request('https://test.example/'));
  assert.equal(root.status,404);
  const index=await e.ASSETS.fetch(new Request('https://test.example/index.html'));
  assert.equal(index.status,200);
});
