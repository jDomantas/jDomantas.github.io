function EntityWizard(x, y) {
	EntityBase.call(this, x, y, 0.75, 0.75);

	this.usingLadder = false;
	this.nextJump = false;

	this.hitboxColor = '#338';

	var createSpell = function(key, action, cd, icon) {
		return {
			has: true,
			key: key,
			action: action,
			scheduled: false,
			cooldown: cd,
			cdleft: 0,
			icon: icon
		};
	};

	this.reflectTimer = 0;
	this.zhonyaTimer = 0;

	this.spells = [];
	this.spells.push(createSpell('z', 'shootFireball', 90, 0));
	this.spells.push(createSpell('x', 'dash', 150, 1));
	this.spells.push(createSpell('c', 'activateReflection', 120, 2));
	this.spells.push(createSpell('v', 'activateZhonya', 180, 3));
}

EntityWizard.prototype = Object.create(EntityBase.prototype);
EntityWizard.prototype.constructor = EntityWizard;

EntityWizard.prototype.update = function() {
	var input = this.input();

	var speed = 0.1;
	var jumpPower = 0.27;
	var ladderHorizontalFactor = 0.2;

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
				var tx = Math.floor(this.x + this.width / 2) + 0.5 - this.width / 2;
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
				if (this.nextJump && this.onGround) this.vy = -jumpPower;
			} else {
				this.vx *= 0.95;
			}

			this.move(false, false, input.down && this.onGround);
		}

		this.nextJump = this.nextFall = false;

		for (var i = this.spells.length; i--; ) {
			if (this.spells[i].cdleft > 0)
				this.spells[i].cdleft--;
			if (this.spells[i].scheduled) {
				if (this.reflectTimer === 0) {
					this[this.spells[i].action]();
					this.spells[i].cdleft = this.spells[i].cooldown;
				}
				this.spells[i].scheduled = false;
			}
		}
	} else
		this.zhonyaTimer--;

	if (this.reflectTimer > 0)
		this.reflectTimer--;

	this.hitboxColor = this.zhonyaTimer > 0 ? '#ff3' : '#338';
};

EntityWizard.prototype.keyPress = function(event) {
	if (event.key === 'w' || event.key === 'up') this.nextJump = true;
	else if (event.key === 's' || event.key === 'down') this.nextFall = true;
	else {
		for (var i = this.spells.length; i--; )
			if (event.key === this.spells[i].key) {
				if (this.spells[i].cdleft < 1)
					this.spells[i].scheduled = true;
				break;
			}
	}
};

EntityWizard.prototype.shootFireball = function() {
	if (!this.onGround) return;
	var x = this.x + this.width / 2;
	var y = this.y + this.height / 2;
	StateGame.currentView().objects.push(new EntityFireball(x, y, this.facingLeft ? -1 : 1));
};

EntityWizard.prototype.dash = function() {
	if (!this.onGround) return;
	this.vx = 0.5;
	if (this.facingLeft)
		this.vx = -0.5;
};

EntityWizard.prototype.activateReflection = function() {
	if (!this.onGround || this.usingLadder) return;
	this.reflectTimer = 40;
};

EntityWizard.prototype.activateZhonya = function() {
	if (!this.onGround || this.usingLadder) return;
	this.zhonyaTimer = 90;
};

EntityWizard.prototype.input = function() {
	var keys = WizardGame.keyboard.keys;
	return {
		left: keys['a'] || keys['left'],
		right: keys['d'] || keys['right'],
		up: keys['w'] || keys['up'],
		down: keys['s'] || keys['down'],
		jump: this.nextJump,
		spells: ((function(player) {
			var k = [];
			for (var i = 0; i < player.spells.length; i++)
				k.push(player.spells[i].scheduled);
			return k;
		})(this))
	};
}