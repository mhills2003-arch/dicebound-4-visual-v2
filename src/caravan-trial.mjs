import {ensurePlayer,effectiveStats,selectClass,buyFromShop,equipItem,enterQuest} from './engine.mjs';
/** Called only in the separately named Caravan test world. Never alters campaign saves. */
export function ensureCaravanTrialPlayer(game,id,name){
 game.caravanTrial=true;game.unlockedQuest=Math.max(5,game.unlockedQuest||1);
 const player=ensurePlayer(game,id,name,null);
 if(player.caravanTrialStarter)return player;
 player.room='camp';player.level=6;player.xp=0;player.gold=1000;
 selectClass(game,id,'knight');player.maxHp=effectiveStats(player).maxHp;player.hp=player.maxHp;
 for(const sku of ['sword-rare','armour-rare']){
  buyFromShop(game,id,sku);const item=player.inventory.equipment.at(-1);
  equipItem(game,id,item.id,item.category==='Armour'?'armour':'weapon');
 }
 for(let i=0;i<3;i++)buyFromShop(game,id,'potion');
 player.caravanTrialStarter=true;enterQuest(game,id,5);
 return player;
}
