'use strict';

function Slime(x, y) {
	
	function tick(map) {
		if (this.small) {
			this.small = false;
		} else {
			this.small = true;
			if (!Monster.attack(this, map, '#0F0'))
				Monster.wander(this, map);
		}
	}
	
	return {
		x: x,
		y: y,
		ai: tick,
		blocks: true,
		small: true,
		mortal: true,
		draw: function(map, screen) { if (map.isVisible(this.x, this.y)) screen.draw(this.x, this.y, this.small ? 's' : 'S', this.small ? '#5B5' : '#3F3', 5); }
	};	
}

var Monster = {
	attack: function(self, map, attackColor) {
		if (map.player == null)
			return;
		
		var near = 10000000 - 1;
		var dirs = [];
		
		var d = map.getPath(self.x - 1, self.y);
		if (d < near) { near = d; dirs = [3]; } else if (d == near) { dirs.push(3); }
		var d = map.getPath(self.x, self.y - 1);
		if (d < near) { near = d; dirs = [0]; } else if (d == near) { dirs.push(0); }
		var d = map.getPath(self.x + 1, self.y);
		if (d < near) { near = d; dirs = [1]; } else if (d == near) { dirs.push(1); }
		var d = map.getPath(self.x, self.y + 1);
		if (d < near) { near = d; dirs = [2]; } else if (d == near) { dirs.push(2); }
		
		if (dirs.length == 0) return false;
		
		if (map.getPath(self.x, self.y) == 1) {
			var attack;
			if (self.x > map.player.x) attack = '<<<<';
			if (self.x < map.player.x) attack = '>>>>';
			if (self.y > map.player.y) attack = '^^^^';
			if (self.y < map.player.y) attack = 'vvvv';
			map.objects.push(Particle(map.player.x, map.player.y, attackColor, attack));
			map.kill(map.player);
			return true;
		}
		
		var dir = dirs[Math.floor(Math.random() * dirs.length)];
		if (dir == 0 && map.canPass(self.x, self.y - 1)) { self.y -= 1; return true; }
		if (dir == 1 && map.canPass(self.x + 1, self.y)) { self.x += 1; return true; }
		if (dir == 2 && map.canPass(self.x, self.y + 1)) { self.y += 1; return true; }
		if (dir == 3 && map.canPass(self.x - 1, self.y)) { self.x -= 1; return true; }
		
		return false;
	},
	
	wander: function(self, map) {
		var dirs = [];
		if (map.canWander(self.x, self.y - 1)) dirs.push(0);
		if (map.canWander(self.x + 1, self.y)) dirs.push(1);
		if (map.canWander(self.x, self.y + 1)) dirs.push(2);
		if (map.canWander(self.x - 1, self.y)) dirs.push(3);
		
		if (dirs.length == 0) return false;
		
		var dir = dirs[Math.floor(Math.random() * dirs.length)];
		if (dir == 0) { self.y -= 1; return true; }
		if (dir == 1) { self.x += 1; return true; }
		if (dir == 2) { self.y += 1; return true; }
		if (dir == 3) { self.x -= 1; return true; }
		
		return false;
	}
}

