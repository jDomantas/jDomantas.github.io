'use strict';

function LockTrap(x, y, doorX, doorY) {
	return {
		x: x,
		y: y,
		draw: function() { },
		blocks: false,
		
		tick: function(map) {
			if (map.getObject(this.x, this.y) != null) {
				map.tiles[doorX][doorY].ch = '+';
				map.tiles[doorX][doorY].solid = true;
			}
		}
	}
}