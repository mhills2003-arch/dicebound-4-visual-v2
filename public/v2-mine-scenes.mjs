// Art footprints mirror the existing Easy Quest 2 collision map. No gameplay data.
export const MINE_WALL_BLUEPRINTS = Object.freeze({
 q2r1:['.........','.##....#.','..#....#.','.........','.....#...','.#...#.#.','.........'],
 q2r2:['.........','......#..','...##....','.........','...##....','.........','.........'],
 q2r3:['.........','...#.....','...#.....','...#..#..','...#..#..','......#..','.........'],
 q2r4:['.........','..###....','......#..','......#..','......#..','..###....','.........'],
 q2r5:['.........','...#.#...','...#.#...','.........','...#.#...','...#.#...','.........']
});
const piece=(asset,x,y,w,h,cells)=>Object.freeze({asset,x,y,w,h,cells:cells||Array.from({length:w*h},(_,i)=>[x+i%w,y+Math.floor(i/w)])});
export const MINE_SCENERY=Object.freeze({
 q2r1:[piece('elbow',1,1,2,2,[[1,1],[2,1],[2,2]]),piece('timber',7,1,1,2),piece('oreCart',5,4,1,2),piece('rubble',1,5,1,1),piece('rubble',7,5,1,1)],
 q2r2:[piece('rubble',6,1,1,1),piece('cyan',3,2,2,1),piece('cartTrain',3,4,2,1)],
 q2r3:[piece('amber',3,1,1,4),piece('amber',6,3,1,3)],
 q2r4:[piece('cartTrain',2,1,3,1),piece('amber',6,2,1,3),piece('cyan',2,5,3,1)],
 q2r5:[piece('amethyst',3,1,1,2),piece('amethyst',5,1,1,2),piece('amethyst',3,4,1,2),piece('amethyst',5,4,1,2)]
});
export const MINE_ACTORS=Object.freeze({
 q2r1:['normalD4','normalD6'],q2r2:['shinyD4'],q2r3:['normalD6','shinyD6'],
 q2r4:['normalD6','normalD8'],q2r5:['bossD12','shinyD6']
});
