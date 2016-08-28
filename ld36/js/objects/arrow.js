'use strict';

function Arrow(x, y, dir) {
	
	function tick(map) {
		var dx = 0, dy = 0;
		if (dir == 0) dy = -1;
		else if (dir == 1) dx = 1;
		else if (dir == 2) dy = 1;
		else if (dir == 3) dx = -1;
		
		if (map.canPass(this.x + dx, this.y + dy)) {
			this.x += dx;
			this.y += dy;
		} else {
			var object = map.getObject(this.x + dx, this.y + dy);
			if (object != null && object.mortal)
				map.kill(object);
			map.remove(this);
		}
	}
	
	return {
		x: x,
		y: y,
		visual: tick,
		blocks: false,
		draw: function(map, screen) { if (map.isVisible(this.x, this.y)) screen.draw(this.x, this.y, '|-|-'.charAt(dir), '#FF0', 6); }
	};	
}