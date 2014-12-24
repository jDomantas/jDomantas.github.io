function Player (x, y, id) {
	this.size = { x: 10 / 16, y: 8 / 16, z: 8 / 16 };
	this.pos = { x: x - this.size.x / 2, y: y - this.size.y / 2, z: 0, vz: 0 };
	this.alive = true;
	this.walkTime = 0;
	this.direction = 0;
	this.canBePushed = false;
	this.canTeleport = true;
	this.moving = false;
	this.weight = 10;
	this.canPress = true;

	this.weapon = {
		has: false,
		animation: 0,
		target: null,
		justTeleported: false,
		line: null
	};

	this.mirror = {
		has: false,
		on: false
	};

	this.id = id;
}

Player.prototype = {
	intersects: ObjectBase.intersects,

	keyPressed: function(app, game, key) {
		if (game.players.length > 1)
			return app.keyboard.keys[controls['player' + (this.id + 1)][key]];
		else
			return app.keyboard.keys[controls.player1[key]] || app.keyboard.keys[controls.player2[key]];
	},

	update: function(app, game) {
		
		this.move(app, game);

		if (this.mirror.has) {
			this.mirror.on = this.keyPressed(app, game, 'action');
		}

		if (this.pos.z < -5 && !this.deathSound && this.alive) {
			app.playSound('death');
			this.deathSound = true;
		}
		if (this.pos.z < -10) {
			this.deathSound = false;
			this.alive = false;
		}

		if (app.mouse.left) {
			if (this.weapon.target !== null && !this.weapon.justTeleported && this.weapon.target.canTeleport) {
				var pos = { x: this.weapon.target.pos.x, y: this.weapon.target.pos.y, z: this.weapon.target.pos.z };
				this.weapon.target.pos.x = this.pos.x;
				this.weapon.target.pos.y = this.pos.y;
				this.weapon.target.pos.z = this.pos.z;
				this.pos.x = pos.x;
				this.pos.y = pos.y;
				this.pos.z = pos.z;
				app.playSound('teleport');
				this.weapon.justTeleported = true;
				this.moving = true;
			}
		} else
			this.weapon.justTeleported = false;

		this.updateWeapon(app, game);
	},

	updateWeapon: function(app, game) {
		this.weapon.animation += 0.05;

		if (this.weapon.has && this.pos.z > -1) {

			var mousex = (app.mouse.x + 0.5 - game.offset.x) / app.scale;
			var mousey = (app.mouse.y + 0.5 - game.offset.y) / app.scale + this.size.z / 2;
			var startx = this.pos.x + this.size.x / 2;
			var starty = this.pos.y + this.size.y / 2;
			var pass = game.rayInteraction(
				Math.floor(this.pos.x + this.size.x / 2), 
				Math.floor(this.pos.y + this.size.y / 2), 
				true, mousex - startx, mousey - starty);

			if (pass === 0) {
				var result = game.castRay(startx, starty, mousex - startx, mousey - starty, this.size.z / 2, 8);
				this.weapon.line = result.line;
				this.weapon.target = result.target;
				this.weapon.hits = result.hits;
				if (this.weapon.line.length > 1) {
					dirx = this.weapon.line[1].x - this.weapon.line[0].x;
					diry = this.weapon.line[1].y - this.weapon.line[0].y;
					var len = Math.sqrt(dirx * dirx + diry * diry);
					dirx /= len;
					diry /= len;
					var ring = this.getRing();
					dirx *= ring.radius;
					diry *= ring.radius;
					this.weapon.line[0].x += dirx;
					this.weapon.line[0].y += diry;
				}
			} else {
				this.weapon.line = [ { x: 0, y: 0 } ];
				this.weapon.target = null;
			}
		} else {
			this.weapon.line = null;
			this.weapon.target = null;
			this.weapon.hits = [];
		}
	},

	move: function(app, game) {
		var move = { x: 0, y: 0 };

		if (this.keyPressed(app, game, 'left')) { move.x--; this.direction = 3; }
		if (this.keyPressed(app, game, 'right')) { move.x++; this.direction = 1; }
		if (this.keyPressed(app, game, 'down')) { move.y++; this.direction = 0; }
		if (this.keyPressed(app, game, 'up')) { move.y--; this.direction = 2; }
		move.x *= 0.05;
		move.y *= 0.05;
		if (move.x != 0 || move.y != 0)
			this.walkTime++;
		else
			this.walkTime = 0;
		if (this.walkTime > 0)
			this.moving = true;
		else
			this.moving = false;

		game.move(this, move);
	},

	draw: function(app, game) {
		if (this.pos.z < 0) app.screen.a(Math.max(0, this.pos.z * 0.5 + 1));
		app.screen.drawFrame(app.images.player, this.direction * 8 + (Math.floor(this.walkTime / 8) % 4) + (this.weapon.has ? 4 : 0),
			Math.round(this.pos.x * app.scale) + game.offset.x - 1, 
			Math.round((this.pos.y + this.size.y / 2 - this.pos.z - this.size.z) * app.scale) + game.offset.y - 3);
		app.screen.a(1);
	},

	teleportInteraction: function() {
		return (this.mirror.has && this.mirror.on) ? 2 : (this.weapon.has ? 0 : 1);
	},

	postDraw: function(app, game) {
		if (this.weapon.line) {

			app.overlay.lineWidth(2);


			app.overlay.strokeStyle('#69C5D3');
			for (var i = this.weapon.hits.length - 1; i >= 0; i--) {
				app.overlay.beginPath();
				var hitring = this.weapon.hits[i].getRing();
				app.overlay.arc(
					Math.round(hitring.x * app.scale) + game.offset.x, 
					Math.round((hitring.y - this.pos.z) * app.scale) + game.offset.y, 
					hitring.radius * app.scale, 0, 2 * Math.PI, false);
				app.overlay.stroke();
			};

			app.overlay.beginPath();

			app.overlay.strokeStyle(this.portalColor(0).toHex());
			var ring = this.getRing();
			app.overlay.arc(
				Math.round(ring.x * app.scale) + game.offset.x, 
				Math.round((ring.y - this.pos.z) * app.scale) + game.offset.y, 
				ring.radius * app.scale, 0, 2 * Math.PI, false);

			app.overlay.stroke();

			var len = 0;
			var x = (this.weapon.line[0].x + dirx) * app.scale;
			var y = (this.weapon.line[0].y + diry - this.size.z / 2) * app.scale;
			var x2, y2;
			for (var i = 1; i < this.weapon.line.length; i++) {
				x2 = (this.weapon.line[i].x + dirx) * app.scale;
				y2 = (this.weapon.line[i].y + diry - this.size.z / 2) * app.scale;
				if (i === 1) {

				}
				len += Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));
				x = x2;
				y = y2;
			}

			var done = 0, segment;
			//console.log(len);
			if (len > 0.001) {
				for (var i = 1; i < this.weapon.line.length; i++) {
					x2 = this.weapon.line[i - 1].x * app.scale + game.offset.x;
					y2 = (this.weapon.line[i - 1].y - this.size.z / 2) * app.scale + game.offset.y;
					x = this.weapon.line[i].x * app.scale + game.offset.x;
					y = (this.weapon.line[i].y - this.size.z / 2) * app.scale + game.offset.y;
					segment = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));

					var gradient = app.overlay.createLinearGradient(x2, y2, x, y);
					gradient.addColorStop(0, this.portalColor(done / len).toHex());
					gradient.addColorStop(1, this.portalColor((done + segment) / len).toHex());
					app.overlay.strokeStyle(gradient);

					done += segment;

					app.overlay.beginPath();
					app.overlay.moveTo(x2, y2);
					app.overlay.lineTo(x, y);
					app.overlay.stroke();

					/*if (i < this.weapon.line.length - 1.5 || !this.weapon.target) {
						app.overlay.fillStyle(this.portalColor(done / len).toHex());
						app.overlay.beginPath();
						app.overlay.arc(x, y, 3, 0, 2 * Math.PI, false);
						app.overlay.fill();
					}*/
				}
			}
			if (this.weapon.target) {
				app.overlay.beginPath();

				app.overlay.strokeStyle(this.portalColor(1).toHex());
				var ring = this.weapon.target.getRing();
				app.overlay.arc(
					Math.round(ring.x * app.scale) + game.offset.x, 
					Math.round((ring.y - this.weapon.target.pos.z) * app.scale) + game.offset.y, 
					ring.radius * app.scale, 0, 2 * Math.PI, false);

				app.overlay.stroke();	
			} else if (this.weapon.line.length > 1) {
				//this.drawEndMark(app, game, this.weapon.line[this.weapon.line.length - 1]);
			}
		}
		if (this.mirror.has && this.mirror.on) {
			app.overlay.strokeStyle('#69C5D3');
			app.overlay.beginPath();
			var hitring = this.getRing();
			app.overlay.arc(
				Math.round(hitring.x * app.scale) + game.offset.x, 
				Math.round((hitring.y - this.pos.z) * app.scale) + game.offset.y, 
				hitring.radius * app.scale, 0, 2 * Math.PI, false);
			app.overlay.stroke();
		}
	},

	portalColor: function(progress) {
		progress = Math.max(0, Math.min(1, progress));
		return cq.color([ 63 + progress * 192, 72 + progress * 65, 204 - progress * 175 ], 1);
	},

	getRing: function() {
		return { 
			x: (this.pos.x + this.size.x / 2), 
			y: (this.pos.y + this.size.y / 2 - this.size.z / 2),
			radius: 0.5
		}
	},

	drawEndMark: function(app, game, pos) {
		app.overlay.beginPath();
		var x = Math.round(pos.x * app.scale) + game.offset.x,
			y = Math.round(pos.y * app.scale) + game.offset.y,
			radius = 0.125 * app.scale,
			height = this.size.z * app.scale;
		app.overlay.arc(x, y, radius, 0, 2 * Math.PI, false);
		
		/*app.overlay.moveTo(x - radius, y - height);
		app.overlay.lineTo(x + radius, y);
		app.overlay.lineTo(x - radius, y);
		app.overlay.lineTo(x + radius, y - height);
		//app.overlay.lineTo(x - radius, y - height);*/

		/*app.overlay.moveTo(
			Math.round(pos.x * app.scale) + game.offset.x, 
			Math.round(pos.y * app.scale) + game.offset.y);

		app.overlay.lineTo(
			Math.round(pos.x * app.scale) + game.offset.x, 
			Math.round((pos.y - this.size.z) * app.scale) + game.offset.y);*/

		//app.overlay.lineCap('round');
		app.overlay.lineWidth(1);
		app.overlay.strokeStyle(this.portalColor(1).toHex());
		app.overlay.stroke();
	}
}
