function EntityFireball(x, y, dir) {
	EntityBase.call(this, x - 0.25, y - 0.25, 0.5, 0.5);

	this.vx = dir * 0.15;
	//this.x += dir;
	if (dir < 0) this.moveLeft(0.63);
	else this.moveRight(0.63);
	this.facingLeft = dir < 0;
	this.gravity = 0;
	this.hitboxColor = '#f30';

	this.disappearTimer = 12;
	this.timer = 0;
	this.vertical = false;
}

EntityFireball.prototype = Object.create(EntityBase.prototype);
EntityFireball.prototype.constructor = EntityFireball;

EntityFireball.prototype.update = function() {
	this.move();
	if ((this.vx === 0) && (this.vy === 0)) {
		this.kill();
	} else
		this.timer++;

	//console.log('ball of fire!');

	if (this.interacts && this.alive)
		StateGame.forOverlap(this, function (other) {
			if (other.reflectsFireball) {
				if (this.vx !== 0) {
					this.vy = -Math.abs(this.vx);
					this.vx = 0;
					this.vertical = true;
				}
			} else if (other.interacts) {
				other.kill();
				this.kill();
			}
			
		});
	else {
		this.disappearTimer--;
		if (this.disappearTimer <= 0)
			this.alive = false;
	}
};

EntityFireball.prototype.kill = function() {
	this.interacts = false;
	this.vx = 0;
	this.vy = 0;
};

EntityFireball.prototype.render = function(layer, dx, dy) {
	var frame = 0;
	if (this.interacts)
		frame = Math.floor(this.timer / 15) % 2;
	else
		frame = 3 - Math.floor(this.disappearTimer / 6);

	var type = 0;
	if (this.vertical) type = 2;
	else if (this.facingLeft) type = 1;
	else type = 0;

	layer.drawImage(
		WizardGame.images.skillball,
		frame * 16,
		type * 16, 16, 16,
		this.x * WizardView.tileScale - dx,
		this.y * WizardView.tileScale - dy,
		this.width * WizardView.tileScale,
		this.height * WizardView.tileScale
	);
};