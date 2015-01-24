function EntityBase(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;
	this.width = width;
	this.height = height;

	this.gravity = 0.015;
	this.onGround = false;

	this.facingLeft = false;

	this.alive = true;
	this.interacts = true;

	this.hitboxColor = '#3f3';
}

EntityBase.prototype = {

	update: function() {

	},

	render: function(layer, dx, dy) {
		if (this.hitboxColor)
			layer.fillStyle(this.hitboxColor).fillRect(
				this.x * WizardView.tileScale - dx,
				this.y * WizardView.tileScale - dy,
				this.width * WizardView.tileScale,
				this.height * WizardView.tileScale
			);
	},

	move: function(useLadders, useStairs, ignorePlatforms) {

		var ladder = useLadders && this.onLadder();

		if (!ladder)
			this.vy += this.gravity;

		this.onGround = false;

		//console.log('velocity: (' + this.vx + '; ' + this.vy + ')');

		if (this.vx < 0) {
			this.facingLeft = true;
			if (this.moveLeft(-this.vx, useStairs) < -this.vx)
				this.vx = 0;
		} else if (this.vx > 0) {
			this.facingLeft = false;
			if (this.moveRight(this.vx, useStairs) < this.vx)
				this.vx = 0;
		}

		if (this.vy < 0) {
			if (this.moveUp(-this.vy) < -this.vy)
				this.vy = 0;
		} else if (this.vy > 0) {
			if (this.moveDown(this.vy, useStairs, ignorePlatforms) < this.vy) {
				this.vy = 0;
				this.onGround = true;
			}
		}
	},

	moveDown: function(dist, useStairs, ignorePlatforms) {
		var left = Math.floor(this.x);
		var right = Math.ceil(this.x + this.width);
		var bottom = Math.floor(this.y + this.height - 0.01) + 1;
		var nbottom = Math.ceil(this.y + this.height + dist);
		var collision;
		for (var y = bottom; y < nbottom; y++)
			for (var x = left; x < right; x++) {
				collision = WizardGame.worldTile(x, y);
				if ((collision & 1) || (!ignorePlatforms && (collision & 2))) {
					//console.log('Collided with (' + x + '; ' + y + '), collision: ' + collision);
					dist = y - this.y - this.height;
					//object.pos.y = y - object.size.y;
					y = nbottom;
					break;
				}
			}

		this.y += dist;
		return dist;
	},

	moveUp: function(dist) {
		var left = Math.floor(this.x);
		var right = Math.ceil(this.x + this.width);
		var top = Math.floor(this.y + 0.01) - 1;
		var ntop = Math.floor(this.y - dist);
		var collision;
		for (var y = top; y >= ntop; y--)
			for (var x = left; x < right; x++) {
				collision = WizardGame.worldTile(x, y);
				if (collision & 1) {
					dist = this.y - y - 1;
					y = ntop - 1;
					break;
				}
			}

		this.y -= dist;
		return dist;
	},

	moveLeft: function(dist, useStairs) {
		var top = Math.floor(this.y);
		var bottom = Math.ceil(this.y + this.height);
		var left = Math.floor(this.x + 0.01) - 1;
		var nleft = Math.floor(this.x - dist);
		var collision;
		for (var x = left; x >= nleft; x--)
			for (var y = top; y < bottom; y++) {
				collision = WizardGame.worldTile(x, y);
				if (collision & 1) {
					dist = this.x - x - 1;
					x = nleft - 1;
					break;
				}
			}

		this.x -= dist;
		return dist;
	},

	moveRight: function(dist, useStairs) {
		var top = Math.floor(this.y);
		var bottom = Math.ceil(this.y + this.height);
		var right = Math.floor(this.x + this.width - 0.01) + 1;
		var nright = Math.ceil(this.x + this.width + dist);
		var collision;
		for (var x = right; x < nright; x++)
			for (var y = top; y < bottom; y++) {
				collision = WizardGame.worldTile(x, y);
				if (collision & 1) {
					dist = x - this.x - this.width;
					x = nright;
					break;
				}
			}

		this.x += dist;
		return dist;
	},

	onLadder: function() {
		var x = Math.floor(this.x + this.width / 2);
		var y1 = Math.floor(this.y);
		var y2 = Math.ceil(this.y + this.height);
		for (var y = y1; y < y2; y++) 
			if (WizardGame.worldTile(x, y) & 4) 
				return true;
		return false;
	},

	intersects: function(other) {
		return this.x + this.width >= other.x && other.x + other.width >= this.x &&
			this.y + this.height >= other.y && other.y + other.height >= this.y;
	},

	kill: function() {
		this.alive = false;
	}

};