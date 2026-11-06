// Rushing Dunes, panel 02 of QUEST5_REDESIGNED_MAPS_AND_ENEMIES_01_TO_04.png.
// Rows A–I run north to south. S is a Swift D6. Digits are ordinary dice.
export const DUNE_GRID = Object.freeze([
  '.#....#...#..',
  '.#.#.8#..##..',
  '.#.#..#..##8.',
  '...#S..#S#...',
  '...#...#.....',
  '...#..S#.6#..',
  '.#...#.#..#..',
  '.#...#.#..#6.',
  '.#...#.......'
]);

export const DUNE_ROWS = DUNE_GRID.map(row => row.replace(/[S68]/g, '.'));
const guards = DUNE_GRID.flatMap((row, y) => Array.from(row, (symbol, x) => ({symbol, x, y})))
  .filter(({symbol}) => 'S68'.includes(symbol));

export const DUNE_SPAWNS = guards.map(({x, y}) => [x, y]);
export const DUNE_FOES = guards.map(({symbol}) => ({
  faces: symbol === 'S' ? 6 : Number(symbol),
  role: symbol === 'S' ? 'swift' : 'normal',
  variant: 'normal'
}));

// Each painting follows one connected bank, including the staggered north-east one.
function bank(asset, x, y, w, h) {
  const cells = [];
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      if (DUNE_GRID[row][col] === '#') cells.push([col, row]);
    }
  }
  return {asset, x, y, w, h, cells};
}

export const DUNE_SCENERY = [
  bank('knife', 1, 0, 1, 3),
  bank('fluted', 6, 0, 1, 3),
  bank('hook', 9, 0, 2, 4),
  bank('westBank', 3, 1, 1, 5),
  bank('eastBank', 7, 3, 1, 5),
  bank('capped', 10, 5, 1, 3),
  bank('fluted', 1, 6, 1, 3),
  bank('knife', 5, 6, 1, 3)
];
