'use strict';

function Lever(x, y, doorX, doorY) {
	return {
		x: x,
		y: y,
		ch: '{',
		color: '#F80',
		locked: true,
		blocks: true,
		
		interact: function(map, player) {
			var dist = Math.abs(player.x - this.x) + Math.abs(player.y - this.y);
			if (dist != 1)
				return false;
			
			this.locked = !this.locked;
			if (this.locked) {
				map.tiles[doorX][doorY].ch = '+';
				map.tiles[doorX][doorY].solid = true;
				this.ch = '{';
			} else {
				map.tiles[doorX][doorY].ch = '=';
				map.tiles[doorX][doorY].solid = false;
				this.ch = '}';
			}
			
			return true;
		}
	}
}