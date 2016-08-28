'use strict';

function Crate(x, y) {
	return {
		x: x,
		y: y,
		ch: 'B',
		color: '#820',
		blocks: true,
		
		interact: function(map, player) {
			var dx = this.x - player.x;
			var dy = this.y - player.y;
			if (Math.abs(dx) + Math.abs(dy) != 1)
				return false;
			
			if (map.canPass(this.x + dx, this.y + dy)) {
				this.x += dx;
				this.y += dy;
				player.x += dx;
				player.y += dy;
				return true;
			} else {
				return false;
			}
		}
	}
}