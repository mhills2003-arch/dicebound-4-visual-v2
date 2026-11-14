import {ensurePlayer,effectiveStats,selectClass,buyFromShop,equipItem,enterQuest} from './engine.mjs';

// Dedicated review worlds: the campaign save and its progression are untouched.
export function ensureMineTrialPlayer(game,id,name,startRoom='q2r1'){
 if(!/^q2r[1-5]$/.test(startRoom))throw new Error('Unknown Quest 2 test room');
 game.mineTrial=true;game.mineTrialRoom=startRoom;
 game.unlockedQuest=Math.max(2,game.unlockedQuest||1);
 const player=ensurePlayer(game,id,name,null);
 if(player.mineTrialStarter)return player;
 player.room='camp';player.level=3;player.xp=0;player.gold=1000;
 selectClass(game,id,'knight');player.maxHp=effectiveStats(player).maxHp;player.hp=player.maxHp;
 for(const sku of ['sword-common','armour-common']){
  buyFromShop(game,id,sku);const item=player.inventory.equipment.at(-1);
  equipItem(game,id,item.id,item.category==='Armour'?'armour':'weapon');
 }
 for(let i=0;i<3;i++)buyFromShop(game,id,'potion');
 player.questBookmarks??={};player.questBookmarks[2]={room:startRoom,x:0,y:3};
 enterQuest(game,id,2);player.mineTrialStarter=true;return player;
}
