function EventNode(data) {
	this.inputs = data.inputs || [];
	this.type = data.type;
	this.threshold = data.s - 0.5;
	this.tile1 = data.t1;
	this.tile2 = data.t2;
	this.activated = false;
	this.x = data.x;
	this.y = data.y;
	this.hasTile = (typeof this.x !== 'undefined') && (typeof this.y !== 'undefined');
	this.updated = false;

	if (this.type === 5) {
		this.threshold = data.s;
		this.pos = 0;
		this.data = new Array(61);
		for (var i = 0; i < this.data.length; i++)
			this.data[i] = false;
	}
}

EventNode.prototype = {

	updateInputs: function(list) {
		for (var i = 0; i < this.inputs.length; i++)
			this.inputs[i] = list[this.inputs[i]];
	},

	updateNode: function(game) {

		if (this.updated) return;
		this.updated = true;

		// update children before updating self
		for (var i = this.inputs.length - 1; i >= 0; i--) {
			if (this.inputs[i].updateNode)
				this.inputs[i].updateNode(game);
		}

		if (this.type === 0) { // weighter
			if (this.hasTile)
				this.activated = game.tiles[this.x][this.y].weight >= this.threshold;
		} else if (this.type === 1) { // inverter
			if (this.inputs.length > 0)
				this.activated = !this.inputs[0].activated;
			else
				this.activated = true;
		} else if (this.type === 2) { // counter
			var count = 0;
			for (var i = this.inputs.length - 1; i >= 0; i--) {
				if (this.inputs[i].activated)
					count++;
			}
			this.activated = count >= this.threshold;
		} else if (this.type === 3 && this.hasTile) { // setter
			this.activated = (this.inputs.length > 0 && this.inputs[0].activated);
			if (this.x >= 0 && this.y >= 0 && this.x < game.width && this.y < game.height) {
				if (this.activated)
					game.tiles[this.x][this.y].change(this.tile1);
				else
					game.tiles[this.x][this.y].change(this.tile2);
			}
		} else if (this.type === 4 && this.hasTile) { // checker
			if (this.x >= 0 && this.y >= 0 && this.x < game.width && this.y < game.height)
				this.activated = game.tiles[this.x][this.y].activated;
		} else if (this.type === 5) { // clock
			this.data[(this.pos + this.threshold) % this.data.length] = 
				(this.inputs.length > 0 && this.inputs[0].activated);
			this.activated = this.data[this.pos];
			this.pos = (this.pos + 1) % this.data.length;
		}
	}
}