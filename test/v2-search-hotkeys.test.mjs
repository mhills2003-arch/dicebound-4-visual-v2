import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const read=n=>readFileSync(new URL(n,new URL('../public/',import.meta.url)),'utf8');
const h=read('index.html'),j=read('app.js'),c=read('styles.css');
test('Cinematic left-margin search uses original treasure buttons rather than duplicate claims',()=>{
 for(const id of ['cinSearch','cinSearchToggle','cinSearchPanel','cinSearchSlots','cinSearchStatus','cinSearchClose'])assert.match(h,new RegExp('id="'+id+'"'));
 assert.match(j,/cinSearchSlots'\)\.append\(\$\('lootPanel'\)\)/);
 assert.match(j,/cinSearchHome\.insertBefore\(\$\('lootPanel'\),cinSearchNext\)/);
 assert.match(j,/updateLootPanel\(\);updateCinematicSearch\(\)/);
 assert.match(j,/btn\.addEventListener\('click',\(\)=>send\(\{type:'claim',slot\}\)\)/);
 assert.match(c,/\.cin-search\{display:block;position:absolute;left:16px/);
});
test('All ten key mappings use existing game buttons and never bypass disabled state',()=>{
 assert.match(j,/r:'rollMoveBtn',e:'endTurnQuickBtn',a:'attackBtn',f:'defendBtn',s:'specialBtn',i:'cinematicInventory',c:'cinematicShop',l:'cinematicLog'/);
 assert.match(j,/key==='p'/);
 assert.match(j,/key==='q'/);
 assert.match(j,/btn\.disabled\|\|btn\.hidden/);
 assert.match(j,/btn\.click\(\)/);
 assert.match(j,/ev\.repeat\|\|ev\.ctrlKey\|\|ev\.metaKey\|\|ev\.altKey\|\|textEntryFocused\(ev\)/);
 assert.match(j,/!chatDrawer\.hidden/);
 assert.match(j,/arrowleft:'W',arrowright:'E',w:'N',d:'E'/);
 assert.doesNotMatch(j,/a:'W',d:'E'/);
});
test('Fortify is relabelled without changing the original defend action',()=>{
 assert.match(h, /id="defendBtn"[^>]*>🛡 Fortify/);
 assert.match(j,/\$\('defendBtn'\)\.onclick=\(\)=>/);
});
test('Hotkey help and styles never change the actual playfield dimensions',()=>{
 assert.match(h,/id="cinematicKeys"/);
 assert.match(h,/id="cinHotkeyHelp"/);
 assert.match(c,/body\.hud-board-focus \.cin-hotkey-help:not\(\[hidden\]\)/);
 assert.doesNotMatch(c.slice(c.indexOf('/* V2 Search overlay')),/canvas-wrap\{[^}]*width/);
 assert.match(h,/styles\.css\?build=v2-cinematic-search-keys-20261102-r1/);
 assert.match(h,/app\.js\?build=v2-cinematic-search-keys-20261102-r1/);
});
