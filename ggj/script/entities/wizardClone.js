function EntityWizardClone(data, inputs) {
	EntityWizard.call(this, 0, 0, 0.75, 0.75);

	for (var key in data)
		this[key] = data[key];

	this.inputQueue = inputs;
	this.queuePosition = 0;

	this.coopTimer = 0;

	for (var i = 0; i < this.spells.length; i++)
		this.spells[i].has = true;

	this.aliveOther = true;
}

EntityWizardClone.prototype = Object.create(EntityWizard.prototype);
EntityWizardClone.prototype.constructor = EntityWizardClone;

EntityWizardClone.prototype.update = function() {
	var input = this.inputQueue[this.queuePosition].input;
	this.nextJump = this.inputQueue[this.queuePosition].jump;
	for (var i = 0; i < this.spells.length; i++)
		this.spells[i].scheduled = this.inputQueue[this.queuePosition].spells[i];

	if (!this.aliveOther) {
		this.timeDead++;
		input.up = 
		input.down = 
		input.left = 
		input.right = 
		input.jump = false;
		input.spells = [];
		for (var i = 0; i < this.spells.length; i++)
			this.spells[i].scheduled = false;
	}
	else
		this.timeDead = 0;

	if (this.timeDead > 120)
		this.alive = false;
	
	if (!this.aliveOther)
		this.timeDead++;
	else
		this.timeDead = 0;

	var speed = 0.07;
	var jumpPower = 0.22;
	var ladderHorizontalFactor = 0.2;

	if (this.fireballCastAnimation > 0)
		this.fireballCastAnimation--;

	this.reflectsFireball = (this.zhonyaTimer > 0);

	if (this.zhonyaTimer === 0) {
		var canUseLadder = this.onLadder();

		if (canUseLadder && (input.up || input.down)) this.usingLadder = true;

		if (this.usingLadder) {
			this.vx = 0;
			speed *= 0.7;
			if (input.left) this.vx -= speed;
			if (input.right) this.vx += speed;
			if (!input.left &&
				!input.right &&
				(input.up || input.down)) {
				var tx = Math.floor(this.x + this.width / 2) + 0.4 - this.width / 2;
				if (Math.abs(tx - this.x) < speed * ladderHorizontalFactor) this.vx = tx - this.x;
				else if (this.x < tx) this.vx = speed * ladderHorizontalFactor;
				else this.vx = -speed * ladderHorizontalFactor;
			}

			this.vy = 0;
			if (input.up) this.vy -= speed;
			if (input.down) this.vy += speed;

			this.move(true, false, true);

			this.usingLadder = this.onLadder();

			if ((input.down) && this.vy === 0)
				this.usingLadder = false;
		} else {

			if (Math.abs(this.vx) <= speed * 1.5) {
				this.vx = 0;
				if (input.left) this.vx -= speed;
				if (input.right) this.vx += speed;
				if (this.nextJump && this.onGround)
				{ 
					this.vy = -jumpPower;
					//WizardGame.sound.play('Jump');
				}
			} else {
				this.vx *= 0.95;
			}

			this.move(false, false, input.down && this.onGround);
		}

		this.nextJump = this.nextFall = false;

		for (var i = this.spells.length; i--; ) {
			if (this.spells[i].cdleft > 0)
				this.spells[i].cdleft--;
			if (this.spells[i].scheduled && this.spells[i].action !== 'cooperate') {
				if (this.reflectTimer === 0) {
					if (this[this.spells[i].action]())
						this.spells[i].cdleft = this.spells[i].cooldown;
				}
				this.spells[i].scheduled = false;
			}
		}
	} else
		this.zhonyaTimer--;

	this.interacts = (this.zhonyaTimer === 0);

	if (this.reflectTimer > 0)
		this.reflectTimer--;

	this.hitboxColor = this.zhonyaTimer > 0 ? '#ff3' : '#338';

	this.queuePosition++;
	if (this.queuePosition >= this.inputQueue.length)
		this.kill();
};

EntityWizardClone.prototype.kill = function() {
	this.aliveOther = false;
}