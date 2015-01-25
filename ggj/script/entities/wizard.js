function EntityWizard(x, y) {
	EntityBase.call(this, x + 0.25, y + 0.25, 0.5, 0.75);

	this.usingLadder = false;
	this.nextJump = false;

	this.hitboxColor = '#338';

	var createSpell = function(key, action, cd, icon) {
		return {
			has: false,
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
	this.coopTimer = 0;

	this.spells = [];
	this.spells.push(createSpell('z', 'shootFireball', 90, 0));
	this.spells.push(createSpell('x', 'dash', 150, 1));
	this.spells.push(createSpell('c', 'activateZhonya', 180, 2));
	this.spells.push(createSpell('v', 'cooperate', 500, 3));

	this.coop = {
		startState: null,
		inputs: []
	};

	this.walkDist = 0;
	this.animationTime = 0;
	this.fireballCastAnimation = 0;

	this.reflectsFireball = false;
	this.collectsSpells = true;
	this.player = true;
	this.timeDead = 0;
}

EntityWizard.prototype = Object.create(EntityBase.prototype);
EntityWizard.prototype.constructor = EntityWizard;

EntityWizard.prototype.update = function() {
	var input = this.input();

	if (!this.alive) {
		this.timeDead++;
		input.up = 
		input.down = 
		input.left = 
		input.right = 
		input.jump = false;
		input.spells = [];
		this.nextJump = false;
	}
	else
		this.timeDead = 0;

	var speed = 0.07;
	var jumpPower = 0.22;
	var ladderHorizontalFactor = 0.2;

	this.animationTime++;

	if (this.fireballCastAnimation > 0)
		this.fireballCastAnimation--;

	this.reflectsFireball = (this.zhonyaTimer > 0);

	if (this.coopTimer > 0) {
		var scheduledSpells = [];
		for (var i = 0; i < this.spells.length; i++)
			scheduledSpells.push(this.spells[i].scheduled);
		this.coop.inputs.push({ input: input, jump: this.nextJump, spells: scheduledSpells });
		this.coopTimer--;
		if (this.coopTimer === 0) {
			//console.log(JSON.stringify(this.coop.startState.obj));
			if (StateGame.currentView().x === this.coop.startState.x &&
				StateGame.currentView().y === this.coop.startState.y) {
				StateGame.currentView().objects = this.coop.startState.obj;
				//console.log(JSON.stringify(StateGame.currentView().objects));
				StateGame.currentView().objects.push(new EntityWizardClone(this.coop.startState.self, this.coop.inputs));
			
				//console.log(JSON.stringify(StateGame.currentView().objects));
			}

			this.coop.startState = null;
			this.coop.inputs = [];
		}
	}

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

			this.walkDist += Math.abs(this.vy);

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

			if (this.vx === 0) this.walkDist = 0;
			else this.walkDist += Math.abs(this.vx);

			this.move(false, false, input.down && this.onGround);
		}

		this.nextJump = this.nextFall = false;

		for (var i = this.spells.length; i--; ) {
			if (this.spells[i].cdleft > 0)
				this.spells[i].cdleft--;
			if (this.spells[i].scheduled) {
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
};

EntityWizard.prototype.keyPress = function(event) {
	if (event.key === 'w' || event.key === 'up') this.nextJump = true;
	else if (event.key === 's' || event.key === 'down') this.nextFall = true;
	else {
		for (var i = this.spells.length; i--; )
			if (event.key === this.spells[i].key) {
				if (this.spells[i].cdleft < 1 && this.spells[i].has)
					this.spells[i].scheduled = true;
				break;
			}
	}
};

EntityWizard.prototype.shootFireball = function() {
	if (!this.onGround) return false;
	var x = this.x + this.width / 2;
	var y = this.y + this.height / 2;
	this.fireballCastAnimation = 18;
	StateGame.currentView().objects.push(new EntityFireball(x, y, this.facingLeft ? -1 : 1));
	return true;
};

EntityWizard.prototype.dash = function() {
	if (!this.onGround) return false;
	this.vx = 0.5;
	if (this.facingLeft)
		this.vx = -0.5;
	return true;
};

EntityWizard.prototype.activateReflection = function() {
	if (!this.onGround || this.usingLadder) return false;
	this.reflectTimer = 40;
	return true;
};

EntityWizard.prototype.activateZhonya = function() {
	if (!this.onGround || this.usingLadder) return false;
	this.zhonyaTimer = 120;
	return true;
};

EntityWizard.prototype.cooperate = function() {
	if (!this.onGround || this.usingLadder) return false;
	this.coopTimer = 240;
	this.coop.startState = null;
	this.coop.input = [];
	var objs = [];
	var list = StateGame.currentView().objects;
	for (var i = 0; i < list.length; i++) {
		var copy = Object.create(Object.getPrototypeOf(list[i]));
		for (var key in list[i])
			if ((typeof list[i][key] === 'number') ||
				(typeof list[i][key] === 'string') ||
				(typeof list[i][key] === 'boolean'))
				copy[key] = list[i][key];
		objs.push(copy);
	}
	var selfStart = {};
	for (var key in this) {
		if ((typeof this[key] === 'number') ||
			(typeof this[key] === 'string') ||
			(typeof this[key] === 'boolean'))
			selfStart[key] = this[key];
	}
	selfStart.alive = true;
	this.coop.startState = { obj: objs, x: StateGame.currentView().x, y: StateGame.currentView().y, self: selfStart };

	//console.log(JSON.stringify(this.coop.startState.obj));
	return true;
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
};

EntityWizard.prototype.render = function(layer, dx, dy) {

	if(this.timeDead > 0) {

		var x = this.x * WizardView.tileScale - dx;
		var y = this.y * WizardView.tileScale - dy;
		var width = 0.75 * WizardView.tileScale;
		var height = this.height * WizardView.tileScale;

		var frame = Math.min(2, Math.floor(this.timeDead / 20));
		if (this.facingLeft) frame = 2 - frame;

		layer.drawImage(WizardGame.images.deth,
			frame * 24, this.facingLeft ? 0 : 24, 24, 24,
			x, y + 1, width, height);

		return;
	} 

	var x = this.x * WizardView.tileScale - dx;
	var y = this.y * WizardView.tileScale - dy;
	var width = 0.75 * WizardView.tileScale;
	var height = this.height * WizardView.tileScale;

	var animation = 1;
	var frame = this.animationTime % 2;
	if (this.zhonyaTimer > 0) {
		animation = 4; // zhonya
		frame = 9;
	} else if (this.usingLadder) {
		animation = 3; // ladder animation
		frame = Math.floor(this.walkDist * 1.8) % 4;
	} else if (Math.abs(this.vx) > 0.15) {
		animation = 2; // dashing animation
		frame = Math.floor(this.walkDist * 7) % 4;
		//console.log('frame: ' + frame + ', dist: ' +this.walkDist);
	} else if (this.onGround) {
		if (this.walkDist === 0) { 
			animation = 1; frame = 0; 
			if (this.fireballCastAnimation > 0) {
				animation = 4;
				frame = Math.max(0, 2 - Math.floor((this.fireballCastAnimation - 1) / 6));
			}
		} //Math.floor(this.animationTime / 20) % 2; } // standing
		else { animation = 0; frame = Math.floor(this.walkDist * 2.4) % 10; } // walking
	} else if (this.vy < -0.1) {
		animation = 5;
	} else if (this.vy > 0.1) {
		animation = 7;
	} else {
		animation = 6;
	}

	//console.log(animation);

	if (this.facingLeft) frame = 9 - frame;

	layer.drawImage(this.facingLeft ? WizardGame.images.playerflip : WizardGame.images.player,
		frame * 24, animation * 24, 24, 24,
		x, y + 1, width, height);
};