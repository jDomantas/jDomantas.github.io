'use strict';

function Coin(x, y) {
	
	function tick(map) {
		if (map.player.x == this.x && map.player.y == this.y)
			map.remove(this);
	}
	
	return {
		x: x,
		y: y,
		tick: tick,
		blocks: false,
		ch: 'c',
		color: '#FF0'
	};	
}