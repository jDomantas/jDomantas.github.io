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
		if (typeof events[i].action !== 'undefined') {
			if ((typeof events[i].x !== 'undefined') && (typeof events[i].y !== 'undefined'))
				level.tiles[events[i].x][events[i].y].activated = events[i].action;
			else
				level.onStart = events[i].action;
		}
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
				action: function(game, tile, app) {
					if (tile.playerPressed)
						game.loadLevel(app, levels.level2, false, function(game, x, y) 
							{ 
								if (y == 4) return x / 80;
								if (x == game.width - 1) return y / 80 + 0.25;
								if (y == game.height - 5) return (game.width - x) / 80 + 0.65 / 2;
								if (x == 0) return (game.height - y) / 80 + 1.15 / 2;
								return 1.3 / 2;
							});
				}
			},
			{
				x: 8, y: 7,
				action: function(game, tile, app) {
					if (tile.pressed)
						for (var i = 0; i < 8; i++)
							game.tiles[i + 9][7].change('floor', i / 8);
				}
			},
			{
				// on start
				action: function(app, game) {
					game.message(app, 'Test subject #4218, please come to the testing chamber.', 1.8);
					game.tiles[6][7].change('floor', 4.5);
					game.tiles[7][7].change('floor', 4.6);
					game.tiles[8][7].change('button', 4.7);
					game.tiles[17][7].change('target', 2.5);
				}
			}
		]),
	level2: createLevel([
			'                    ',
			'                    ',
			'                    ',
			'                    ',
			'####################',
			'#..................#',
			'#..................#',
			'#..x.............p.#',
			'#..................#',
			'#..................#',
			'####################',
			'                    ',
			'                    ',
			'                    ',
			'                    '
		],
		[
			{
				action: function(app, game) {
					game.message(app, 'We are going to run a few intelligence tests.', 1.5);
				}
			},
			{
				x: 3, y: 7,
				action: function(game, tile, app) {
					if (tile.playerPressed)
						game.loadLevel(app, levels.level3, false, function(game, x, y) { return Math.random() / 2; });
				}
			}
		]),
	level3: createLevel([
			'                    ',
			'                    ',
			'                    ',
			'####################',
			'#         #........#',
			'# ........#........#',
			'# .....*..#........#',
			'# .p......#......x.#',
			'# .....o..#........#',
			'# ........#........#',
			'#         #........#',
			'####################',
			'                    ',
			'                    ',
			'                    '
		],
		[
			{
				action: function(app, game) {
					game.message(app, 'Don\'t fall down', 1);
				}
			},
			{
				x: 7, y: 8,
				action: function(game, tile, app) {
					if (tile.pressed)
						game.tiles[10][7].change('floor');
					else
						game.tiles[10][7].change('wall');
				}
			},
			{
				x: 17, y: 7,
				action: function(game, tile, app) {
					if (tile.playerPressed)
						game.loadLevel(app, levels.level4);
				}
			}
		]),
	level4: createLevel([
			'                    ',
			'                    ',
			'                    ',
			'####################',
			'#.....#............#',
			'#.....#.....x......#',
			'#.....#............#',
			'#.x...#..........p.#',
			'#.....#............#',
			'#.....#............#',
			'#.....#............#',
			'####################',
			'                    ',
			'                    ',
			'                    '
		],
		[
			{
				action: function(app, game) {
					game.objects.push(new Weapon(12.5, 5.5));
					game.message(app, 'Please equip warping device, it is necessary for further tests.', 1);
				}
			},
			{
				x: 12, y: 5,
				action: function(game, tile, app) {
					if (tile.pressed && tile.type === 'target') {
						for (var i = game.objects.length - 1; i >= 0; i--) 
							if (!game.objects[i].canPress)
								game.objects[i].alive = false;
						app.playSound('release');
						game.tiles[12][5].change('floor');
						game.player.weapon = true;
						game.tiles[6][6].change('floor', 0.5);
						game.tiles[6][7].change('floor', 0.65);
						game.tiles[6][8].change('floor', 0.8);
					}
				}
			},
			{
				x: 2, y: 7,
				action: function(game, tile, app) {
					if (tile.playerPressed)
						game.loadLevel(app, levels.level5);
				}
			}
		]),
	level5: createLevel([
			'      ########      ',
			'      #......#      ',
			'      #......#      ',
			'#######..##..#######',
			'#...  ...##...  ...#',
			'#...  ...##...  ...#',
			'#...  ...##...  ...#',
			'#.p.  ...##...  .x.#',
			'#...  ...##...  ...#',
			'#...  .*.##...  .*.#',
			'#...  ...##...  ...#',
			'####################',
			'                    ',
			'                    ',
			'                    '
		],
		[
			{
				action: function(app, game) {
					game.message(app, 'Aim your warping device at the crate, use it with left mouse button.', 0.1);
					game.objects.push(game.tiles[17][9].crate = new Crate().setType(2));
				}
			},
			{
				x: 17, y: 7,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.message(app, 'Well done.');
						game.loadLevel(app, levels.level6);
					}
				}
			}
		]),
	level6: createLevel([
			'                    ',
			'                    ',
			'                    ',
			'####################',
			'#......      .,,,,,#',
			'#....*.  ,,  ,,,,,,#',
			'#......  ,,  ,,,,,,#',
			'#.x....  ,,  ....p.#',
			'#......  ,,  ......#',
			'#......  ,,  ......#',
			'#......  ,,  ......#',
			'####################',
			'                    ',
			'                    ',
			'                    '
		],
		[
			{
				x: 2, y: 7,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.loadLevel(app, levels.level7);
					}
				}
			}
		]),
	level7: createLevel([
			'####################',
			'# ... ,,,,,,, ...  #',
			'# .*.         .*.  #',
			'#      ,,,,,, ...  #',
			'#,,,,,   ,,,,      #',
			'#    ,,   ,,,,,,, ,#',
			'#...  ,,     ,,    #',
			'#.p.  ,  ...  , .*.#',
			'#...  ,  .*.  ,    #',
			'#    ,,  ...  ,,, ,#',
			'#    ,        ,    #',
			'#...      ,,,,  ...#',
			'#.*.    ,,,,,   .x.#',
			'#...   ,,,,,,   .*.#',
			'####################'
		],
		[
			{
				x: 17, y: 12,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.loadLevel(app, levels.level8);
					}
				}
			}
		]),
	level8: createLevel([
			'####################',
			'#..................#',
			'#..................#',
			'#........o.........#',
			'#..................#',
			'#..................#',
			'#...............*..#',
			'#..................#',
			'#..................#',
			'#..................#',
			'#####,,,...........#',
			'#...#,,,,,,........#',
			'#.x.#,,,,*,......p.#',
			'#...#  ,,,,........#',
			'####################'
		],
		[ 
			{
				action: function(app, game) {
					game.message(app, 'These aren\'t your usual boxes.');
					game.doordata.saidimpressed = false;
					game.objects.push(game.tiles[9][12].crate = new Crate().setType(1));
					game.objects.push(game.tiles[16][6].crate = new Crate().setType(3));
				}
			},
			{
				x: 9, y: 3,
				action: function(game, tile, app) {
					if (tile.pressed) {
						game.tiles[9][11].change('floor', 0.5);
						game.tiles[8][7].change('block', 0.3);
						game.tiles[9][7].change('block', 0.3);
						game.tiles[10][7].change('block', 0.3);
						game.tiles[4][12].change('floor');
					} else {
						game.tiles[9][11].change('block', 0.3);
						game.tiles[8][7].change('floor', 0.5);
						game.tiles[9][7].change('floor', 0.5);
						game.tiles[10][7].change('floor', 0.5);
						game.tiles[4][12].change('wall');
					}
				}
			},
			{
				x: 4, y: 12,
				action: function(game, tile, app) {
					if (tile.pressed && !game.doordata.saidimpressed) {
						game.message(app, 'I\'m quite impressed by your ability to go trough the tests without fear of equipment malfunction or something else.');
						game.doordata.saidimpressed = true;
					}
				}
			},
			{
				x: 2, y: 12,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.loadLevel(app, levels.level9);
					}
				}
			}
		]),
	level9: createLevel([
			'####################',
			'#..............#...#',
			'#..............#.x.#',
			'#..............#...#',
			'#..............#####',
			'################...#',
			'#.......    .......#',
			'#.......    .*...o.#',
			'#.......    .......#',
			'#...################',
			'#...#..............#',
			'#...#.....*........#',
			'#.p.#..............#',
			'#...#..............#',
			'####################'
		],
		[ 	
			{
				action: function(app, game) {
					game.doordata.saidcake = false;
				}
			},
			{
				x: 17, y: 7,
				action: function(game, tile, app) {
					if (tile.pressed)
						game.tiles[17][4].change('floor');
					else
						game.tiles[17][4].change('wall');
				}
			},
			{
				x: 17, y: 2,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.loadLevel(app, levels.level10);
					}
				}
			},
			{
				x: 17, y: 4,
				action: function(game, tile, app) {
					if (tile.pressed && !game.doordata.saidcake) {
						game.doordata.saidcake = true;
						game.message(app, 'You are doing well. I\'m considering rewarding you with a cake after the tests.');
					}
				}
			},
			{
				x: 10, y: 11,
				action: function(game, tile, app) {
					if (tile.pressed && tile.type === 'dispenser') {
						tile.change('pit', 1);
						tile.change('dispenser', 1.5);
					}
				}
			}
		]),
	level10: createLevel([
			'####################',
			'#        ,,     ..*#',
			'#  .*.   ,,     .p.#',
			'#  ...   ,,     ...#',
			'#  .o.    ,        #',
			'#                  #',
			'#  ,,,,,           #',
			'#        ,    ..o  #',
			'#   .*.  ,,   ...  #',
			'#   ...  ,,   *..  #',
			'#   .o.  ,,        #',
			'#        ,,,       #',
			'#,,,      ,,,      #',
			'#x*,        ,,,    #',
			'####################'
		],
		[ 
			{
				x: 4, y: 4,
				action: function(game, tile, app) {
					game.doordata.d1 = tile.pressed;
					if (game.doordata.d1 && game.doordata.d2 && game.doordata.d3) {
						game.tiles[1][12].change('floor');
						game.tiles[2][12].change('floor');
						game.tiles[3][12].change('floor');
						game.tiles[3][13].change('floor');
						if (!game.doordata.said) {
							game.message(app, 'Actually, no. No one really believes in cakes anymore. I could give you chocolate cookies instead. Do you like cookies? I looove cookies. I could kill for cookies.')
							game.message(app, 'On that note, do you have cookies?', 1.5);
						}
						game.doordata.said = true;
					} else {
						game.tiles[1][12].change('block');
						game.tiles[2][12].change('block');
						game.tiles[3][12].change('block');
						game.tiles[3][13].change('block');
					}
				}
			},
			{
				x: 5, y: 10,
				action: function(game, tile, app) {
					game.doordata.d2 = tile.pressed;
					if (game.doordata.d1 && game.doordata.d2 && game.doordata.d3) {
						game.tiles[1][12].change('floor');
						game.tiles[2][12].change('floor');
						game.tiles[3][12].change('floor');
						game.tiles[3][13].change('floor');
						if (!game.doordata.said) {
							game.message(app, 'Actually, no. No one really believes in cakes anymore. I could give you chocolate cookies instead. Do you like cookies? I looove cookies. I could kill for cookies.')
							game.message(app, 'On that note, do you have cookies?', 1.5);
						}
						game.doordata.said = true;
					} else {
						game.tiles[1][12].change('block');
						game.tiles[2][12].change('block');
						game.tiles[3][12].change('block');
						game.tiles[3][13].change('block');
					}
				}
			},
			{
				x: 16, y: 7,
				action: function(game, tile, app) {
					game.doordata.d3 = tile.pressed;
					if (game.doordata.d1 && game.doordata.d2 && game.doordata.d3) {
						game.tiles[1][12].change('floor');
						game.tiles[2][12].change('floor');
						game.tiles[3][12].change('floor');
						game.tiles[3][13].change('floor');
						if (!game.doordata.said) {
							game.message(app, 'Actually, no. No one really believes in cakes anymore. I could give you chocolate cookies instead. Do you like cookies? I looove cookies. I could kill for cookies.')
							game.message(app, 'On that note, do you have cookies?', 1.5);
						}
						game.doordata.said = true;
					} else {
						game.tiles[1][12].change('block');
						game.tiles[2][12].change('block');
						game.tiles[3][12].change('block');
						game.tiles[3][13].change('block');
					}
				}
			},
			{
				x: 1, y: 13,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.loadLevel(app, levels.level11);
					}
				}
			},
			{
				action: function(app, game)  {
					game.doordata.d1 = false;
					game.doordata.d2 = false;
					game.doordata.d3 = false;
					game.tiles[2][13].setCrateType(game, 3);
					game.message(app, '(if you get stuck, destroy the universe with \'r\')');
				}
			}
		]),
	level11: createLevel([
			'####################',
			'#......#########,,##',
			'#......,,,,.o,,,,,##',
			'#......##########.##',
			'#..*...#...#..o....#',
			'#......#.x.#.......#',
			'#......#...#..o....#',
			'#..*...#####.......#',
			'#......     .......#',
			'#......     .......#',
			'#..*...     .......#',
			'#......     .......#',
			'#.p....     .......#',
			'#......     .......#',
			'####################'
		],
		[ 
			{
				action: function(app, game) {
					game.tiles[3][4].setCrateType(game, 0);
					game.tiles[3][7].setCrateType(game, 1);
					game.tiles[3][10].setCrateType(game, 3);
					game.doordata.d1 = false;
					game.doordata.d2 = false;
				}
			},
			{
				x: 12, y: 2,
				action: function(game, tile, app) {
					if (tile.pressed) 
						game.tiles[11][2].change('pit');
					else
						game.tiles[11][2].change('floor');
				}
			},
			{
				x: 14, y: 4,
				action: function(game, tile, app) {
					game.doordata.d1 = tile.pressed;
					if (game.doordata.d1 && game.doordata.d2)
						game.tiles[7][5].change('floor');
					else
						game.tiles[7][5].change('wall');
				}
			},
			{
				x: 14, y: 6,
				action: function(game, tile, app) {
					game.doordata.d2 = tile.pressed;
					if (game.doordata.d1 && game.doordata.d2)
						game.tiles[7][5].change('floor');
					else
						game.tiles[7][5].change('wall');
				}
			},
			{
				x: 17, y: 4,
				action: function(game, tile, app) {
					if (tile.pressed) {
						game.tiles[17][3].change('wall');
						if (!game.doordata.said) {
							game.message(app, 'It was a trap!  :D');
							app.playSound('press');
						}
						game.doordata.said = true;
					}
				}
			},
			{
				x: 9, y: 5,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.loadLevel(app, levels.level12);
					}
				}
			}
		]),
	level12: createLevel([
			'####################',
			'######.............#',
			'######.............#',
			'######.............#',
			'##...#.............#',
			'##.......p.........#',
			'##...#.............#',
			'######.............#',
			'######.............#',
			'######.............#',
			'######.............#',
			'######.............#',
			'######.............#',
			'######.............#',
			'####################'
		],
		[ 
			{
				action: function(app, game) {
					game.message(app, 'Very good. I would like to reward you with these chocolate cookies.');
					game.doordata.said = false;
					var crate;
					game.objects.push(crate = new Crate(2.5 - 5 / 16, 5.5 - 1 / 4).setType(4));
					crate.animation(true);
				}
			},
			{
				x: 12, y: 5,
				action: function(game, tile, app) {
					if (!game.doordata.said) {
						game.doordata.said = true;
						game.message(app, 'Why are\'t you going? I can assure you it\'s not a trap.');
					}
				}
			},
			{
				x: 3, y: 5,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.message(app, 'It was a trap! I can\'t believe that you fell for it.');
						game.loadLevel(app, levels.level13);
					}
				}
			},
			{
				x: 3, y: 4,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.message(app, 'It was a trap! I can\'t believe that you fell for it.');
						game.loadLevel(app, levels.level13);
					}
				}
			},
			{
				x: 3, y: 6,
				action: function(game, tile, app) {
					if (tile.playerPressed) {
						game.message(app, 'It was a trap! I can\'t believe that you fell for it.');
						game.loadLevel(app, levels.level13);
					}
				}
			}
		]),
	level13: createLevel([
			'                    ',
			'                    ',
			'                    ',
			' #####              ',
			' #...#              ',
			' #.p.#              ',
			' #...#              ',
			' #####              ',
			'                    ',
			'                    ',
			'                    ',
			'                    ',
			'                    ',
			'                    ',
			'                    ',
		],
		[ 
			{
				action: function(app, game) {
					game.message(app, 'We will meet next time we need test subjects. I predict that to be about 517 years. In that time you are free to enjoy your loneliness.');
					game.message(app, '[END]');
				}
			}
		])
};
