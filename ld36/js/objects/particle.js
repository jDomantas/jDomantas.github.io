'use strict';

function Particle(x, y, color, frames) {
	
	function tick(map) {
		this.frame += 1;
		if (this.frame >= frames.length)
			map.remove(this);
		else
			this.ch = frames.charAt(this.frame);
	}
	
	function draw(map, screen) {
		if (this.ch != ' ')
			screen.drawObj(this, 6);
	}
	
	return {
		x: x,
		y: y,
		ch: frames.charAt(0),
		color: color,
		frame: 0,
		visual: tick,
		blocks: false,
		draw: draw
	};
}

