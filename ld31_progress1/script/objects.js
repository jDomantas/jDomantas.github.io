function intersects(x, y, w, h) {
	return this.pos.x < x + w && x < this.pos.x + this.size.x &&
		this.pos.y < y + h && y < this.pos.y + this.size.y;
}

function Player (x, y) {
	this.pos = { x: x, y: y, z: 0, vz: 0 };
	this.size = { x: 10 / 16, y: 6 / 16, z: 8 / 16 };
	this.alive = true;
	this.walkTime = 0;
	this.direction = 0;
	this.weapon = false;
	this.weaponRot = 0;
	this.weaponHit = null;
	this.target = null;
	this.deathSound = false;
	this.showRing = false;
	this.justTeleported = false;
}

Player.prototype = {
	intersects: intersects,

	update: function(app, game) {
		var move = { x: 0, y: 0 };
		if (app.keyboard.keys['a'] || app.keyboard.keys['left']) { move.x--; this.direction = 3; }
		if (app.keyboard.keys['d'] || app.keyboard.keys['right']) { move.x++; this.direction = 1; }
		if (app.keyboard.keys['s'] || app.keyboard.keys['down']) { move.y++; this.direction = 0; }
		if (app.keyboard.keys['w'] || app.keyboard.keys['up']) { move.y--; this.direction = 2; }
		move.x *= 0.05;
		move.y *= 0.05;
		if (move.x != 0 || move.y != 0)
			this.walkTime++;
		else
			this.walkTime = 0;
		game.move(this, move);
		if (this.pos.z < -10 && !this.deathSound && this.alive) {
			app.playSound('death');
			this.deathSound = true;
		}
		if (this.pos.z < -20) {
			this.deathSound = false;
			this.alive = false;
		}

		if (app.mouse.left) {
			if (this.target !== null && this.weaponHit === null && !this.justTeleported) {
				var pos = { x: this.target.pos.x, y: this.target.pos.y, z: this.target.pos.z };
				this.target.pos.x = this.pos.x;
				this.target.pos.y = this.pos.y;
				this.target.pos.z = this.pos.z;
				this.pos.x = pos.x;
				this.pos.y = pos.y;
				this.pos.z = pos.z;
				app.playSound('teleport');
				this.justTeleported = true;
			}
		} else
			this.justTeleported = false;

		this.findTarget(app, game);

		this.weaponRot += 0.3;
	},

	draw: function(app, game) {
		app.screen.drawFrame(app.images.player, this.direction * 4 + (Math.floor(this.walkTime / 8) % 4),// + (this.weapon ? 4 : 0),
			Math.round(this.pos.x * app.scale) + game.offset.x - 1, 
			Math.round((this.pos.y - this.pos.z) * app.scale) + game.offset.y - 7);
	},

	findTarget: function(app, game) {
		var closest = null, dist = 0.36;
		this.target = null;
		this.weaponHit = null;
		if (this.pos.z < -0.1)
			return;
		for (var i = game.objects.length - 1; i >= 0; i--) {
			if (game.objects[i].alive && game.objects[i].pos.z > -0.01 && game.objects[i] !== this) {
				var x = (app.mouse.x - game.offset.x * app.pixelScale) / (app.scale * app.pixelScale);
				var y = (app.mouse.y - game.offset.y * app.pixelScale) / (app.scale * app.pixelScale);
				var d = (game.objects[i].pos.x + game.objects[i].size.x / 2 - x) *
						(game.objects[i].pos.x + game.objects[i].size.x / 2 - x) +
						(game.objects[i].pos.y + game.objects[i].size.y / 2 - game.objects[i].size.z / 2 - y) *
						(game.objects[i].pos.y + game.objects[i].size.y / 2 - game.objects[i].size.z / 2 - y);
				if (d < dist) {
					dist = d;
					closest = game.objects[i];
				}
			}
		}
		this.showRing = false;
		this.target = closest;
		if (closest !== null) {
			this.weaponHit = game.ray(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, 
				closest.pos.x + closest.size.x / 2, closest.pos.y + closest.size.y / 2, true);
			if (!game.rayPassable(Math.floor(this.pos.x + this.size.x / 2), Math.floor(this.pos.y + this.size.y / 2), true)) {
				this.target = null;
				this.weaponHit = null;
				this.showRing = true;
			}
		}
		else
			this.weaponHit = null;
	},

	postDraw: function(app, game) {
		if (this.target !== null) {
			var start = { x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 - this.pos.z - this.size.z / 2 };
			var end = (this.weaponHit === null) ? 
				{ x: this.target.pos.x + this.target.size.x / 2, y: this.target.pos.y + this.target.size.y / 2 
					- this.target.pos.z - this.target.size.z / 2 } : 
				{ x: this.weaponHit.x, y: this.weaponHit.y - this.target.size.z / 2 };
			var dir = { x: end.x - start.x, y: end.y - start.y };
			var len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
			dir.x /= len;
			dir.y /= len;
			start.x += 8 / 16 * dir.x;
			start.y += 8 / 16 * dir.y;
			//if (this.weaponHit === null) {
			var circle = { x: end.x, y: end.y };
			end.x -= 9 / 16 * dir.x;
			end.y -= 9 / 16 * dir.y;
			//} else
			//	end.y -= this.target.size.z / 2;

			/*console.log('line between (' + 
				(Math.round(start.x * app.scale) + game.offset.x) + '; ' + (Math.round(start.y * app.scale) + game.offset.y) +
				') and (' + 
				(Math.round(end.x * app.scale) + game.offset.x) + '; ' + (Math.round(end.y * app.scale) + game.offset.y) + ')');*/

			app.screen.imageLine(app.images.laser, [0, Math.floor(this.weaponRot) % 6, 6, 1], 
				Math.round(start.x * app.scale) + game.offset.x, 
				Math.round(start.y * app.scale) + game.offset.y,
				Math.round(end.x * app.scale) + game.offset.x, 
				Math.round(end.y * app.scale) + game.offset.y);

			app.screen.drawFrame(app.images.portal, Math.floor(this.weaponRot) % 8, 
				Math.round((this.pos.x + this.size.x / 2) * app.scale) + game.offset.x - 11, 
				Math.round((this.pos.y + this.size.y / 2 - this.pos.z - this.size.z / 2) * app.scale) + game.offset.y - 11);
			app.screen.drawFrame(app.images.portal, 8 + Math.floor(this.weaponRot) % 8, 
				Math.round(circle.x * app.scale) + game.offset.x - 11, 
				Math.round(circle.y * app.scale) 
					+ game.offset.y - 11);
		} else if (this.showRing) {
			app.screen.drawFrame(app.images.portal, Math.floor(this.weaponRot) % 8, 
				Math.round((this.pos.x + this.size.x / 2) * app.scale) + game.offset.x - 11, 
				Math.round((this.pos.y + this.size.y / 2 - this.pos.z - this.size.z / 2) * app.scale) + game.offset.y - 11);
			
		}
	}
}

function Crate (x, y) {
	this.pos = { x: x, y: y, z: 0, vz: 0 };
	this.size = { x: 10 / 16, y: 8 / 16, z: 6 / 16 };
	this.alive = true;
}

Crate.prototype = {
	intersects: intersects,

	update: function(app, game) {
		game.move(this, { x: 0, y: 0 });
		if (this.pos.z < -20) this.alive = false;
	},

	draw: function(app, game) {
		app.screen.drawFrame(app.images.crate, 0,
			Math.round(this.pos.x * app.scale) + game.offset.x, 
			Math.round((this.pos.y - this.pos.z) * app.scale) + game.offset.y - 6);
	}
}
