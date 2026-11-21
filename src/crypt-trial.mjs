import {ensurePlayer, effectiveStats, selectClass, buyFromShop, equipItem, enterQuest} from './engine.mjs';

// Authenticated room trials use separate persistent worlds, like Q2 and Q5.
export function ensureCryptTrialPlayer(game, id, name, startRoom = 'q6r3') {
  if (!/^q6r[1-8]$/.test(startRoom)) throw new Error('Unknown Quest 6 test room');
  game.cryptTrial = true;game.cryptTrialRoom = startRoom;
  return startTrial(game,id,name,startRoom,6,'cryptTrialStarter');
}

export function ensureMonasteryTrialPlayer(game,id,name,startRoom){
  if(!/^q7r[1-8]$/.test(startRoom))throw new Error('Unknown Quest 7 test room');
  game.monasteryTrialRoom=startRoom;
  return startTrial(game,id,name,startRoom,7,'monasteryTrialStarter');
}

export function ensureDiceworksTrialPlayer(game,id,name,startRoom){
  if(!/^q8r[1-8]$/.test(startRoom))throw new Error('Unknown Quest 8 test room');
  game.diceworksTrialRoom=startRoom;
  return startTrial(game,id,name,startRoom,8,'diceworksTrialStarter',12);
}

function startTrial(game,id,name,startRoom,quest,starter,level=8){
  game.unlockedQuest=Math.max(quest,game.unlockedQuest||1);
  const player = ensurePlayer(game, id, name, null);
  if (player[starter]) return player;
  player.room = 'camp';player.level = level;player.xp = 0;player.gold = 1000;
  selectClass(game, id, 'knight');player.maxHp = effectiveStats(player).maxHp;player.hp = player.maxHp;
  for (const sku of ['sword-uncommon', 'armour-uncommon']) {
    buyFromShop(game, id, sku);const item = player.inventory.equipment.at(-1);
    equipItem(game, id, item.id, item.category === 'Armour' ? 'armour' : 'weapon');
  }
  for (let i = 0; i < 3; i++) buyFromShop(game, id, 'potion');
  player.questBookmarks ??= {};player.questBookmarks[quest] = {room: startRoom, x: 0, y: 4};
  enterQuest(game, id, quest);player[starter] = true;return player;
}
