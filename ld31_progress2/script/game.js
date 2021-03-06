function Game(width, height) {
	this.width = width;
	this.height = height;
	
	this.tiles = new Array(width);
	for (var i = 0; i < width; i++) {
		this.tiles[i] = new Array(height);
		for (var j = 0; j < height; j++)
			this.tiles[i][j] = new Tile(i, j, 'floor');
	}

	this.objects = [];
	this.objects.push(this.player = new Player(-10, 0));
	this.offset = { x: 0, y: 8 };
	this.playLoadSound = false;

	this.messageQueue = null;

	this.doordata = {};

	this.currentLevel = null;
}

Game.prototype = {

	passable: function(object, x, y) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) 
			return false;
		return this.tiles[x][y].passable(object);
	},

	move: function(object, delta) {

		var top = Math.max(Math.floor(object.pos.y), 0);
		var bottom = Math.min(Math.ceil(object.pos.y + object.size.y), this.height);
		var left = Math.max(Math.floor(object.pos.x), 0);
		var right = Math.min(Math.ceil(object.pos.x + object.size.x), this.width);
		var h = -10000;
		for (var x = left; x < right; x++)
			for (var y = top; y < bottom; y++)
				h = Math.max(this.tiles[x][y].height(), h);

		// falling
		//console.log('object.pos.z = ' + object.pos.z + ', stands on: ' + h + 
		//	', right below: ' + this.tiles[left][top].type + ', h: ' + this.tiles[left][top].height());

		object.pos.vz -= 0.01;
		if (object.pos.z + object.pos.vz > h) {
			object.pos.z += object.pos.vz;
		} else {
			object.pos.z = h;
			object.pos.vz = 0;
		}

		// moving
		if (delta.y < 0) this.moveUp(object, -delta.y);
		else if (delta.y > 0) this.moveDown(object, delta.y);

		if (delta.x < 0) this.moveLeft(object, -delta.x);
		else if (delta.x > 0) this.moveRight(object, delta.x);
	},

	moveUp: function(object, distance) {
		var left = Math.floor(object.pos.x);
		var right = Math.ceil(object.pos.x + object.size.x);
		var top = Math.floor(object.pos.y + 0.01) - 1;
		var ntop = Math.floor(object.pos.y - distance);
		for (var y = top; y >= ntop; y--)
			for (var x = left; x < right; x++)
				if (!this.passable(object, x, y)) {
					distance = object.pos.y - y - 1;
					y = ntop - 1;
					break;
				}

		for (var i = this.objects.length - 1; i >= 0; i--) {
			if (this.objects[i] !== object && this.objects[i].alive &&
				this.objects[i].pos.y + this.objects[i].size.y <= object.pos.y + 0.01 &&
				this.objects[i].intersects(object.pos.x, object.pos.y - distance, object.size.x, object.size.y + distance)) {
				if (this.objects[i].canBePushed)
					this.moveUp(this.objects[i], distance + this.objects[i].pos.y + this.objects[i].size.y - object.pos.y);
				distance = Math.min(distance, object.pos.y - this.objects[i].pos.y - this.objects[i].size.y)
			}
		};

		object.pos.y -= distance;
		return distance;
	},

	moveDown: function(object, distance) {
		var left = Math.floor(object.pos.x);
		var right = Math.ceil(object.pos.x + object.size.x);
		var bottom = Math.floor(object.pos.y + object.size.y - 0.01) + 1;
		var nbottom = Math.ceil(object.pos.y + object.size.y + distance);
		for (var y = bottom; y < nbottom; y++)
			for (var x = left; x < right; x++)
				if (!this.passable(object, x, y)) {
					distance = y - object.pos.y - object.size.y;
					//object.pos.y = y - object.size.y;
					y = nbottom;
					break;
				}

		for (var i = this.objects.length - 1; i >= 0; i--) {
			if (this.objects[i] !== object && this.objects[i].alive &&
				this.objects[i].pos.y >= object.pos.y + object.size.y - 0.01 &&
				this.objects[i].intersects(object.pos.x, object.pos.y, object.size.x, object.size.y + distance)) {
				if (this.objects[i].canBePushed)
					this.moveDown(this.objects[i], object.pos.y + object.size.y + distance - this.objects[i].pos.y);
				distance = Math.min(distance, this.objects[i].pos.y - object.pos.y - object.size.y)
			}
		};

		object.pos.y += distance;
		return distance;
	},

	moveLeft: function(object, distance) {
		var top = Math.floor(object.pos.y);
		var bottom = Math.ceil(object.pos.y + object.size.y);
		var left = Math.floor(object.pos.x + 0.01) - 1;
		var nleft = Math.floor(object.pos.x - distance);
		for (var x = left; x >= nleft; x--)
			for (var y = top; y < bottom; y++)
				if (!this.passable(object, x, y)) {
					distance = object.pos.x - x - 1;
					//object.pos.x = x + 1;
					x = nleft - 1;
					break;
				}

		for (var i = this.objects.length - 1; i >= 0; i--) {
			if (this.objects[i] !== object && this.objects[i].alive &&
				this.objects[i].pos.x + this.objects[i].size.x <= object.pos.x + 0.01 &&
				this.objects[i].intersects(object.pos.x - distance, object.pos.y, object.size.x, object.size.y + distance)) {
				//console.log('pushing for ' + (distance + this.objects[i].pos.x - object.pos.x));
				if (this.objects[i].canBePushed)
					this.moveLeft(this.objects[i], distance + this.objects[i].pos.x + this.objects[i].size.x - object.pos.x);
				distance = Math.min(distance, object.pos.x - this.objects[i].pos.x - this.objects[i].size.x)
			}
		};

		object.pos.x -= distance;
		return distance;
	},

	moveRight: function(object, distance) {
		var top = Math.floor(object.pos.y);
		var bottom = Math.ceil(object.pos.y + object.size.y);
		var right = Math.floor(object.pos.x + object.size.x - 0.01) + 1;
		var nright = Math.ceil(object.pos.x + object.size.x + distance);
		for (var x = right; x < nright; x++)
			for (var y = top; y < bottom; y++)
				if (!this.passable(object, x, y)) {
					distance = x - object.pos.x - object.size.x;
					//object.pos.x = x - object.size.x;
					x = nright;
					break;
				}

		for (var i = this.objects.length - 1; i >= 0; i--) {
			if (this.objects[i] !== object && this.objects[i].alive &&
				this.objects[i].pos.x >= object.pos.x + object.size.x - 0.01 &&
				this.objects[i].intersects(object.pos.x, object.pos.y, object.size.x + distance, object.size.y)) {
				if (this.objects[i].canBePushed)
					this.moveRight(this.objects[i], object.pos.x + object.size.x + distance - this.objects[i].pos.x);
				distance = Math.min(distance, this.objects[i].pos.x - object.pos.x - object.size.x)
			}
		};

		object.pos.x += distance;
		return distance;
	},

	update: function(app) {

		if (this.playLoadSound) {
			app.playSound('level');
			this.playLoadSound = false;
		}

		if (app.keyboard.keys['e'] || app.keyboard.keys['r'] || app.keyboard.keys['t'] || 
			app.keyboard.keys['y'] || app.keyboard.keys['u'] || app.keyboard.keys['i'] || 
			app.keyboard.keys['o']) {
			var x = Math.floor((app.mouse.x - this.offset.x * app.pixelScale) / (app.scale * app.pixelScale));
			var y = Math.floor((app.mouse.y - this.offset.y * app.pixelScale) / (app.scale * app.pixelScale));
			if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
				var tile = 'wall';
				if (app.keyboard.keys['e']) tile = 'wall';
				if (app.keyboard.keys['r']) tile = 'floor';
				if (app.keyboard.keys['t']) tile = 'pit';
				if (app.keyboard.keys['y']) tile = 'block';
				if (app.keyboard.keys['u']) tile = 'target';
				if (app.keyboard.keys['i']) tile = 'dispenser';
				if (app.keyboard.keys['o']) tile = 'button';
				//console.log('setting to: ' + tile);
				this.tiles[x][y].change(tile);
			}
		}

		for (var i = 0; i < this.width; i++)
			for (var j = 0; j < this.height; j++)
				this.tiles[i][j].update(app, this);
	
		for (var i = this.objects.length - 1; i >= 0; i--)
			if (this.objects[i].alive)
				this.objects[i].update(app, this);

		if (!this.player.alive) {
			this.player.pos.x = this.spawn.x;
			this.player.pos.y = this.spawn.y;
			this.player.pos.z = 0;
			this.player.direction = 0;
			this.player.alive = true;
		}

		if (this.messageQueue) {
			
			if (this.messageQueue.delay > 0)
				this.messageQueue.delay -= 1 / 60;
			else if (this.messageQueue.showTimer > 0)
				this.messageQueue.showTimer--;
			else if (this.messageQueue.showDelay > 0)
				this.messageQueue.showDelay -= 1 / 60;
			else if (this.messageQueue.hideTimer > 0)
				this.messageQueue.hideTimer--;
			else {
				this.messageQueue = this.messageQueue.next;
			}
		}
	},

	draw: function(app) {
		this.objects.sort(function(a, b) { return b.pos.y + b.size.y / 2 - a.pos.y - a.size.y / 2 });
		
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++)
				this.tiles[x][y].draw(app, this);
			for (var i = this.objects.length - 1; i >= 0; i--) {
				if (this.objects[i].alive &&
					this.objects[i].pos.y + this.objects[i].size.y > y &&
					this.objects[i].pos.y + this.objects[i].size.y < y + 1.01)
					this.objects[i].draw(app, this);
			}
		}

		for (var i = this.objects.length - 1; i >= 0; i--)
			if (this.objects[i].alive && this.objects[i].postDraw)
				this.objects[i].postDraw(app, this);

		if (this.messageQueue && this.messageQueue.delay <= 0) {
			if (this.messageQueue.showTimer > 0) {
				app.screen.drawImage(this.messageQueue.panel, 0, -this.messageQueue.showTimer);
			} else if (this.messageQueue.showDelay > 0) {
				app.screen.drawImage(this.messageQueue.panel, 0, 0);
			} else {
				app.screen.drawImage(this.messageQueue.panel, 0, this.messageQueue.hideTimer - this.messageQueue.panel.height);
			}
		}
	},

	rayPassable: function(x, y, device) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) 
			return false;
		return this.tiles[x][y].ray(device);
	},

	// casts ray from start to end, returns collision point or null if no collisions
	/*ray: function(sx, sy, ex, ey, device) {
		var tsx = Math.floor(sx);
		var tsy = Math.floor(sy);
		var tex = Math.floor(ex);
		var tey = Math.floor(ey);
		if (!this.rayPassable(tsx, tsy, device)) 
			return { x: sx, y: sy };

		var colx = null;
		var coly = null;

		if (tsx != tex) {
			if (tsx < tex) {
				for (var x = tsx + 1; x <= tex; x++) {
					var y = sy + (ey - sy) * (x - sx) / (ex - sx);
					if (!this.rayPassable(x, Math.floor(y), device)) {
						colx = { x: x, y: y };
						break;
					}
				}
			} else {
				for (var x = tsx - 1; x >= tex; x--) {
					var y = sy + (ey - sy) * (x + 1 - sx) / (ex - sx);
					if (!this.rayPassable(x, Math.floor(y), device)) {
						colx = { x: x, y: y };
						break;
					}
				}
			}
		}

		if (tsy != tey) {
			if (tsy < tey) {
				for (var y = tsy + 1; y <= tey; y++) {
					var x = sx + (ex - sx) * (y - sy) / (ey - sy);
					if (!this.rayPassable(Math.floor(x), y, device)) {
						coly = { x: x, y: y };
						break;
					}
				}
			} else {
				for (var y = tsy - 1; y >= tey; y--) {
					var x = sx + (ex - sx) * (y + 1 - sy) / (ey - sy);
					if (!this.rayPassable(Math.floor(x), y, device)) {
						coly = { x: x, y: y };
						break;
					}
				}
			}
		}

		if (colx === null && coly === null) return null;
		if ((colx === null) || (coly === null)) return colx === null ? coly : colx;
		return (sx - colx.x) * (sx - colx.x) + (sy - colx.y) * (sx - colx.y) < 
				(sx - coly.x) * (sx - coly.x) + (sy - coly.y) * (sx - coly.y) ?
				colx : coly;
	}*/

	ray: function (sx, sy, ex, ey, device) {
		for (var j = 0; j < 200; j++) {
			var x = sx + (j / 200) * (ex - sx);
			var y = sy + (j / 200) * (ey - sy);
			if (!this.rayPassable(Math.floor(x), Math.floor(y), device)) {
				var hit = { x: x, y: y };
				if (Math.abs(Math.round(hit.x) - hit.x) < Math.abs(Math.round(hit.y) - hit.y))
					hit.x = Math.round(hit.x);
				else
					hit.y = Math.round(hit.y);
				return hit;
			}
		}
		return null;
	},

	loadLevel: function(app, level, fast, delay, hard) {
		this.currentLevel = level;
		var newObjects = [];
		this.doordata = {};

		for (var i = this.objects.length - 1; i >= 0; i--)
			if (this.objects[i].alive) {
				newObjects.push(this.objects[i]);
				if (this.objects[i].animation) // destroy crates
					this.objects[i].animation(false);
			}
		this.objects = newObjects;
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				if (fast)	this.tiles[x][y].type = (level.tiles[x][y].type)
				else 		this.tiles[x][y].change(level.tiles[x][y].type, delay ? delay(this, x, y) : Math.random() * 0.2);
				this.tiles[x][y].activated = level.tiles[x][y].activated;
				this.tiles[x][y].crate = null;
			}
		}
		if (typeof hard === 'undefined')
			hard = false;
		if (hard)
			this.messageQueue = null;
		if (level.start) {
			this.spawn = {};
			this.spawn.x = level.start.x + 0.5 - this.player.size.x / 2;
			this.spawn.y = level.start.y + 0.5 - this.player.size.y / 2;
			if (this.player.pos.x < -5 || hard) {
				this.player.pos.x = this.spawn.x;
				this.player.pos.y = this.spawn.y;
			}
		} else {
			this.spawn = { x: this.player.pos.x, y: this.player.pos.y };
		}

		if (level.onStart) {
			level.onStart(app, this);
		}

		this.playLoadSound |= (!fast && !hard);
	},

	message: function(app, message, delay) {
		delay = delay || 0;
		var panel = Font.createPanel(app, message, app.width / app.pixelScale).canvas;
		console.log('Message: ' + message);
		if (this.messageQueue === null) {
			this.messageQueue = { message: message, delay: delay, showDelay: message.length / 25 + 1, next: null,
			panel: panel, showTimer: panel.height, hideTimer: panel.height };
		} else {
			var k = this.messageQueue;
			while (k.next)
				k = k.next;
			k.next = { message: message, delay: delay, showDelay: message.length / 25 + 1, next: null,
				panel: panel, showTimer: panel.height, hideTimer: panel.height };
		}
	}
}
