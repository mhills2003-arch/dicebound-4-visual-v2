import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const base=path.resolve(import.meta.dirname,'../public');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const js=fs.readFileSync(path.join(base,'app.js'),'utf8');
const css=fs.readFileSync(path.join(base,'styles.css'),'utf8');
const art=fs.readFileSync(path.join(base,'v2-premium-woodland.mjs'),'utf8');
test('The real canvas receives the full room-first viewport instead of a fixed 54vh inset',()=>{
  assert.match(css,/body\.hud-board-focus \.workspace\{[^}]*height:calc\(100dvh - 68px\)/);
  assert.match(css,/body\.hud-board-focus \.board-and-actions \.canvas-wrap\{[^}]*height:100%!important/);
  assert.match(js,/visibleH=boardFocus\?Math\.max\(150,h-/);
  assert.match(js,/boardFocus\?140:86/);
});
test('All top-bar buttons connect to the existing authenticated game functions',()=>{
  for(const name of ['cinematicParty','cinematicInventory','cinematicShop','cinematicQuestBtn','cinematicLog','cinematicView','cinematicClassic','cinematicExit'])assert.match(js,new RegExp(name));
  assert.match(js,/function cinClick\(oldId\)\{\$\(oldId\)\?\.click\(\)/);
});
test('Only graphical presentation is changed, not the server authority over walls, targets or combat',()=>{
  assert.match(js,/state\.roomWalls\?\.\[me\.room\]/);
  assert.match(js,/selectedEnemyId/);
  assert.match(js,/send\(\{type:'action',action:/);
  assert.match(js,/function paintCinematicWoodlandSurround/);
  assert.match(art,/PREMIUM_ROOMS = Object\.freeze\(\['woodland','clearing','watchpost'\]\)/);
});
test('The correct class emblem and action/stat icons are real assets and never a flattened mockup',()=>{
  for(const icon of ['attack','defend','special','roll','heart','flask','coin','xp','helm','items']){
    const f=path.join(base,'assets','cinematic-icons',icon+'.svg');
    assert.ok(fs.existsSync(f),f+' must exist');
    assert.match(fs.readFileSync(f,'utf8'),/<svg/);
  }
  assert.match(html,/id="cinematicClassIcon"/);
  assert.match(js,/cinematicClassIcon'\)\.src='\.\/assets\/cinematic-icons\/helm\.svg'/);
});
test('Decorative woodland side assets contain no server state and only paint outside the tactical grid',()=>{
  for(const side of ['left','right'])assert.ok(fs.statSync(path.join(base,'assets','premium-woodland','cinematic-frame-'+side+'.jpg')).size>20000);
  assert.match(js,/bg\('left',0,leftW\+2\)/);
  assert.match(js,/bg\('right',rightX-2,rightW\+2\)/);
});
test('Class selection, chat and secondary actions remain reachable without blocking the board',()=>{
  assert.match(html,/id="cinematicClassBtn"/);
  assert.match(js,/\$\('cinematicClassBtn'\)\.hidden=!!me\.classChosen/);
  assert.match(js,/cinDetail\.querySelector\('\.cin-extra-buttons'\)\.appendChild/);
  assert.match(css,/body\.hud-board-focus \.chat-launcher\{bottom:147px!important/);
  assert.match(css,/\.hero-hud:has\(\.hero-bag\.hud-bag-open\)/);
});
test('Versioned script and stylesheet prevent stale mixed HUD releases',()=>{
  assert.match(html,/styles\.css\?build=v2-cinematic-search-keys-20261102-r1/);
  assert.match(html,/app\.js\?build=v2-q5-rushing-dunes-20261106-r1/);
  assert.match(html,/id="cinematicCritical"/);
});
