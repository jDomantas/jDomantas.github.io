'use strict';

function DartTrap(x, y, dir) {
	
	function tick(map) {
		var dx = 0, dy = 0;
		if (dir == 0) dy = -1;
		else if (dir == 1) dx = 1;
		else if (dir == 2) dy = 1;
		else if (dir == 3) dx = -1;
		
		var ticks = parseInt(map.tiles[this.x - dx][this.y - dy].ch);
		
		ticks--;
		if (ticks == 0) {
			map.objects.push(Arrow(x, y, dir));
			ticks = 4;
		}
		
		map.tiles[this.x - dx][this.y - dy].ch = '' + ticks;
	}
	
	return {
		x: x,
		y: y,
		tick: tick,
		blocks: true,
		draw: function(map, screen) { if (map.isVisible(this.x, this.y)) screen.draw(this.x, this.y, '^>v<'.charAt(dir), '#FF0', 1); }
	};	
}