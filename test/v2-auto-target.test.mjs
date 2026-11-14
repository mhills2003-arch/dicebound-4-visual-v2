import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,rollMovement,submitSequentialAction,endTurn} from '../src/engine.mjs';
import {ensureMineTrialPlayer} from '../src/mine-trial.mjs';
function encounter(){
 const game=freshState(),p=ensureMineTrialPlayer(game,'one','Tester'),b=game.rooms[p.room].battle;
 b.enemies.forEach((e,i)=>Object.assign(e,{x:i?0:1,y:i?2:3,hp:100,maxHp:100,atk:1,armourDie:4}));
 rollMovement(game,p.id,Date.now(),()=>.5);return{game,p,b};
}
test('Attack with no selected enemy damages an adjacent foe instead of targeting the player',()=>{
 for(const target of [undefined,null]){
  const {game,p,b}=encounter();submitSequentialAction(game,p.id,{type:'attack',target});
  endTurn(game,p.id,Date.now(),()=>.999);
  assert(b.enemies[0].hp<100);assert.equal(b.enemies[1].hp,100);
  assert(!game.log.some(e=>e.text.includes('finds no enemy in range')));
 }
});
test('an explicitly selected enemy remains the target',()=>{
 const {game,p,b}=encounter();submitSequentialAction(game,p.id,{type:'attack',target:b.enemies[1].id});
 endTurn(game,p.id,Date.now(),()=>.999);
 assert.equal(b.enemies[0].hp,100);assert(b.enemies[1].hp<100);
});
test('a special with no selected enemy also resolves against a foe',()=>{
 const {game,p,b}=encounter(),weapon=p.inventory.equipment.find(i=>i.id===p.equipped.weapon);
 weapon.rarity='Legendary';weapon.bonusDie=12;
 submitSequentialAction(game,p.id,{type:'special',target:null});endTurn(game,p.id,Date.now(),()=>.999);
 assert(b.enemies[0].hp<100);assert(Number.isInteger(p.specialUsedAt[weapon.id]));
});
test('an untargeted healing potion still defaults to the player',()=>{
 const {game,p}=encounter();p.hp=20;
 submitSequentialAction(game,p.id,{type:'potion',target:null});endTurn(game,p.id,Date.now(),()=>0);
 assert(p.hp>20);assert.equal(p.inventory.potions.length,2);
});
