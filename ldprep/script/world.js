function World(width, height) {
	this.width = width;
	this.height = height;
	
	this.walls = new Array(width);
	
	this.tileTypes = {
		air: { solid: false, image: undefined },
		grass: { solid: true, image: 0 },
		dirt: { solid: true, image: 1 },
		stone: { solid: true, image: 2 },
		wood: { solid: true, image: 3 },
		leaves: { solid: true, image: 4 },		
	}
	
	for (var i = width; i--; ) {
		this.walls[i] = new Array(height);
		for (var j = height; j--; )
			this.walls[i][j] = this.tileTypes.air;
	}
		
	this.entities = [];
	this.entities.push(this.player = new Player(this, 0.4, 0.8));
	this.player.moveTo(9.3, 5.16);
}

World.prototype = {
	solid: function(x, y) {
		return this.getTile(x, y).solid;
	},
	moveDown: function(obj, dist) {
		var left = Math.floor(obj.x);
		var right = Math.ceil(obj.x + obj.width);
		var bottom = Math.ceil(obj.y + obj.height);
		var nbottom = Math.ceil(obj.y + obj.height + dist);
		for (var y = bottom; y < nbottom; y++) {
			for (var x = left; x < right; x++) {
				if (this.solid(x, y)) {
					obj.y = y - obj.height;
					obj.speedy = 0;
					return true;
				}
			}
		}
		obj.y += dist;
		return false;
	},
	moveLeft: function(obj, dist) {
		var top = Math.floor(obj.y);
		var bottom = Math.ceil(obj.y + obj.height);
		var left = Math.floor(obj.x);
		var nleft = Math.floor(obj.x - dist);
		for (var x = left - 1; x >= nleft; x--) {
			for (var y = top; y < bottom; y++) {
				if (this.solid(x, y)) {
					obj.x = x + 1;
					obj.speedx = 0;
					return true;
				}
			}
		}
		obj.x -= dist;
		return false;
	},
	moveUp: function(obj, dist) {
		var left = Math.floor(obj.x);
		var right = Math.ceil(obj.x + obj.width);
		var top = Math.floor(obj.y);
		var ntop = Math.floor(obj.y - dist);
		for (var y = top - 1; y >= ntop; y--) {
			for (var x = left; x < right; x++) {
				if (this.solid(x, y)) {
					obj.y = y + 1;
					obj.speedy = 0;
					return true;
				}
			}
		}
		obj.y -= dist;
		return false;
	},
	moveRight: function(obj, dist) {
		var top = Math.floor(obj.y);
		var bottom = Math.ceil(obj.y + obj.height);
		var right = Math.ceil(obj.x + obj.width);
		var nright = Math.ceil(obj.x + obj.width + dist);
		for (var x = right; x < nright; x++) {
			for (var y = top; y < bottom; y++) {
				if (this.solid(x, y)) {
					obj.x = x - obj.width;
					obj.speedx = 0;
					return true;
				}
			}
		}
		obj.x += dist;
		return false;
	},
	
	setTile: function(x, y, type) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height)
			return;
		this.walls[x][y] = type;
	},
	
	getTile: function(x, y) {
		if (x < 0 || x >= this.width)
			return this.tileTypes.stone;
		if (y < 0 || y >= this.height)
			return this.tileTypes.air;
		return this.walls[x][y];
	},
	
	update: function(game, delta) {
		
		var toRemove = {};
		for (var e in Object.keys(this.entities)) {
			if (this.entities[e].update) {
				this.entities[e].update(game, this, delta);
			}
			if (this.entities[e].remove)
				toRemove[e] = true;
		}
		for (var e in toRemove)
			delete this.entities[e];		
	},
	
	draw: function(game, delta) {
		
		game.screen.clear('#4CA0CD');
		
		this.drawTiles(game, delta);
	
		for (var e in this.entities) {
			if (this.entities[e].draw) {
				this.entities[e].draw(game, this, delta);
			}
		}
	},
	
	drawTiles: function(game, delta) {
		var x = Math.floor(-game.offset.x / game.viewScale);
		var y = Math.floor(-game.offset.y / game.viewScale);
		if (x < 0) x = 0;
		if (y < 0) y = 0;
		var endx = x + game.width / game.viewScale + 1;
		if (endx > this.width) endx = this.width;
		var endy = y + game.height / game.viewScale + 1;
		if (endy > this.height) endy = this.height;
		
		for (var x = 0; x < this.width; x++)
			for (var y = 0; y < this.height; y++)
				if (typeof this.walls[x][y].image !== 'undefined') {
					game.screen.drawFrame(game.images.walls, this.walls[x][y].image,
						x * game.viewScale + game.offset.x, 
						y * game.viewScale + game.offset.y);
					//game.screen.fillRect(x * game.viewScale, y * game.viewScale, game.viewScale, game.viewScale);
				}
	}
}