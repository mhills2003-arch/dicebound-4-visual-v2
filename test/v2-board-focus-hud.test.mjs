import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');
const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
const engine=readFileSync(new URL('../src/engine.mjs',import.meta.url),'utf8');

test('V2 is board-first by default, reversible and retains all original active combat controls',()=>{
 assert.match(html,/<body class="hud-board-focus">/);
 for(const id of ['hudLayoutBtn','hudLogBtn','hudShopBtn','hudEncounterBtn','hudInventoryBtn','hudPartyBtn','hudRewardsBtn','rollMoveBtn','endTurnQuickBtn','attackBtn','specialBtn','potionBtn','defendBtn','gameCanvas']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(js,/localStorage\.getItem\('db4_v2_board_focus'\)!=='off'/);
 assert.match(js,/document\.body\.classList\.toggle\('hud-board-focus',boardFocus\)/);
 assert.match(css,/body\.hud-board-focus \.workspace\{display:block;max-width:none/);
 assert.match(css,/body\.hud-board-focus \.board-and-actions \.canvas-wrap\{width:100%/);
 assert.match(css,/body\.hud-board-focus \.action-dock\{order:3;width:100%/);
});
test('Log, shop, party, reward and inventory popups contain existing real widgets rather than copies',()=>{
 for(const key of ['merchantPanel','merchantStock','merchantSell','questRewardPanel','questRewardChoices','log','chatLauncher','chatDrawer','heroBag','people','roomMap'])assert.match(html,new RegExp('id="'+key+'"'));
 assert.match(js,/if\(panel==='shop'&&me\?\.room!=='camp'\)/);
 assert.match(js,/hudShade\.hidden=false;hudClose\.hidden=false/);
 assert.match(js,/pane\.classList\.add\('hud-panel-open'\)/);
 assert.match(js,/hudBag\.open=true;hudBag\.classList\.add\('hud-bag-open'\)/);
 assert.match(js,/\$\('returnCampBtn'\)\.onclick=\(\)=>me\?\.room==='camp'\?\(boardFocus\?openHudPanel\('shop'\)/);
 assert.match(js,/if\(hudOpenPanel\)\{closeHudPanel\(\);ev\.preventDefault\(\);return\}/);
 assert.match(css,/hud-panel-open\.hud-shop-only > section:not\(#merchantPanel\)/);
 assert.match(css,/hud-panel-open\.hud-log-only > section:not\(\.adventurelog\)/);
});
test('Board Focus affects UI only and preserves the current Quest 1 renderer and server rules',()=>{
 assert.match(js,/initPremiumWoodland\(\)/);
 assert.match(js,/paintPremiumWoodlandFloor\(ctx,s,me\.room\)/);
 assert.match(js,/paintPremiumWoodlandActor/);
 assert.match(js,/send\(\{type:'shop-buy',sku:item\.sku\}\)/);
 assert.match(js,/send\(\{type:'end-turn'\}\)/);
 assert.match(worker,/const ROOT='\/dicebound-v2'/);
 assert.match(engine,/woodland:/);
 assert(!html.includes('DICEBOUND4_V2_Q1_ROOM_1_2_PREMIUM_SCENERY_AND_ACTORS_PATCH.zip'));
});

test('Focus deployment does not mix old styles with new controls',()=>{
 assert.match(html,/styles\.css\?build=v2-q2-polish-20261113-r2/);
 assert.match(html,/app\.js\?build=v2-q2-polish-20261113-r2/);
 assert.match(html,/<style id="boardFocusCritical"/);
 assert.match(html,/body\.hud-board-focus \.side-left,body\.hud-board-focus \.side-right\{display:none\}/);
 assert.match(html,/body\.hud-board-focus \.sidebar\.hud-panel-open/);
 assert.match(html,/body\.hud-board-focus \.board-and-actions/);
});
test('Class selector stays accessible from a modal, but does not block the playing area',()=>{
 assert.match(html,/id="hudClassBtn"/);
 assert.match(js,/hudClass\.classList\.add\('hud-class-open'\)/);
 assert.match(js,/\$\('hudClassBtn'\)\.hidden=!!me\.classChosen/);
 assert.match(css,/#classSelectPanel\.hud-class-open:not\(\[hidden\]\)/);
});
