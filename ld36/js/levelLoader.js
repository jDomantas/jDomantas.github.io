'use strict';

(function() {
	var tiles = {
		'.': { color: '#333', solid: false, opaque: false              },
		'#': { color: '#666', solid: true,  opaque: true               },
		' ': { color: '#000', solid: false, opaque: false, ch: '&nbsp' },
		',': { color: '#CCC', solid: false, opaque: false              },
		'>': { color: '#844', solid: false, opaque: false              },
		'=': { color: '#C44', solid: false, opaque: true               },
		'+': { color: '#C44', solid: true,  opaque: true               },
		'{': { color: '#333', solid: false, opaque: false, ch: '.'     },
		'"': { color: '#071', solid: false, opaque: true               },
		"'": { color: '#0F2', solid: false, opaque: true               },
		'~': { color: '#02F', solid: true,  opaque: false              },
		'`': { color: '#0FF', solid: true,  opaque: false              },
		"o": { color: '#F80', solid: false, opaque: true               },
		"1": { color: '#BB0', solid: true,  opaque: false              },
		'2': { color: '#BB0', solid: true,  opaque: false              },
		'3': { color: '#BB0', solid: true,  opaque: false              },
		"4": { color: '#BB0', solid: true,  opaque: false              },
		"*": { color: '#F00', solid: false, opaque: false              },
		":": { color: '#644', solid: false, opaque: false              }
	};
	
	var objects = {
		'B': function(x, y) { return Crate(x, y); },
		'@': function(x, y) { return Player(x, y); },
		'^': function(x, y) { return DartTrap(x, y, 0); },
		'}': function(x, y) { return DartTrap(x, y, 1); },
		'v': function(x, y) { return DartTrap(x, y, 2); },
		'<': function(x, y) { return DartTrap(x, y, 3); },
		's': function(x, y) { var s = Slime(x, y); s.small = true; return s; },
		'S': function(x, y) { var s = Slime(x, y); s.small = false; return s; },
		'G': function(x, y) { return Goblin(x, y); },
		't': function(x, y) { return Sword(x, y); },
		'/': function(x, y) { return Spear(x, y); },
		'm': function(x, y) { return Fire(x, y); },
		'c': function(x, y) { return Coin(x, y); }
	};
	
	for (var t in tiles)
		if (!tiles[t].ch)
			tiles[t].ch = t;
	
	function loadBase(map, level) {
		
		for (var x = 0; x < map.width; x++)
			for (var y = 0; y < map.height; y++) {
				var tile = levels[level][y].charAt(x);
				if (tile in tiles) {
					map.tiles[x][y].ch = tiles[tile].ch;
					map.tiles[x][y].color = tiles[tile].color;
					map.tiles[x][y].solid = tiles[tile].solid;
					map.tiles[x][y].opaque = tiles[tile].opaque;
					if (tile == '@') {
						map.player = Player(x, y);
						map.objects.push(map.player);
					}
				} else if (tile in objects) {
					map.tiles[x][y].ch = tiles['.'].ch;
					map.tiles[x][y].color = tiles['.'].color;
					map.tiles[x][y].solid = tiles['.'].solid;
					map.tiles[x][y].opaque = tiles['.'].opaque;
					
					if (tile == '@') {
						if (level > 0) {
							map.tiles[x][y].ch = '<';
							map.tiles[x][y].color = '#422';
						}
						map.player = Player(x, y);
						map.objects.push(map.player);
					} else {
						map.objects.push(objects[tile](x, y));
					}
				} else {
					map.tiles[x][y].ch = tile;
					map.tiles[x][y].color = '#6F0';
				}
				
				map.tiles[x][y].x = x;
				map.tiles[x][y].y = y;
				map.tiles[x][y].visible = false;
			}
			
		for (var x = 0; x < map.width; x++)
			for (var y = 0; y < map.height; y++) {
				if (map.tiles[x][y].ch == '"' && Math.random() < 0.4) {
					map.tiles[x][y].ch = tiles["'"].ch;
					map.tiles[x][y].color = tiles["'"].color;
				}
				if (map.tiles[x][y].ch == '~' && Math.random() < 0.2) {
					//map.tiles[x][y].ch = tiles['`'].ch;
					map.tiles[x][y].color = tiles['`'].color;
				}
			}
	}
	
	function loadLevel0(map) {
		loadBase(map, 0);
		for (var x = 0; x < map.width; x++)
			for (var y = 0; y < 16; y++) {
				if (y > 6 && y < 14)
					continue;
				map.tiles[x][y].visible = true;
				map.tiles[x][y].color = '#DDF';
			}
		for (var i = map.objects.length - 1; i >= 0; i--)
			if (map.objects[i].ch != '@') {
				map.tiles[map.objects[i].x][map.objects[i].y].ch = levels[0][map.objects[i].y].charAt(map.objects[i].x);
				map.objects.splice(i, 1);
			}
	}
	
	function loadLevel1(map) {
		loadBase(map, 1);
		map.objects.push(Lever(1, 2, 6, 2));
		map.objects.push(Lever(4, 13, 8, 6));
		map.objects.push(Lever(14, 4, 13, 13));
		map.objects.push(Lever(19, 12, 18, 2));
		map.objects.push(Lever(28, 2, 8, 2));
	}
	
	function loadLevel2(map) {
		loadBase(map, 2);
		map.objects.push(Button(7, 7, 7, 4));
	}
	
	function loadLevel3(map) {
		loadBase(map, 3);
	}
	
	function loadLevel4(map) {
		loadBase(map, 4);
	}
	
	function loadLevel5(map) {
		loadBase(map, 5);
	}
	
	function loadLevel6(map) {
		loadBase(map, 6);
		map.objects.push(LockTrap(8, 3, 6, 3));
	}
	
	function loadLevel7(map) {
		loadBase(map, 7);
	}
	
	function loadLevel8(map) {
		loadBase(map, 8);
		map.objects.push(Lever(14, 5, 23, 5));
	}
	
	function loadLevel9(map) {
		loadBase(map, 9);
		for (var x = 0; x < map.width; x++)
			for (var y = 0; y < 16; y++) {
				if (y < 8)
					continue;
				map.tiles[x][y].visible = true;
				map.tiles[x][y].color = '#DDF';
			}
		for (var i = map.objects.length - 1; i >= 0; i--)
			if (map.objects[i].ch != '@' && map.objects[i].ch != 'c') {
				map.tiles[map.objects[i].x][map.objects[i].y].ch = levels[9][map.objects[i].y].charAt(map.objects[i].x);
				map.objects.splice(i, 1);
			}
	}
	
	function loadLevel(map, level) {
		map.objects = [];
		eval('loadLevel' + level + '(map)');
		map.updateVisibles();
	}

	window.loadLevel = loadLevel;
})();