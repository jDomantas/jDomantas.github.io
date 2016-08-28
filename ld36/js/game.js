'use strict';

function Game(screen) {
	this.screen = screen;
	this.map = new GameMap(screen.width, screen.height);
	
	this.currentLevel = 0;
	this.weapon = null;
	this.loadLevel(this.currentLevel);
	window.gameMap = this.map;
	this.canDoTurn = true;
	
	var self = this;	
	window.restartLevel = function() { self.loadLevel(self.currentLevel); };
}

Game.prototype.play = function() {
	this.map.draw(this.screen);
	
	var self = this;
	function inputHandler(e) {
		var key = e.which || e.keyCode;
		if (key >= 10 && key <= 90) {
			self.input(key);
			if (e.preventDefault) e.preventDefault();
		}
	}
	
	if (window.$) 
		$(document).keydown(inputHandler);
	else 
		document.attachEvent('onkeydown', inputHandler);
}

Game.prototype.input = function(key) {
	if (key == 82) {
		restartLevel();
		return;
	}
	
	if (this.canDoTurn) {	
		if (key == 37) this.movePlayer(-1, 0);
		else if (key == 38) this.movePlayer(0, -1);
		else if (key == 39) this.movePlayer(1, 0);
		else if (key == 40) this.movePlayer(0, 1);
		else if (key == 65) this.movePlayer(-1, 0);
		else if (key == 87) this.movePlayer(0, -1);
		else if (key == 68) this.movePlayer(1, 0);
		else if (key == 83) this.movePlayer(0, 1);
		else console.log(key);
	}
}

Game.prototype.movePlayer = function(dx, dy) {
	if (this.map.player.weapon && this.map.player.weapon(this.map, dx, dy)) {
		this.doGameTick();
	} else if (this.map.canPass(this.map.player.x + dx, this.map.player.y + dy)) {
		this.map.player.x += dx;
		this.map.player.y += dy;
		this.doGameTick();
	} else {
		var obj = this.map.getObject(this.map.player.x + dx, this.map.player.y + dy);
		if (obj && obj.interact && obj.interact(this.map, this.map.player)) {
			this.doGameTick();
		}
	}
}

Game.prototype.playerAction = function(dx, dy) {
	var x = this.map.player.x + dx * 5;
	var y = this.map.player.y + dy * 5;
	if (this.map.canPass(x, y)) {
		this.map.objects.push(Particle(x, y, '#FF0', '--\\\\||//--\\\\||//--\\\\||//'));
		this.doGameTick();
	}
}

Game.prototype.doGameTick = function() {
	this.canDoTurn = false;
	
	this.map.findPaths();
	this.map.tick();
	this.map.updateVisibles();
	this.map.draw(this.screen);
	
	var self = this;
	
	function preAiVisuals() {
		if (self.map.anyPendingVisuals()) {
			setTimeout(function() {
				self.map.visualTick();
				self.map.draw(self.screen);
				preAiVisuals();
			}, 15);
		} else if (self.map.anyPendingAi()) {
			//setTimeout(function() {
				self.map.aiTick();
				self.map.draw(self.screen);
				postAiVisuals();
			//}, 400);
		} else {
			self.onTickEnd();
		}
	}
	
	function postAiVisuals() {
		if (self.map.anyPendingVisuals()) {
			setTimeout(function() {
				self.map.visualTick();
				self.map.draw(self.screen);
				postAiVisuals();
			}, 15);
		} else {
			self.onTickEnd();
		}
	}
	
	preAiVisuals();
}

Game.prototype.onTickEnd = function() {
	if (this.map.player != null) {
		this.canDoTurn = true;
		
		var standsOn = this.map.tiles[this.map.player.x][this.map.player.y];
		
		if (standsOn.ch == '>') { // stairs down
			this.currentLevel += 1;
			this.loadLevel(this.currentLevel);
		}
	}
}

Game.prototype.loadLevel = function(level) {
	if (this.map.player != null)
		this.weapon = this.map.player.weapon;
	
	window.loadLevel(this.map, level);
	this.map.player.weapon = this.weapon;
	this.map.draw(this.screen);
	
	this.canDoTurn = true;
}