function Tile(x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.target = null;
	this.pressed = false;
	this.weight = 0;
	this.object = null;
	this.changeProgress = 0;
}

Tile.prototype = {
	change: function(type, delay) {
		delay = delay || 0;
		//console.log('set to ' + type + ', delay: ' + delay);
		if (this.target === null) {
			if (this.type !== type) {
				if (this.type !== 'floor' && type !== 'floor')
					this.target = { type: 'floor', delay: delay, next: { type: type, next: null } };
				else
					this.target = { type: type, next: null, delay: delay };
				this.changeProgress = 0;
			}
		} else {
			// add to the end of linked list
			var t = this.target;
			while (t.next !== null) {
				if (t.type === type) {
					t.next = null;
					return;
				}
				t = t.next;
			}
			if (t.type !== type) {
				if (t.type !== 'floor' && type !== 'floor')
					t.next = { type: 'floor', delay: delay, next: { type: type, next: null } };
				else
					t.next = { type: type, next: null, delay: delay };
			}
		}
	},

	update: function(app, game) {
		// change type
		if (this.target !== null) {
			if (this.target.delay > 0) this.target.delay -= 1 / 60;
			else this.changeProgress += 0.5;
			if (this.changeProgress >= 8) {
				this.type = this.target.type;
				this.changeProgress = 0;
				this.target = this.target.next;
			}
		}

		// find heaviest entity standing on this tile
		this.weight = 0;
		this.pressed = false;
		for (var i = game.objects.length - 1; i >= 0; i--) {
			if (game.objects[i].alive &&
				game.objects[i].pos.x + game.objects[i].size.x / 2 >= this.x &&
				game.objects[i].pos.x + game.objects[i].size.x / 2 < this.x + 1 &&
				game.objects[i].pos.y + game.objects[i].size.y / 2 >= this.y &&
				game.objects[i].pos.y + game.objects[i].size.y / 2 < this.y + 1) {
				this.weight = Math.max(game.objects[i].weight, this.weight);
				this.pressed = game.objects[i].canPress || this.pressed;
			}
		}

		if (this.type == 'button' && (this.target === null || this.target.delay > 0.001)) {
			if (this.pressed && !this.activated)
				app.playSound('press');
			else if (!this.pressed && this.activated)
				app.playSound('release');
		}
		this.activated = this.pressed;

		// summon object
		if (this.object !== null && !this.object.alive && this.type === 'dispenser') {
			this.object.pos.x = this.x + 0.5 - this.object.size.x / 2;
			this.object.pos.y = this.y + 0.5 - this.object.size.y / 2;
			if (this.object.respawn)
				this.object.respawn();
			else
				this.object.alive = true;
		}

		if (this.type === 'sensor' && (this.target === null || this.target.type === this.type || this.target.delay > 0)) {
			var hit = false;
			game.forPlayer(this, function (p) {
				if (hit) return;
				if (p.weapon.line) {
					for (var i = p.weapon.line.length - 2; i >= 0; i--) {
						var sx = p.weapon.line[i].x,
							sy = p.weapon.line[i].y,
							dirx = p.weapon.line[i + 1].x - p.weapon.line[i].x,
							diry = p.weapon.line[i + 1].y - p.weapon.line[i].y;
						var a = dirx * dirx + diry * diry;
						var b = -2 * (dirx * (this.x + 0.5 - sx) + diry * (this.y + 0.5 - sy));
						var c = (this.x + 0.5 - sx) * (this.x + 0.5 - sx) + (this.y + 0.5 - sy) * (this.y + 0.5 - sy) - 1 / 16;
						var d = b * b - 4 * a * c;
						if (d >= 0) {
							d = Math.sqrt(d);
							var l1 = (-b + d) / (2 * a);
							var l2 = (-b - d) / (2 * a);
							if ((l1 >= 0 && l1 <= 1) || (l2 >= 0 && l2 <= 1)) {
								hit = true;
								break;
							}
						}
					}
				}
			});
			this.activated = hit;
		} else if (this.type === 'sensor' && this.activated)
			this.activated = false;
	},

	draw: function(app, game) {
		var tex = this.texture();
		var y = this.y;
		if (tex >= 80 && tex < 88) {
			y += ((tex - 80) / 8);
		}
		app.screen.drawFrame(app.images.tiles, tex, 
			this.x * app.scale + game.offset.x, 
			Math.round(y * app.scale) + game.offset.y - 8);
	},

	texture: function() {
		if (this.target === null || this.target.type === this.type || this.target.delay > 0) {
			var tex = 0;
			if (this.type === 'floor') return 0;
			if (this.type === 'pit') return 7;
			if (this.type === 'wall') tex = 1;
			if (this.type === 'block') tex = 2;
			if (this.type === 'target') tex = 3;
			if (this.type === 'dispenser') tex = 4;
			if (this.type === 'button') return this.activated ? 2 : 47;
			if (this.type === 'block_up') tex = 6;
			if (this.type === 'block_right') tex = 7;
			if (this.type === 'block_down') tex = 8;
			if (this.type === 'block_left') tex = 9;
			if (this.type === 'mirror') tex = 11;
			if (this.type === 'sensor') return this.activated ? 1 : 103;
			if (this.type === 'spawn') tex = 13;
			return tex * 8 + 7;
		} else {
			var other = this.target.type;
			var animation = 0;
			var frame = (this.changeProgress | 0);
			if (this.type !== 'floor')  { other = this.type; frame = 7 - frame; }
			if (other === 'wall') animation = 1;
			if (other === 'block') animation = 2;
			if (other === 'target') animation = 3;
			if (other === 'dispenser') animation = 4;
			if (other === 'button') animation = 5;
			if (other === 'block_up') animation = 6;
			if (other === 'block_right') animation = 7;
			if (other === 'block_down') animation = 8;
			if (other === 'block_left') animation = 9;
			if (other === 'pit') animation = 10;
			if (other === 'mirror') animation = 11;
			if (other === 'sensor') animation = 12;
			if (other === 'spawn') animation = 13;
			return animation * 8 + frame;
		}
	},

	passable: function(object) {
		switch (this.type) {
			case 'wall': return false;
			case 'mirror': return false;
			case 'sensor': return false;
			default: return object.pos.z >= this.height() - 0.01;
		}
	},

	height: function() {
		if (this.type === 'pit')  { 
			if (this.target && this.target.delay <= 0.01) {
				if (this.target.type === 'floor')
					return (this.changeProgress / 8 - 1);
				else
					return -1000;
			}
			return -1000;
		} else if (this.type === 'floor') {
			if (this.target) {
				if (this.target.type === 'pit')
					return (this.changeProgress / -8);
				else if (this.target.type === 'wall' || this.target.type === 'mirror')
					return (this.changeProgress / 8) * 0.5;
				else
					return 0;
			}
			return 0;
		} else if (this.type === 'wall' || this.type === 'mirror') { 
			if (this.target && this.target.delay <= 0.01) {
				if (this.target.type === 'floor')
					return (1 - this.changeProgress / 8) * 0.5;
				else
					return 0.5;
			}
			return 0.5;
		}
		return 0;
	},

	// 0 for pass, 1 for block, 2 for mirror
	rayInteraction: function(weapon, dir) {
		switch (this.type) {
			case 'wall': return 1;
			case 'block': return 1;
			case 'block_up': return dir.y < 0 ? 0 : 1;
			case 'block_right': return dir.x > 0 ? 0 : 1;
			case 'block_down': return dir.y > 0 ? 0 : 1;
			case 'block_left': return dir.x < 0 ? 0 : 1;
			case 'mirror': return 2;
			default: return 0;
		}
	},

	setDispensedObject: function(game, obj, kill) {
		if (obj === null) {
			if (this.object && kill) {
				if (this.object.kill) this.object.kill();
				else this.object.alive = false;
			}
			this.object = null;
		} else {
			if (this.object && kill) {
				if (this.object.kill) this.object.kill();
				else this.object.alive = false;
			}
			game.objects.push(this.object = obj);
			this.object.alive = false; // we're just going to spawn it in on next update
		}
	}
}
