import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const base=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,base),'utf8');
test('full V2 source and assets have cinematic identity, not prior medium maze lab',()=>{
  const conf=read('wrangler.toml'),html=read('public/index.html'),js=read('public/app.js'),css=read('public/styles.css'),worker=read('src/worker.mjs');
  assert.match(conf,/name = "dicebound-4-visual-v2"/);
  assert.match(conf,/html_handling = "none"/);
  assert.match(html,/dicebound-v2-build.*v2-cinematic-restoration-20261102-r1/);
  assert.match(html,/id="cinematicRoom"/);
  assert.match(js,/cinematicRoom/);
  assert.match(css,/\.cin-room/);
  assert.doesNotMatch(html,/MEDIUM MAZES 13/);
  assert.match(worker,/\?\'\/index\.html\'/);
  assert.match(worker,/\/version/);
  for(const file of ['public/assets/premium-woodland/forest-ground.jpg','public/assets/premium-woodland/training-clearing-ground.jpg','public/assets/premium-woodland/d6-training.png','public/assets/cinematic-icons/heart.svg'])
    assert.ok(fs.statSync(new URL(file,base)).size>500);
});
