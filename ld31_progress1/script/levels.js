function createLevel(tiles, events) {
	var level = {};
	level.tiles = new Array(level.width = tiles[0].length);
	level.height = tiles.length;
	for (var i = 0; i < level.width; i++)
		level.tiles[i] = new Array(level.height);
	for (var y = 0; y < level.height; y++) {
		for (var x = 0; x < level.width; x++) {
			level.tiles[x][y] = {};
			switch (tiles[y].charAt(x)) {
				case '.': level.tiles[x][y].type = 'floor'; break;
				case '#': level.tiles[x][y].type = 'wall'; break;
				case ' ': level.tiles[x][y].type = 'pit'; break;
				case ',': level.tiles[x][y].type = 'block'; break;
				case 'x': level.tiles[x][y].type = 'target'; break;
				case 'o': level.tiles[x][y].type = 'button'; break;
				case '*': level.tiles[x][y].type = 'dispenser'; break;
				case 'p': level.start = { x: x, y: y }; level.tiles[x][y].type = 'floor'; break;
			}
		}
	}
	for (var i = events.length - 1; i >= 0; i--)
		if ((typeof events[i].x !== 'undefined') && (typeof events[i].y !== 'undefined'))
			level.tiles[events[i].x][events[i].y].activated = events[i].action;
		else
			level.onStart = events[i].action;
	return level;
}

/***********
x - target
o - button
. - floor
, - block
* - dispenser
# - wall
************/

var levels = {
	level1: createLevel([
			'                    ',
			'                    ',
			'                    ',
			'                    ',
			'                    ',
			'  #####             ',
			'  #...#             ',
			'  #.p.#             ',
			'  #...#             ',
			'  #####             ',
			'                    ',
			'                    ',
			'                    ',
			'                    ',
			'                    '
		],
		[
			{
				x: 17, y: 7,
				action: function(game, tile) {
					if (tile.pressed)
						game.loadLevel(levels.level2, false, /*function(game, x, y) 
							{ 
								if (y == 0) return x / 40;
								if (x == game.width - 1) return y / 40 + 0.5;
								if (y == game.height - 1) return (game.width - x) / 40 + 0.875;
								if (x == 0) return (game.height - y) / 40 + 1.375;
								return 1.75;*/
								function(game, x, y) { return Math.random() * 3; 
							});
				}
			},
			{
				x: 8, y: 7,
				action: function(game, tile) {
					if (tile.pressed)
						for (var i = 0; i < 8; i++)
							game.tiles[i + 9][7].change('floor', i / 8);
				}
			},
			{
				// on start
				action: function(game) {
					game.message('Please come to the testing chamber', 3);
					game.tiles[6][7].change('floor', 5.5);
					game.tiles[7][7].change('floor', 5.5);
					game.tiles[8][7].change('button', 5.5);
					game.tiles[17][7].change('target', 7);
				}
			}
		]),
	level2: createLevel([
			'####################',
			'#........###.......#',
			'#........###...o...#',
			'#........###.......#',
			'#........###.......#',
			'#........###.......#',
			'#........###.......#',
			'#..x......#........#',
			'#........###.......#',
			'#........###.......#',
			'#........###.......#',
			'#........###.......#',
			'#........###...*...#',
			'#........###.......#',
			'####################'
		],
		[
			{
				x: 15, y: 2,
				action: function(game, tile) {
					if (tile.pressed)
						game.tiles[10][7].change('floor');
					else
						game.tiles[10][7].change('wall');
				}
			},
			{
				x: 3, y: 7,
				action: function(game, tile) {
					game.loadLevel(levels.level3, false, function(game, x, y) { return Math.random() * 3; });
				}
			}
		]),
	level3: createLevel([
			'####################',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#..................#',
			'####################'
		],
		[
		])
};
