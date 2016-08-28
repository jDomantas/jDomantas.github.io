'use strict';

function Goblin(x, y) {
	
	function tick(map) {
		if (!Monster.attack(this, map, '#0F0'))
			Monster.wander(this, map);
	}
	
	return {
		x: x,
		y: y,
		ai: tick,
		blocks: true,
		mortal: true,
		draw: function(map, screen) { if (map.isVisible(this.x, this.y)) screen.draw(this.x, this.y, 'G', '#240', 5); }
	};	
}

