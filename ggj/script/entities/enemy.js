function EntityEnemy(x, y, texture, killable) {
	EntityBase.call(this, x + 0.125 - 0.5, y + 0.125 - 0.5, 0.75, 0.75);
	this.killable = killable;

	this.texture = texture;
	this.speed = 0.025;

	this.facingLeft = (Math.random() < 0.5);
	this.walkDist = 0;
}

EntityEnemy.prototype = Object.create(EntityBase.prototype);
EntityEnemy.prototype.constructor = EntityEnemy;

EntityEnemy.prototype.update = function() {
	if (this.vx === 0) {
		this.facingLeft = !this.facingLeft;
		this.vx = this.facingLeft ? -this.speed : this.speed;
	}

	this.move();

	this.walkDist += Math.abs(this.vx);

	if (this.interacts && this.alive)
		StateGame.forOverlap(this, function (other) {
			if (other.player)
				other.kill();			
		});
};

EntityEnemy.prototype.render = function(layer, dx, dy) {
	var frame = Math.floor(this.walkDist * 8) % (this.texture === 1 ? 7 : 3);

	layer.drawImage(
		this.texture === 1 ? WizardGame.images.enemy : WizardGame.images.enemy2,
		frame * 24,
		this.facingLeft ? 0 : 24, 24, 24,
		this.x * WizardView.tileScale - dx,
		this.y * WizardView.tileScale - dy + 1,
		this.width * WizardView.tileScale,
		this.height * WizardView.tileScale
	);
};

EntityEnemy.prototype.kill = function() {
	if (this.killable)
		this.alive = false;
};