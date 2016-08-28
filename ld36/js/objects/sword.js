'use strict';

function Sword(x, y) {
	
	function attackFn(map, dx, dy) {
		var x = map.player.x + dx;
		var y = map.player.y + dy;
		var object = map.getObject(x, y);
		if (object && object.mortal) {
			var attack;
			if (dx == -1) attack = '<<<<';
			if (dx == 1) attack = '>>>>';
			if (dy == -1) attack = '^^^^';
			if (dy == 1) attack = 'vvvv';
			map.objects.push(Particle(object.x, object.y, '#FF0', attack));
			map.kill(object);
			return true;
		} else {
			return false;
		}
	}
	
	function tick(map) {
		if (map.player.x == this.x && map.player.y == this.y) {
			map.player.weapon = attackFn;
			map.remove(this);
		}
	}
	
	return {
		x: x,
		y: y,
		tick: tick,
		blocks: false,
		ch: 't',
		color: '#FF0'
	};	
}