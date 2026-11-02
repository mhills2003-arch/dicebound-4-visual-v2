import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
const wrangler=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('visual V2 uses separate path, cookie and durable binding',()=>{
  assert.match(worker,/const ROOT='\/dicebound-v2'/);
  assert.match(worker,/const COOKIE='db4_v2_session'/);
  assert.match(worker,/env\.V2_GAME_ROOM\.get\(env\.V2_GAME_ROOM\.idFromName\(/);
  assert.doesNotMatch(worker,/env\.GAME_ROOM\./);
  assert.doesNotMatch(worker,/env\.GAME_ROOM\.get/);
});
test('V2 wrangler cannot take over existing custom domain and gates every asset',()=>{
  assert.match(wrangler,/name = "dicebound-4-visual-v2"/);
  assert.match(wrangler,/run_worker_first = true/);
  assert.match(wrangler,/workers_dev = true/);
  assert.match(wrangler,/new_sqlite_classes = \["GameRoom"\]/);
  assert.doesNotMatch(wrangler,/^\s*(routes?|custom_domain)\s*=/m);
});
test('V2 is visually identified and leaves campaign markup intact',()=>{
  assert.match(html,/V2 VISUAL SANDBOX/);
  assert.match(html,/id="gameCanvas"/);
  assert.match(html,/id="mazeControlPanel"/);
});
