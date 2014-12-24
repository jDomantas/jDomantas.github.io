function Weapon(x, y) {
	this.size = { x: 1 / 8, y: 1 / 8, z: 0.3 };
	this.pos = { x: x - this.size.x / 2, y: y - this.size.y / 2, z: 0, vz: 0 };
	this.alive = true;
	this.animationTimer = 0;
	this.canPress = false;
	this.canBePushed = true;
	this.canTeleport = false;
	this.weight = 0;
}

Weapon.prototype = {
	intersects: ObjectBase.intersects,

	teleportInteraction: function() {
		return 0;
	},

	update: function(app, game) {
		this.animationTimer += 0.0166;
	},

	draw: function(app, game) {
		var frame = Math.floor(this.animationTimer * 10) % 4;
		app.screen.drawFrame(app.images.weapon, frame,
			Math.round(this.pos.x * app.scale) + game.offset.x - 3, 
			Math.round((this.pos.y - this.pos.z) * app.scale) + game.offset.y - 6);
	}
}
