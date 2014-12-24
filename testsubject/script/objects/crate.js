function Crate(x, y) {
	if (typeof x === 'undefined')
		x = y = -10;
	this.pos = { x: x, y: y, z: 0, vz: 0 };
	this.size = { x: 10 / 16, y: 8 / 16, z: 8 / 16 };
	this.alive = (x > -1);
	this.canTeleport = true;
	this.setType(0);
	this.appearTimer = this.alive ? 0.5 : 0;
	this.disappearTimer = 0;
	this.interaction = 1;
}

Crate.prototype = {
	intersects: ObjectBase.intersects,

	// 0 - nothing, 1 - hit (check canTeleport), 2 - reflect
	teleportInteraction: function() {
		return this.pos.z > -1 && this.appearTimer < 0.001 && this.disappearTimer < 0.001 ?
			this.interaction :
			0;
	},

	setType: function(type) {
		this.img = type;
		if (type === 0) { this.canPress = true;	this.weight = 1; 	this.canBePushed = true; 	this.canTeleport = true;	this.interaction = 1; }
		if (type === 1) { this.canPress = true;	this.weight = 2; 	this.canBePushed = false; 	this.canTeleport = true;	this.interaction = 1; }
		if (type === 2) { this.canPress = true;	this.weight = 3; 	this.canBePushed = true; 	this.canTeleport = true;	this.interaction = 1; }
		if (type === 3) { this.canPress = false;this.weight = 4; 	this.canBePushed = true; 	this.canTeleport = true;	this.interaction = 1; }
		if (type === 4) { this.canPress = false;this.weight = 5; 	this.canBePushed = false; 	this.canTeleport = false;	this.interaction = 0; }
		if (type === 5) { this.canPress = false;this.weight = 6; 	this.canBePushed = true; 	this.canTeleport = false;	this.interaction = 0; }
		if (type === 6) { this.canPress = false;this.weight = 7; 	this.canBePushed = true; 	this.canTeleport = false;	this.interaction = 0; }
		if (type === 7) { this.canPress = true;	this.weight = 8; 	this.canBePushed = true; 	this.canTeleport = false;	this.interaction = 2; }
		return this;
	},

	animation: function(appear) {
		if (appear)
			this.appearTimer = 0.5;
		else {
			this.appearTimer = 0;
			this.disappearTimer = 0.5;
			this.canTeleport = false;
		}
	},

	respawn: function() {
		this.alive = true;
		this.animation(true);
	},

	update: function(app, game) {
		game.move(this, { x: 0, y: 0 });
		if (this.pos.z < -3) { 
			this.alive = false;
			//app.playSound('explosion');
		}
		if (this.appearTimer > 0) this.appearTimer -= 0.0166;
		else if (this.disappearTimer > 0) { 
			this.disappearTimer -= 0.0166;
			if (this.disappearTimer <= 0.001)
				this.alive = false;
		}
	},

	draw: function(app, game) {
		if (this.pos.z < 0) app.screen.a(Math.max(0, this.pos.z * 0.5 + 1));
		var frame = this.img;
		if (this.appearTimer > 0) {
			frame = this.img * 10 + 10 + 4 - Math.floor(this.appearTimer * 9.99);
		} else if (this.disappearTimer > 0) {
			frame = this.img * 10 + 10 + Math.floor(this.disappearTimer * 9.99);
		}
		app.screen.drawFrame(app.images.crate, frame,
			Math.round(this.pos.x * app.scale) + game.offset.x - 1, 
			Math.round((this.pos.y - this.pos.z) * app.scale) + game.offset.y - 7);
		app.screen.a(1);
	},

	getRing: function() {
		return { 
			x: (this.pos.x + this.size.x / 2), 
			y: (this.pos.y + this.size.y / 2 - this.size.z / 2),
			radius: 0.5
		}
	},

	getInnerMirrors: function() {
		if (this.img === 5 && this.appearTimer <= 0.001 && this.disappearTimer <= 0.001) 
			return [ 
				[
					this.pos.x + 1 / 16,
					this.pos.y,
					this.pos.x + this.size.x - 1 / 16,
					this.pos.y + this.size.y
				]
			];
		else if (this.img === 6 && this.appearTimer <= 0.001 && this.disappearTimer <= 0.001) 
			return [ 
				[
					this.pos.x + 1 / 16,
					this.pos.y + this.size.y,
					this.pos.x + this.size.x - 1 / 16,
					this.pos.y
				]
			];
		return [];
	},

	kill: function() {
		this.animation(false);		
	}
}