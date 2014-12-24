function Item(x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.inputs = [];
	this.index = 0;
	this.removed = false;
	this.setting = type === 5 ? 5 : (type === 3 ? 0 : 1);
}

Item.prototype.updateInputs = function() {
	var inputs = [];
	for (var i = 0; i < this.inputs.length; i++) {
		if (!this.inputs[i].removed)
			inputs.push(this.inputs[i]);
	}
	this.inputs = inputs;
}

Item.prototype.addInput = function(other) {
	if (other === this)
		return;

	for (var i = 0; i < this.inputs.length; i++)
		if (other === this.inputs[i])
			return;

	// weighter (0) and tester (4) can't have inputs
	if (this.type === 1 || this.type === 3 || this.type === 5) { // inverter, setter and clock can have only one input
		this.inputs = [ other ];
	} else if (this.type === 2) { // counter can have infinite amount of inputs
		this.inputs.push(other);
	}
}

Item.prototype.draw = function() {
	app.screen.strokeStyle('#333333');
	app.screen.lineWidth(1);
	for (var i = 0; i < this.inputs.length; i++) {
		var dirx = this.inputs[i].x - this.x;
		var diry = this.inputs[i].y - this.y;
		if (dirx * dirx + diry * diry > 256) {
			var len = Math.sqrt(dirx * dirx + diry * diry);
			dirx = dirx / len * 8;
			diry = diry / len * 8;
			app.screen.beginPath();
			app.screen.moveTo(Math.floor(this.x + dirx) + 0.5, Math.floor(this.y + diry) + 0.5);
			app.screen.lineTo(Math.floor(this.inputs[i].x - dirx) + 0.5, Math.floor(this.inputs[i].y - diry) + 0.5);
			app.screen.stroke();
			app.screen.beginPath();
			app.screen.arc(this.inputs[i].x - dirx, this.inputs[i].y - diry, 3, 0, Math.PI * 2)
			app.screen.stroke();
		}
	}

	app.screen.drawFrame(app.images.logic, this.type, this.x - 8, this.y - 8);
}

Item.prototype.hasSettings = function() {
	return this.type === 0 || this.type === 2 || this.type === 3 || this.type === 5;
}

Item.prototype.drawSettings = function(x, y) {
	if (this.type === 0 || this.type === 2) {
		var text = '' + this.setting;
		for (var i = 0; i < text.length; i++) {
			index = Font.line.indexOf(text.charAt(i));
			if (index >= 0) {
				app.screen.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), y);
				x += Font.widths[index] + 1;
			}
		}
		
	} else if (this.type === 3) {
		app.screen.drawFrame(app.images.tiles, editorMenu.tiles[this.setting][1], x, y);		
	} else if (this.type === 5) {
		var text = '0.' + this.setting;
		if (this.setting === 10) text = '1.0';

		for (var i = 0; i < text.length; i++) {
			index = Font.line.indexOf(text.charAt(i));
			if (index >= 0) {
				app.screen.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), y);
				x += Font.widths[index] + 1;
			}
		}	
	}
}

Item.prototype.modifySetting = function(delta) {
	if (this.type === 0 || this.type === 2) {
		this.setting = Math.max(0, this.setting + delta);
	} else if (this.type === 3) {
		this.setting = this.setting + delta;
		while (this.setting < 0) this.setting += editorMenu.tiles.length;
		while (this.setting >= editorMenu.tiles.length) this.setting -= editorMenu.tiles.length;
	} else if (this.type === 5) {
		this.setting = Math.min(10, Math.max(1, this.setting + delta));
	}
}

Item.prototype.getInputs = function() {
	var inputs = new Array(this.inputs.length);
	for (var i = 0; i < inputs.length; i++)
		inputs[i] = this.inputs[i].index;
	return inputs;
}

Item.prototype.compile = function(game) {
	var x = Math.floor((this.x - game.offset.x) / app.scale);
	var y = Math.floor((this.y - game.offset.y) / app.scale);
	if (this.type === 0) {
		return {
			x: x,
			y: y,
			s: this.setting,
			type: 0
		}
	} else if (this.type === 1) {
		return {
			inputs: this.getInputs(),
			type: 1
		}
	} else if (this.type === 2) {
		return {
			inputs: this.getInputs(),
			type: 2,
			s: this.setting
		}
	} else if (this.type === 3) {
		return {
			inputs: this.getInputs(),
			type: 3,
			x: x,
			y: y,
			t2: game.tiles[x][y].type,
			t1: editorMenu.tiles[this.setting][0]
		}
	} else if (this.type === 4) {
		return {
			x: x,
			y: y,
			type: 4
		}
	} else if (this.type === 5) {
		return {
			inputs: this.getInputs(),
			s: this.setting * 6,
			type: 5
		}
	}
}
