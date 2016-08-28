'use strict';

function Player(x, y) {
	return {
		x: x,
		y: y,
		ch: '@',
		color: '#37A',
		blocks: true,
		mortal: true,
		weapon: null
	}
}