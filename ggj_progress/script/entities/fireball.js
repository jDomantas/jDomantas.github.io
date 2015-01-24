function EntityFireball(x, y, dir) {
	EntityBase.call(this, x - 0.25, y - 0.25, 0.5, 0.5);

	this.vx = dir * 0.2;
	this.x += dir;
	this.facingLeft = dir < 0;
	this.gravity = 0;
	this.hitboxColor = '#f30';
}

EntityFireball.prototype = Object.create(EntityBase.prototype);
EntityFireball.prototype.constructor = EntityFireball;

EntityFireball.prototype.update = function() {
	this.move();
	if (this.vx === 0) {
		this.kill();
	}

	StateGame.forOverlap(this, function (other) {
		if (other.interacts) {
			other.kill();
			this.kill();
		}
	});
};