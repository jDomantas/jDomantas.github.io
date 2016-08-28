'use strict';

function Spear(x, y) {
	
	function attackFn(map, dx, dy) {
		var x = map.player.x + dx;
		var y = map.player.y + dy;
		var object = map.getObject(x, y);
		if (object) {
			if (!object.mortal)
				return false;
			var attack;
			if (dx == -1) attack = '<<<<';
			if (dx == 1) attack = '>>>>';
			if (dy == -1) attack = '^^^^';
			if (dy == 1) attack = 'vvvv';
			map.objects.push(Particle(object.x, object.y, '#FF0', attack));
			map.kill(object);
			return true;
		}
		
		x += dx;
		y += dy;
		
		object = map.getObject(x, y);
		if (object) {
			if (!object.mortal)
				return false;
			var attack;
			var attack2;
			if (dx == -1) { attack = '   <<<<<<'; attack2 = '<<<------'; }
			if (dx == 1)  { attack = '   >>>>>>'; attack2 = '>>>------'; }
			if (dy == -1) { attack = '   ^^^^^^'; attack2 = '^^^||||||'; }
			if (dy == 1)  { attack = '   vvvvvv'; attack2 = 'vvv||||||'; }
			map.objects.push(Particle(x, y, '#FF0', attack));
			map.objects.push(Particle(x - dx, y - dy, '#FF0', attack2));
			map.kill(object);
			return true;
		}
		
		return false;
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
		ch: '/',
		color: '#FF0'
	};	
}