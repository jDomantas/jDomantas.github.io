function Game(width, height) {
	this.width = width;
	this.height = height;
	
	this.tiles = new Array(width);
	for (var i = 0; i < width; i++) {
		this.tiles[i] = new Array(height);
		for (var j = 0; j < height; j++)
			this.tiles[i][j] = new Tile(i, j, 'floor');
	}

	for (var i = 0; i < this.width; i++) {
		this.tiles[i][0].type = 'wall';
		this.tiles[i][this.height - 1].type = 'wall';
	}

	for (var i = 0; i < this.height; i++) {
		this.tiles[0][i].type = 'wall';
		this.tiles[this.width - 1][i].type = 'wall';
	}

	this.objects = [];
	this.players = [];
	//this.players.push(new Player(1, 1))
	//this.objects.push(this.players[0]);
	this.offset = { x: 0, y: 8 };
	this.playLoadSound = false;

	this.messageQueue = null;

	this.currentLevel = null;
	
	this.spawns = [];
	this.ends = [];

	this.events = [];

	this.won = false;
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
				distance = Math.min(distance, this.objects[i].pos.y - object.pos.y - object.size.y);
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

		for (var i = this.events.length - 1; i >= 0; i--)
			this.events[i].updated = false;
		for (var i = this.events.length - 1; i >= 0; i--)
			this.events[i].updateNode(this);

		for (var i = 0; i < this.width; i++)
			for (var j = 0; j < this.height; j++)
				this.tiles[i][j].update(app, this);
	
		for (var i = this.objects.length - 1; i >= 0; i--)
			if (this.objects[i].alive)
				this.objects[i].update(app, this);

		this.forPlayer(this, function (p, index) {
			if (!p.alive) {
				p.pos.x = this.spawns[index].x + 0.5 - p.size.x / 2;
				p.pos.y = this.spawns[index].y + 0.5 - p.size.y / 2;
				p.pos.z = 0;
				p.pos.vz = 0;
				p.direction = 0;
				if (p.respawn) p.respawn();
				else p.alive = true;
			}
		});

		if (this.messageQueue) {
			
			if (this.messageQueue.message === '[END]') {
				this.messageQueue = null;
				app.setState(endState);
				return;
			}

			if (this.messageQueue.delay > 0)
				this.messageQueue.delay -= 1 / 60;
			else if (this.messageQueue.showTimer > 0)
				this.messageQueue.showTimer--;
			else if (this.messageQueue.showDelay > 0 || !this.messageQueue.allowHiding) {
				this.messageQueue.showDelay -= 1 / 60;
				if ((this.messageQueue.showDelay <= 0) && this.player.moving)
					this.messageQueue.allowHiding = true;
			}
			else if (this.messageQueue.hideTimer > 0)
				this.messageQueue.hideTimer--;
			else {
				this.messageQueue = this.messageQueue.next;
			}
		}

		var exitsReached = [];
		this.forPlayer(this, function (p) {
			var x = Math.floor(p.pos.x + p.size.x / 2);
			var y = Math.floor(p.pos.y + p.size.y / 2);
			if (x >= 0 && y >= 0 && x < this.width && y < this.height && this.tiles[x][y].type === 'target')
				exitsReached.push(x + y * this.width);
		});
		var dupes = 0;
		exitsReached.sort();
		for (var i = 1; i < exitsReached.length; i++)
			if (Math.abs(exitsReached[i] - exitsReached[i - 1]) < 0.5)
				dupes++;
		if (Math.abs(exitsReached.length - dupes - this.spawns.length) < 0.5 && !this.won) {
			app.playSound('level');
			this.won = true;
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

	rayInteraction: function(x, y, device, dirx, diry) {
		if (x < -1 || y < -1 || x >= this.width + 1 || y >= this.height + 1) 
			return 1;
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) 
			return 0;
		return this.tiles[x][y].rayInteraction(device, { x: dirx, y: diry });
	},

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

	loadLevel: function(app, level, fast, hard) {
		this.currentLevel = level;
		this.won = false;
		/*if (this.currentLevel.weapon) {
			if (this.currentLevel.weapon === 'yes')
				this.player.weapon.has = true;
			else
				this.player.weapon.has = false;
		} else {
			this.currentLevel.weapon = (this.player.weapon.has ? 'yes' : 'no');
		}*/
		var newObjects = [];

		if (!hard) {
			for (var i = this.objects.length - 1; i >= 0; i--)
				if (this.objects[i].alive) {
					newObjects.push(this.objects[i]);
					if (this.objects[i].animation) // destroy crates
						this.objects[i].animation(false);
				}
		} else {
			this.players = [];
		}

		this.objects = newObjects;

		this.spawns = [];
		this.ends = [];
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				if (level.tiles[x][y] === 'spawn') this.spawns.push({ x: x, y: y });
				if (level.tiles[x][y] === 'target') this.ends.push({ x: x, y: y });
				if (fast) {
					this.tiles[x][y].type = (level.tiles[x][y])
					this.tiles[x][y].target = null;
				}
				else 		
					this.tiles[x][y].change(level.tiles[x][y], Math.random() * 0.2);
				this.tiles[x][y].setDispensedObject(this, null, true);
			}
		}

		for (var i = 0; i < level.crates.length; i++) {
			this.tiles[level.crates[i].x][level.crates[i].y].setDispensedObject(this, new Crate().setType(level.crates[i].t));
		}

		if (hard)
			this.messageQueue = null;

		if (this.players.length === 0) {
			// adding players
			for (var i = 0; i < this.spawns.length; i++) {
				this.players.push(new Player(this.spawns[i].x + 0.5, this.spawns[i].y + 0.5, i));
				this.objects.push(this.players[i]);
			}

			if (this.players.length > 0) {
				this.players[0].weapon.has = this.currentLevel.tools || false;
				this.players[0].canTeleport = !this.players[0].weapon.has;
			} 
			if (this.players.length > 1) { 
				this.players[1].mirror.has = this.currentLevel.tools || false;
			}
		}

		this.events = new Array(level.events.length);
		for (var i = 0; i < this.events.length; i++)
			this.events[i] = new EventNode(level.events[i]);
		for (var i = 0; i < this.events.length; i++)
			this.events[i].updateInputs(this.events);


		for (var i = this.events.length - 1; i >= 0; i--)
			this.events[i].updated = false;
		for (var i = this.events.length - 1; i >= 0; i--)
			this.events[i].updateNode(this);
		//if (!fast && !hard)
		//	app.playSound('level');
	},

	message: function(app, message, delay) {
		delay = delay || 0;
		var panel = Font.createPanel(app, message, app.width / app.pixelScale).canvas;
		//console.log('Message: ' + message);
		if (this.messageQueue === null) {
			this.messageQueue = { message: message, delay: delay, showDelay: message.length / 25 + 1, next: null,
			panel: panel, showTimer: panel.height, hideTimer: panel.height, allowHiding: false };
		} else {
			var k = this.messageQueue;
			while (k.next) {
				//k.allowHiding = true;
				k = k.next;
			}
			k.next = { message: message, delay: delay, showDelay: message.length / 25 + 1, next: null,
				panel: panel, showTimer: panel.height, hideTimer: panel.height, allowHiding: false };
		}
	},

	castRay: function(sx, sy, dirx, diry, h, bounces) {
		var collisions = [];

		if (dirx > 0) {
			var x = Math.floor(sx + 1);
			var y = sy + (x - sx) * diry / dirx;
			var res;
			while (true) {
				res = this.rayInteraction(Math.round(x), Math.floor(y), true, dirx, diry);
				if (res !== 0) {
					collisions.push({ x: x, y: y, interaction: res, side: 3 });
					break;
				}
				x += 1;
				y += diry / dirx;
			}
		} else if (dirx < 0) {
			var x = Math.floor(sx);
			var y = sy + (x - sx) * diry / dirx;
			var res;
			while (true) {
				res = this.rayInteraction(Math.round(x) - 1, Math.floor(y), true, dirx, diry);
				if (res !== 0) {
					collisions.push({ x: x, y: y, interaction: res, side: 1 });
					break;
				}
				x -= 1;
				y -= diry / dirx;
			}
		}

		if (diry > 0) {
			var y = Math.floor(sy + 1);
			var x = sx + (y - sy) * dirx / diry;
			var res;
			while (true) {
				res = this.rayInteraction(Math.floor(x), Math.round(y), true, dirx, diry);
				if (res !== 0) {
					collisions.push({ x: x, y: y, interaction: res, side: 0 });
					break;
				}
				y += 1;
				x += dirx / diry;
			}
		} else if (diry < 0) {
			var y = Math.floor(sy);
			var x = sx + (y - sy) * dirx / diry;
			var res;
			while (true) {
				res = this.rayInteraction(Math.floor(x), Math.round(y) - 1, true, dirx, diry);
				if (res !== 0) {
					collisions.push({ x: x, y: y, interaction: res, side: 2 });
					break;
				}
				y -= 1;
				x -= dirx / diry;
			}
		}

		for (var i = this.objects.length - 1; i >= 0; i--) {
			if (!this.objects[i].alive) continue;
			var interact = this.objects[i].teleportInteraction();
			if (interact !== 0) { // collision with objects
				var ring = this.objects[i].getRing();
				ring.y += h;
				if ((ring.x - sx) * (ring.x - sx) + (ring.y - sy) * (ring.y - sy) <= ring.radius * ring.radius)
					collisions.push({ x: sx, y: sy, target: this.objects[i], interaction: 1 });
				var a = dirx * dirx + diry * diry;
				var b = -2 * (dirx * (ring.x - sx) + diry * (ring.y - sy));
				var c = (ring.x - sx) * (ring.x - sx) + (ring.y - sy) * (ring.y - sy) - ring.radius * ring.radius;
				var d = b * b - 4 * a * c;
				//console.log('equation: ' + a + ' * l^2 + ' + b + ' * l + ' + c + ' = 0, d = ' + d);
				if (d >= 0) {
					d = Math.sqrt(d);
					var l1 = (-b + d) / (2 * a);
					var l2 = (-b - d) / (2 * a);
					if (l1 > 0) {
						var x = sx + l1 * dirx, y = sy + l1 * diry
						if (interact === 1) // collide
							collisions.push({ x: x, y: y, target: this.objects[i], interaction: 1 });
						else // reflect
							collisions.push({ x: x, y: y, hit: this.objects[i], wall: [ -y + ring.y, x - ring.x ], interaction: 2 });
					}
					if (l2 > 0) {
						var x = sx + l2 * dirx, y = sy + l2 * diry
						if (interact === 1) // collide
							collisions.push({ x: x, y: y, target: this.objects[i], interaction: 1 });
						else // reflect
							collisions.push({ x: x, y: y, hit: this.objects[i], wall: [ -y + ring.y, x - ring.x ], interaction: 2 });
					}
				}
			}

			var mirrors = ObjectBase.getInnerMirrors(this.objects[i]);
			for (var j = mirrors.length - 1; j >= 0; j--) {
				var b = { x: mirrors[j][0] - sx, y: mirrors[j][1] - sy };
				var c = { x: mirrors[j][2] - mirrors[j][0], y: mirrors[j][3] - mirrors[j][1] };
				var m = dirx * b.y - b.x * diry, n = c.x * diry - dirx * c.y, k = b.x * c.y - b.y * c.x;
				if (Math.abs(n) > 0.000001) {
					m = m / n;
					k = k / n
					if (m > 0 && m < 1 && k < 0)
						collisions.push({ 
							x: sx + b.x + c.x * m, 
							y: sy + b.y + c.y * m, 
							target: null, 
							interaction: 2,
							wall: [ c.x, c.y ] 
						});
				}
			}
		};

		var bestDist = 1000000, id = -1;
		for (var i = collisions.length - 1; i >= 0; i--) {
			var dist = (sx - collisions[i].x) * (sx - collisions[i].x) + (sy - collisions[i].y) * (sy - collisions[i].y);
			if (dist < bestDist) {
				bestDist = dist;
				id = i;
			}
		}

		if (collisions[id].interaction === 2 && bounces) { // should be mirrored, fun stuff!
			var side = collisions[id].side;

			var len = Math.sqrt(dirx * dirx + diry * diry);
			dirx /= len;
			diry /= len;

			var startx = collisions[id].x;// - dirx * 0.001;
			var starty = collisions[id].y;

			if (collisions[id].wall) {
				startx -= dirx * 0.001;
				starty -= diry * 0.001;
				var wall = collisions[id].wall;
				var newdirx = dirx * (wall[0] * wall[0] - wall[1] * wall[1]) + 2 * wall[0] * wall[1] * diry;
				var newdiry = diry * (wall[1] * wall[1] - wall[0] * wall[0]) + 2 * wall[0] * wall[1] * dirx;
				dirx = newdirx;
				diry = newdiry;
			} else {
				if (side === 0) { startx -= dirx * 0.001; starty += diry * 0.001; diry *= -1; }
				else if (side === 1) { startx += dirx * 0.001; starty -= diry * 0.001; dirx *= -1; }
				else if (side === 2) { startx -= dirx * 0.001; starty += diry * 0.001; diry *= -1; }
				else if (side === 3) { startx += dirx * 0.001; starty -= diry * 0.001; dirx *= -1; }
			}

			var result = this.castRay(
				startx, starty,
				dirx, diry, h, bounces - 1);

			var curr = { target: null, line: 
				[ 
					{ x: sx, y: sy }, 
					{ x: collisions[id].x, y: collisions[id].y }, 
					{ x: startx, y: starty } 
				],
				hits: [] };

			if (collisions[id].hit)
				curr.hits.push(collisions[id].hit);

			curr.target = result.target;
			for (var i = 1; i < result.line.length; i++)
				curr.line.push(result.line[i]);
			for (var i = 0; i < result.hits.length; i++)
				curr.hits.push(result.hits[i]);
			return curr;
		}

		return { target: collisions[id].target || null, 
			line: [ 
				{ x: sx, y: sy }, 
				{ x: collisions[id].x, y: collisions[id].y } 
			],
			hits: [] };
	},

	forPlayer: function(context, func) {
		for (var i = 0; i < this.players.length; i++) {
			func.call(context, this.players[i], i);
		}
	}
}
