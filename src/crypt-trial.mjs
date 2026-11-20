import {ensurePlayer, effectiveStats, selectClass, buyFromShop, equipItem, enterQuest} from './engine.mjs';

// Authenticated room trials use separate persistent worlds, like Q2 and Q5.
export function ensureCryptTrialPlayer(game, id, name, startRoom = 'q6r3') {
  if (!/^q6r[1-8]$/.test(startRoom)) throw new Error('Unknown Quest 6 test room');
  game.cryptTrial = true;game.cryptTrialRoom = startRoom;
  game.unlockedQuest = Math.max(6, game.unlockedQuest || 1);
  const player = ensurePlayer(game, id, name, null);
  if (player.cryptTrialStarter) return player;
  player.room = 'camp';player.level = 8;player.xp = 0;player.gold = 1000;
  selectClass(game, id, 'knight');player.maxHp = effectiveStats(player).maxHp;player.hp = player.maxHp;
  for (const sku of ['sword-uncommon', 'armour-uncommon']) {
    buyFromShop(game, id, sku);const item = player.inventory.equipment.at(-1);
    equipItem(game, id, item.id, item.category === 'Armour' ? 'armour' : 'weapon');
  }
  for (let i = 0; i < 3; i++) buyFromShop(game, id, 'potion');
  player.questBookmarks ??= {};player.questBookmarks[6] = {room: startRoom, x: 0, y: 4};
  enterQuest(game, id, 6);player.cryptTrialStarter = true;return player;
}
