'use strict';

function GameMap(width, height) {
	this.width = width;
	this.height = height;
	this.tiles = [];
	this.objects = [];
	
	this.player = null;
	
	for (var x = 0; x < width; x++) {
		var column = [];
		for (var y = 0; y < height; y++)
			column.push({ x: x, y: y, ch: '?', solid: false, color: '#2D2', visible: false, opaque: false, path: 10000000 });
		this.tiles.push(column);
	}
}

GameMap.prototype.canPass = function(x, y) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height || this.tiles[x][y].solid)
		return false;
	
	
	for (var i = this.objects.length - 1; i >= 0; i--)
		if (this.objects[i].x == x && this.objects[i].y == y && this.objects[i].blocks)
			return false;
		
	return true;
}

GameMap.prototype.softCanPass = function(x, y) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height || this.tiles[x][y].solid)
		return false;
	
	return true;
}

GameMap.prototype.tickObjects = function(fn) {
	var didAnything = false;
	var objectList = this.objects.slice();
	for (var i = objectList.length - 1; i >= 0; i--) {
		var obj = objectList[i];
		if (obj[fn]) {
			obj[fn](this);
			didAnything = true;
		}
	}
	return didAnything;
}

GameMap.prototype.aiTick = function() { return this.tickObjects('ai'); }
GameMap.prototype.visualTick = function() { this.tickObjects('visual'); }
GameMap.prototype.tick = function() { this.tickObjects('tick'); }

GameMap.prototype.draw = function(screen) {
	if (this.width != screen.width) throw "Map draw error: width doesn't match: " + this.width + ' and ' + screen.width;
	if (this.height != screen.height) throw "Map draw error: height doesn't match: " + this.height + ' and ' + screen.height;
	
	for (var x = 0; x < this.width; x++)
		for (var y = 0; y < this.height; y++)
			if (this.isVisible(x, y))
				screen.drawObj(this.tiles[x][y], 0);
			else
				screen.draw(x, y, '&nbsp', '#111', 0);
	
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].draw)
			this.objects[i].draw(this, screen);
		else if (this.isVisible(this.objects[i].x, this.objects[i].y))
			screen.drawObj(this.objects[i], 5);
	}
	
	screen.refresh();
}

GameMap.prototype.anyPendingVisuals = function() {
	for (var i = 0; i < this.objects.length; i++)
		if (this.objects[i].visual)
			return true;

	return false;
}

GameMap.prototype.anyPendingAi = function() {
	for (var i = 0; i < this.objects.length; i++)
		if (this.objects[i].ai)
			return true;

	return false;
}

GameMap.prototype.isVisible = function(x, y) {
	return x >= 0 && y >= 0 && x < this.width && y < this.height && this.tiles[x][y].visible;
}

GameMap.prototype.updateVisibles = function() {
	if (!this.player)
		return;
	
	var self = this;
	function fill(x, y) {
		for (var xx = x - 1; xx <= x + 1; xx++)
			for (var yy = y - 1; yy <= y + 1; yy++)
				if (xx >= 0 && yy >= 0 && xx < self.width && yy < self.height && !self.tiles[xx][yy].visible) {
					self.tiles[xx][yy].visible = true;
					if (!self.tiles[xx][yy].opaque)
						fill(xx, yy);
				}
	}
	
	fill(this.player.x, this.player.y);
}

GameMap.prototype.getObject = function(x, y) {
	for (var i = this.objects.length - 1; i >= 0; i--)
		if (this.objects[i].x == x && this.objects[i].y == y && this.objects[i].blocks)
			return this.objects[i];
	return null;
}

GameMap.prototype.kill = function(obj) {
	if (obj == null) return;
	
	var deathSpot = this.tiles[obj.x][obj.y];
	deathSpot.ch = '*';
	deathSpot.color = '#F00';
	
	this.remove(obj);
}

GameMap.prototype.remove = function(obj) {
	if (obj == null) return;
	
	var index = this.objects.indexOf(obj);
	this.objects.splice(index, 1);
	
	if (obj == this.player)
		this.player = null;
}

GameMap.prototype.getPath = function(x, y) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height)
		return 10000000;
	return this.tiles[x][y].path;
}

GameMap.prototype.findPaths = function() {
	for (var x = 0; x < this.width; x++)
		for (var y = 0; y < this.height; y++)
			this.tiles[x][y].path = 10000000;
		
	if (this.player == null)
		return;
	
	var queue = [];
	queue.push({ x: this.player.x, y: this.player.y });
	this.tiles[this.player.x][this.player.y].path = 0;
	
	var pos = 0;
	while (pos < queue.length) {
		var p = queue[pos++];
		var d = this.tiles[p.x][p.y].path + 1;
		if (this.tiles[p.x][p.y].opaque && d > 1) {
			this.tiles[p.x][p.y].path = 10000000;
			continue;
		}
		
		if (this.softCanPass(p.x - 1, p.y) && this.tiles[p.x - 1][p.y].path > d) {
			this.tiles[p.x - 1][p.y].path = d;
			queue.push({ x: p.x - 1, y: p.y });
		}
		if (this.softCanPass(p.x, p.y - 1) && this.tiles[p.x][p.y - 1].path > d) {
			this.tiles[p.x][p.y - 1].path = d;
			queue.push({ x: p.x, y: p.y - 1 });
		}
		if (this.softCanPass(p.x + 1, p.y) && this.tiles[p.x + 1][p.y].path > d) {
			this.tiles[p.x + 1][p.y].path = d;
			queue.push({ x: p.x + 1, y: p.y });
		}
		if (this.softCanPass(p.x, p.y + 1) && this.tiles[p.x][p.y + 1].path > d) {
			this.tiles[p.x][p.y + 1].path = d;
			queue.push({ x: p.x, y: p.y + 1 });
		}
	}
}

GameMap.prototype.canWander = function(x, y) {
	if (!this.canPass(x, y)) return false;
	if (this.tiles[x][y].opaque) return false;
	if (x > 0 && !this.tiles[x - 1][y].solid && this.tiles[x - 1][y].opaque) return false;
	if (y > 0 && !this.tiles[x][y - 1].solid && this.tiles[x][y - 1].opaque) return false;
	if (x < this.width - 1 && !this.tiles[x + 1][y].solid && this.tiles[x + 1][y].opaque) return false;
	if (y < this.height - 1 && !this.tiles[x][y + 1].solid && this.tiles[x][y + 1].opaque) return false;
	return true;
}

