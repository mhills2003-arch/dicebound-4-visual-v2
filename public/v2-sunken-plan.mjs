// The approved 15 × 11 Sunken Kingdom boards. Coordinates are zero-based [x, y].
export const sunken = {
  q11r1: {
    blueprint: [
      ".....#.........",
      "..####.........",
      "..###.....##...",
      "......###.###..",
      "...######......",
      ".......#####...",
      "....#######....",
      "...............",
      "..#####.####...",
      "...##.######...",
      ".......#......."
    ],
    foes: [
      {faces: 14, role: 'zombie', variant: 'normal'},
      {faces: 16, role: 'swift', variant: 'normal'},
      {faces: 18, role: 'ranged', variant: 'normal'},
      {faces: 14, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'ghost', variant: 'normal'},
      {faces: 14, role: 'normal', variant: 'normal'},
      {faces: 14, role: 'zombie', variant: 'normal'},
      {faces: 16, role: 'swift', variant: 'normal'},
      {faces: 14, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'}
    ],
    spawns: [[8,2],[5,7],[9,4],[6,2],[13,4],[13,7],[8,7],[11,4],[9,7],[11,7],[12,5]],
    hazards: [[6,7],[10,7]],
    hazardPhaseOffset: 0
  },
  q11r2: {
    blueprint: [
      "......##.......",
      "..#######..##..",
      "..#######..###.",
      "..#######.####.",
      "...............",
      "...............",
      ".......#####...",
      "...###.#.......",
      "..####.####....",
      "...###.........",
      "......##......."
    ],
    foes: [
      {faces: 14, role: 'ranged', variant: 'normal'},
      {faces: 16, role: 'armoured', variant: 'normal'},
      {faces: 18, role: 'zombie', variant: 'normal'},
      {faces: 14, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'healer', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 14, role: 'swift', variant: 'normal'},
      {faces: 14, role: 'ranged', variant: 'normal'},
      {faces: 16, role: 'armoured', variant: 'normal'},
      {faces: 18, role: 'zombie', variant: 'normal'},
      {faces: 14, role: 'normal', variant: 'normal'}
    ],
    spawns: [[9,7],[9,4],[11,4],[11,8],[12,5],[13,8],[5,4],[8,9],[6,7],[13,4],[12,9]],
    hazards: [[4,4],[4,5],[6,6],[7,5],[8,4],[10,5],[10,9]],
    hazardPhaseOffset: 1
  },
  q11r3: {
    blueprint: [
      ".......#.......",
      "..##..#######..",
      "..###......###.",
      "......####.....",
      "....###.##.....",
      ".....##.###....",
      "...............",
      ".######...####.",
      "...####...####.",
      "....###...####.",
      ".....#........."
    ],
    foes: [
      {faces: 14, role: 'swift', variant: 'normal'},
      {faces: 16, role: 'ranged', variant: 'normal'},
      {faces: 18, role: 'teleporter', variant: 'normal'},
      {faces: 14, role: 'armoured', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 14, role: 'ranged', variant: 'normal'},
      {faces: 14, role: 'swift', variant: 'normal'},
      {faces: 16, role: 'ranged', variant: 'normal'},
      {faces: 14, role: 'armoured', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'}
    ],
    spawns: [[5,6],[10,3],[11,4],[9,6],[13,1],[11,6],[9,2],[7,6],[12,3],[8,7],[13,3],[13,6]],
    hazards: [[4,3],[6,6],[8,2],[10,6]],
    hazardPhaseOffset: 2
  },
  q11r4: {
    blueprint: [
      "........#......",
      "..####.####....",
      "..####.####....",
      "..###.######...",
      "...............",
      "...##.###.####.",
      "....#.#######..",
      "....#####.##...",
      "...............",
      "...#######.....",
      "....#.........."
    ],
    foes: [
      {faces: 16, role: 'ghost', variant: 'normal'},
      {faces: 18, role: 'ghost', variant: 'normal'},
      {faces: 20, role: 'zombie', variant: 'normal'},
      {faces: 16, role: 'healer', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 20, role: 'swift', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'ghost', variant: 'normal'},
      {faces: 20, role: 'zombie', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 20, role: 'swift', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'}
    ],
    spawns: [[8,4],[8,8],[11,2],[12,7],[13,4],[12,3],[6,4],[9,7],[11,4],[11,8],[13,8],[13,6]],
    hazards: [[4,4],[6,8],[8,4],[10,8]],
    hazardPhaseOffset: 0
  },
  q11r5: {
    blueprint: [
      ".........#.....",
      "........######.",
      "..#####.######.",
      "..#####.#####..",
      "...............",
      "......###.###..",
      "......###.###..",
      ".......######..",
      "..####.....##..",
      "..#####.##.....",
      "........#......"
    ],
    foes: [
      {faces: 16, role: 'armoured', variant: 'normal'},
      {faces: 18, role: 'armoured', variant: 'normal'},
      {faces: 20, role: 'ranged', variant: 'normal'},
      {faces: 16, role: 'ranged', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'armoured', variant: 'normal'},
      {faces: 18, role: 'armoured', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'}
    ],
    spawns: [[5,4],[11,4],[4,5],[9,4],[13,4],[13,3],[7,4],[4,7],[6,7],[12,9],[13,7],[13,8]],
    hazards: [[6,7],[10,8]],
    hazardPhaseOffset: 1
  },
  q11r6: {
    blueprint: [
      "....##.........",
      ".######....###.",
      "..##.......###.",
      ".....###.#####.",
      "...###.........",
      "...######......",
      "...............",
      "....####.#####.",
      "...######.####.",
      "....#####.####.",
      ".......#......."
    ],
    foes: [
      {faces: 16, role: 'armoured', variant: 'normal'},
      {faces: 18, role: 'ranged', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'},
      {faces: 16, role: 'ninja', variant: 'normal'},
      {faces: 18, role: 'zombie', variant: 'normal'},
      {faces: 20, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'armoured', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'},
      {faces: 18, role: 'zombie', variant: 'normal'},
      {faces: 20, role: 'normal', variant: 'normal'},
      {faces: 16, role: 'normal', variant: 'normal'}
    ],
    spawns: [[5,2],[7,4],[12,4],[9,6],[13,4],[11,6],[7,1],[7,6],[9,4],[11,5],[13,5],[12,6],[8,2]],
    hazards: [[4,3],[6,6],[8,2],[10,6]],
    hazardPhaseOffset: 2
  },
  q11r7: {
    blueprint: [
      ".....##........",
      "..#####.###....",
      "..####.####....",
      "..####.####....",
      "...............",
      ".....#######...",
      "...#####.####..",
      "......##.####..",
      ".####....####..",
      ".######........",
      ".....##........"
    ],
    foes: [
      {faces: 18, role: 'ghost', variant: 'normal'},
      {faces: 20, role: 'zombie', variant: 'normal'},
      {faces: 22, role: 'teleporter', variant: 'normal'},
      {faces: 18, role: 'healer', variant: 'normal'},
      {faces: 20, role: 'armoured', variant: 'normal'},
      {faces: 22, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'ghost', variant: 'normal'},
      {faces: 20, role: 'zombie', variant: 'normal'},
      {faces: 22, role: 'teleporter', variant: 'normal'},
      {faces: 20, role: 'armoured', variant: 'normal'},
      {faces: 22, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'}
    ],
    spawns: [[8,4],[11,2],[11,4],[13,7],[12,3],[13,6],[6,4],[7,8],[8,9],[11,9],[12,5],[13,9],[9,4]],
    hazards: [[4,4],[6,8],[8,4],[10,9]],
    hazardPhaseOffset: 0
  },
  q11r8: {
    blueprint: [
      ".....##........",
      "..#######..###.",
      "..###......###.",
      "..##..####.....",
      ".........#####.",
      "......#######..",
      "...............",
      "......##.#####.",
      "..#######.####.",
      "..#######.####.",
      ".....#........."
    ],
    foes: [
      {faces: 18, role: 'ranged', variant: 'normal'},
      {faces: 20, role: 'armoured', variant: 'normal'},
      {faces: 22, role: 'ninja', variant: 'normal'},
      {faces: 18, role: 'ranged', variant: 'normal'},
      {faces: 20, role: 'swift', variant: 'normal'},
      {faces: 22, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'},
      {faces: 20, role: 'armoured', variant: 'normal'},
      {faces: 22, role: 'ninja', variant: 'normal'},
      {faces: 20, role: 'swift', variant: 'normal'},
      {faces: 22, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'}
    ],
    spawns: [[10,3],[10,1],[9,2],[9,6],[12,3],[13,5],[5,2],[11,6],[5,6],[7,6],[13,3],[13,6],[7,2],[8,7]],
    hazards: [[4,4],[6,6],[8,2],[10,6]],
    hazardPhaseOffset: 1
  },
  q11r9: {
    blueprint: [
      "......##.......",
      ".####.#######..",
      "..####.######..",
      "..####.######..",
      "...............",
      "...#######.....",
      "...##...##.....",
      "......###..###.",
      "..###.....####.",
      "..#######..###.",
      "....#.........."
    ],
    foes: [
      {faces: 18, role: 'ghost', variant: 'normal'},
      {faces: 20, role: 'ghost', variant: 'normal'},
      {faces: 22, role: 'ranged', variant: 'normal'},
      {faces: 18, role: 'armoured', variant: 'normal'},
      {faces: 20, role: 'ninja', variant: 'normal'},
      {faces: 22, role: 'healer', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'},
      {faces: 20, role: 'normal', variant: 'normal'},
      {faces: 18, role: 'ghost', variant: 'normal'},
      {faces: 22, role: 'ranged', variant: 'normal'},
      {faces: 18, role: 'armoured', variant: 'normal'},
      {faces: 20, role: 'ninja', variant: 'normal'},
      {faces: 22, role: 'healer', variant: 'normal'},
      {faces: 18, role: 'normal', variant: 'normal'}
    ],
    spawns: [[8,4],[8,8],[11,4],[13,4],[12,5],[13,2],[6,4],[9,9],[10,5],[10,6],[9,7],[13,6],[11,6],[7,8]],
    hazards: [[4,4],[6,8],[8,4],[10,7]],
    hazardPhaseOffset: 2
  },
  q11r10: {
    blueprint: [
      "........##.....",
      "..#####.######.",
      "..#######.####.",
      "..####......##.",
      ".......##.#....",
      "......###.####.",
      "......#######..",
      "...#...........",
      "..#####.######.",
      ".#####.#######.",
      "........#......"
    ],
    foes: [
      {faces: 24, role: 'ninja', variant: 'boss'},
      {faces: 22, role: 'ghost', variant: 'normal'},
      {faces: 24, role: 'armoured', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'},
      {faces: 22, role: 'ranged', variant: 'normal'},
      {faces: 24, role: 'zombie', variant: 'normal'},
      {faces: 20, role: 'normal', variant: 'normal'},
      {faces: 22, role: 'swift', variant: 'normal'},
      {faces: 22, role: 'ghost', variant: 'normal'},
      {faces: 24, role: 'armoured', variant: 'normal'},
      {faces: 20, role: 'healer', variant: 'normal'},
      {faces: 22, role: 'ranged', variant: 'normal'},
      {faces: 24, role: 'zombie', variant: 'normal'},
      {faces: 20, role: 'normal', variant: 'normal'},
      {faces: 22, role: 'swift', variant: 'normal'}
    ],
    spawns: [[12,4],[11,3],[9,3],[13,4],[9,4],[6,4],[7,3],[7,1],[8,7],[9,7],[12,7],[13,7],[13,6],[7,8],[5,7]],
    hazards: [[4,4],[6,7],[8,3],[10,7]],
    hazardPhaseOffset: 0
  },
};

export function sunkenSprite(enemy) {
  const prefix = enemy.variant === 'boss' ? 'boss-' : '';
  const tier = enemy.faces > 20 ? '-d' + enemy.faces : '';
  return prefix + (enemy.role || 'normal') + tier;
}

export const sunkenNames = {
  "normal": "Quay Sentinel",
  "swift": "Skimming Ray",
  "ranged": "Harpooner",
  "armoured": "Breakwater Guard",
  "zombie": "Keelwalker",
  "ghost": "Lantern Wisp",
  "healer": "Pearl Keeper",
  "teleporter": "Undertow Gate",
  "ninja": "Reefstalker",
  "normal-d22": "Cathedral Bell Warden",
  "teleporter-d22": "Vesper Gate",
  "ninja-d22": "Blackwater Veil",
  "ranged-d22": "Vault Arbalist",
  "healer-d22": "Nacre Cantor",
  "ghost-d22": "Reliquary Wraith",
  "swift-d22": "Riptide Razor",
  "armoured-d24": "Abyssal Bulwark",
  "zombie-d24": "Ossuary Hulk",
  "boss-ninja-d24": "Tide Sovereign"
};
