'use strict';

function Fire(x, y) {

	var chars = 'mMwWnN';
	var colors = '0123456789ABCDEF';
	
	function tick(map) {
		var nextChar;
		do {
			nextChar = chars.charAt(Math.floor(Math.random() * 6));
		} while (nextChar == this.ch);
		this.ch = nextChar;
		this.color = '#F' + colors.charAt(Math.floor(Math.random() * 16)) + '0';
	}

	return {
		x: x,
		y: y,
		blocks: true,
		tick: tick
	}
}