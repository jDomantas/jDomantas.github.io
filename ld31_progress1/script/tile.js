function Tile (x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.target = null;
	this.changeProgress = 0;
	this.activated = null;
	this.pressed = false;
	this.crate = null;
}

Tile.prototype.change = function(type, delay) {
	delay = delay || 0;
	//console.log('set to ' + type + ', delay: ' + delay);
	if (this.target === null) {
		if (this.type !== type) {
			if (this.type !== 'floor' && type !== 'floor')
				this.target = { type: 'floor', delay: delay, next: { type: type, next: null } };
			else
				this.target = { type: type, next: null, delay: delay };
			this.changeProgress = 0;
		}
	} else {
		// add to the end of linked list
		var t = this.target;
		while (t.next !== null)
			t = t.next;
		if (t.type !== type) {
			if (t.type !== 'floor' && type !== 'floor')
				t.next = { type: 'floor', delay: delay, next: { type: type, next: null } };
			else
				t.next = { type: type, next: null, delay: delay };
		}
	}
}

Tile.prototype.update = function(app, game) {
	if (this.target !== null) {
		if (this.target.delay > 0) this.target.delay -= 1 / 60;
		else this.changeProgress += 0.5;
		if (this.changeProgress >= 8) {
			this.type = this.target.type;
			this.changeProgress = 0;
			this.target = this.target.next;
		}
	}

	var s = false;
	for (var i = game.objects.length - 1; i >= 0; i--) {
		if (game.objects[i].pos.x + game.objects[i].size.x / 2 >= this.x &&
			game.objects[i].pos.x + game.objects[i].size.x / 2 < this.x + 1 &&
			game.objects[i].pos.y + game.objects[i].size.y / 2 >= this.y &&
			game.objects[i].pos.y + game.objects[i].size.y / 2 < this.y + 1) {
			s = true;
			break;
		}
	};
	if (s !== this.pressed) {
		this.pressed = s;
		if (this.type == 'button') {
			if (this.pressed)
				app.playSound('press');
			else
				app.playSound('release');
		}
		if (this.activated)
			this.activated(game, this);
	}

	if (this.type === 'dispenser' && (this.crate === null || !this.crate.alive)) {
		if (this.crate == null) game.objects.push(this.crate = new Crate(this.x, this.y));
		this.crate.pos.x = this.x + 0.5 - this.crate.size.x / 2;
		this.crate.pos.y = this.y + 0.5 - this.crate.size.y / 2;
		this.crate.alive = true;
	}
}

Tile.prototype.draw = function(app, game) {
	app.screen.drawFrame(app.images.tiles, this.frame(), this.x * app.scale + game.offset.x, this.y * app.scale + game.offset.y - 8);
}

Tile.prototype.frame = function() {
	if (this.target === null || this.target.type === this.type || this.target.delay > 0) {
		if (this.type === 'wall') return 0;
		if (this.type === 'floor') return 1;
		if (this.type === 'pit') return 2;
		if (this.type === 'block') return 3;
		if (this.type === 'target') return 4;
		if (this.type === 'dispenser') return 5;
		if (this.type === 'button') return 6;
	} else {
		var other = this.target.type;
		var animation = 0;
		var frame = (this.changeProgress | 0);
		if (this.type !== 'floor')  { other = this.type; frame = 7 - frame; }
		if (other === 'wall') animation = 1;
		if (other === 'block') animation = 2;
		if (other === 'target') animation = 3;
		if (other === 'dispenser') animation = 4;
		if (other === 'button') animation = 5;
		if (other === 'pit') animation = 6;
		return animation * 8 + frame;
	}
}

Tile.prototype.height = function() {
	return (this.type === 'pit' ? -1000 : 0);
}

Tile.prototype.passable = function(object) {
	switch (this.type) {
		case 'pit': return true;
		case 'wall': return false;
		default: return object.pos.z >= -0.01;
	}
}

// if ray can pass trough tile
Tile.prototype.ray = function(device) {
	switch (this.type) {
		case 'wall': return false;
		case 'block': return !device; // weapon doesn't work trough 'block' tile
		default: return true;
	}
}
