function Player(world, width, height) {
	this.width = width || 0.8;
	this.height = height || 0.8;
	this.x = 0;
	this.y = 0;
	this.speedx = 0;
	this.speedy = 0;
	this.moveSpeed = 0.09;
	this.jumpPower = 0.3;
	this.holds = world.tileTypes.air;
	this.ticksMoving = 0;
	this.left = false;
	this.grounded = false;
	this.oldAction = false;
	this.cursor = { x: -1, y: -1 };
}

Player.prototype = {
	moveTo: function(x, y) {
		this.x = x;
		this.y = y;
	},
	
	update: function(game, world, delta) {
		
		if (this.y > world.width) this.y = -this.height;
		this.speedx = 0;
		this.speedy = (this.speedy + 0.015) * 0.97;
		if ((game.keyboard.keys['w'] || game.keyboard.keys['up']) && this.grounded) { 
			this.speedy -= this.jumpPower;
			game.playSound('jump');
		}
		if (game.keyboard.keys['a'] || game.keyboard.keys['left']) this.speedx -= this.moveSpeed;
		if (game.keyboard.keys['d'] || game.keyboard.keys['right']) this.speedx += this.moveSpeed;
		
		if (this.speedx == 0) this.ticksMoving = 0;
		else this.ticksMoving++;
		
		if (this.speedx > 0) { this.left = false; world.moveRight(this, this.speedx); }
		if (this.speedx < 0) { this.left = true; world.moveLeft(this, -this.speedx); }
		if (this.speedy > 0) {
			var landspeed = this.speedy;
			this.grounded = world.moveDown(this, this.speedy);
			if (this.grounded && landspeed > 0.15) {
				game.playSound('land');
			}
		}
		if (this.speedy < 0) { this.grounded = false; world.moveUp(this, -this.speedy); }
		
		this.cursor = { x: Math.floor(this.x + this.width / 2), y: Math.floor(this.y + this.height / 2) };
		if (this.left) this.cursor.x--;
		else this.cursor.x++;
		if (this.holds.solid) {
			var type = 0;
			if (world.solid(this.cursor.x, this.cursor.y - 1)) type += 4;
			if (world.solid(this.cursor.x, this.cursor.y)) type += 2;
			if (world.solid(this.cursor.x, this.cursor.y + 1)) type += 1;
			if (type == 0 || type == 4) this.cursor.y++;
			if (type == 2 || type == 3) this.cursor.y--;
			if (type > 5) this.cursor = { x: -1, y: -1 };
		} else {
			if (!world.solid(this.cursor.x, this.cursor.y)) {
				this.cursor.y++;
				if (!world.solid(this.cursor.x, this.cursor.y)) {
					this.cursor.y -= 2;
					if (!world.solid(this.cursor.x, this.cursor.y))
						this.cursor = { x: -1, y: -1 };
				}
			}
		}
		if (this.cursor.x < 0 || this.cursor.y < 0 || this.cursor.x >= world.width || this.cursor.y >= world.height)
			this.cursor = { x: -1, y: -1 };
		
		if (game.keyboard.keys['space'] && !this.oldAction) {
			if (this.cursor.x != -1) {
				if (this.holds.solid) { // place
					world.setTile(this.cursor.x, this.cursor.y, this.holds);
					this.holds = { solid: false, image: undefined };
					game.playSound('hurt');
				} else { // pickup
					this.holds = world.getTile(this.cursor.x, this.cursor.y);
					world.setTile(this.cursor.x, this.cursor.y, world.tileTypes.air);
					game.playSound('hurt');
				}
			}
		}
		this.oldAction = game.keyboard.keys['space'];
	},
	
	draw: function(game, world, delta) {
		
		//console.log('drawing player at ' + this.x * game.viewScale + ', ' + this.y * game.viewScale);
		//game.screen.fillStyle('#00F').fillRect((this.x * game.viewScale) | 0, (this.y * game.viewScale) | 0, 
		//this.width * game.viewScale, this.height * game.viewScale);
		
		var frame = 0;
		if (this.ticksMoving > 0) frame = 2 + (Math.floor(this.ticksMoving / 8)) % 4;
		if (!this.grounded) frame = 1;
		if (typeof this.holds.image !== 'undefined') frame += 6;
		if (this.left) frame += 12;
		
		game.screen.drawFrame(game.images.player, frame, 
			Math.round(this.x * game.viewScale) + game.offset.x - 2, 
			Math.round(this.y * game.viewScale) + game.offset.y);
		
		if (this.cursor.x != -1)
			game.screen.drawFrame(game.images.cursor, (this.holds.solid ? 1 : 0),
				Math.round(this.cursor.x * game.viewScale) + game.offset.x, 
				Math.round(this.cursor.y * game.viewScale) + game.offset.y);
				
		if (typeof this.holds.image !== 'undefined') {
			game.screen.drawFrame(game.images.walls, this.holds.image,
				Math.round((this.x + this.width / 2 - 0.5) * game.viewScale) + game.offset.x, 
				Math.round((this.y - 1) * game.viewScale) + game.offset.y);
		}
		
	}
}
