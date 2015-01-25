(function() {

	var width = 15;
	var height = 10;
	var tileScale = 32;

	function View(x, y) {
		this.x = x;
		this.y = y;
		this.layer = cq(width * 32, height * 32);
		this.collisions = new Array(width * height);
		this.objects = [];
		this.buttons = [];
		this.doors = [];
	}

	View.width = width;
	View.height = height;
	View.tileScale = tileScale;
	View.totalWidth = width * tileScale;
	View.totalHeight = height * tileScale;

	var colorToType = {
		0x000000: { tex: [1], collision: 1 }, // wall
		0xffffff: { tex: [0], collision: 0 }, // bg
		0xc3c3c3: { tex: [3, 0], collision: 4 }, // ladder without plaform
		0x7f7f7f: { tex: [3, 4, 0], collision: 6 }, // ladder with platform
		0xed1c24: { tex: [4, 0], collision: 2 },  // platform
		0x880015: { tex: [2], collision: 1 }, // wall top
		0x0000ff: { tex: [5, 0], collision: 1, special: 'button' }, // button
		0x00ff00: { tex: [6, 0], collision: 1, special: 'door' }, // door
		0xff00ff: { tex: [0], collision: 0, special: 'enemy' }, // door
		0x7f007f: { tex: [0], collision: 0, special: 'enemy2' } // door
	};

	View.prototype = {

		load: function(map) {
			//this.layer.clear(map.getPixel(this.x, this.y));
			var mapData = map.getImageData(
				1 + this.x * (View.width + 1), 
				1 + this.y * (View.height + 1), 
				View.width, View.height);
			var dataArray = mapData.data;

			var type, pos, wallStart;

			for (var y = 0; y < View.height; y++) {
				for (var x = 0; x < View.width; x++) {
					pos = 4 * (x + y * View.width);
					type = dataArray[pos] * 65536 + dataArray[pos + 1] * 256 + dataArray[pos + 2];
					//var type = map.getPixel(1 + this.x * (View.width + 1) + x, 1 + this.y * (View.height + 1) + y).toHex();
					if (typeof colorToType[type] === 'undefined') 
						console.log('Unknown color: ' + type + ', at: ' + (pos / 4) + ', coords: (' + x + '; ' + y + ') at room (' + this.x + '; ' + this.y + ')');

					type = colorToType[type];

					WizardGame.collisions
						[this.x * View.width + x]
						[this.y * View.height + y] = 
						type.collision; // set collision type

					if (type.special === 'button') {
						this.buttons.push({
							x: x + this.x * View.width,
							y: y + this.y * View.height,
							pressed: false,
							permanent: false
						})
					} else if (type.special === 'door') {
						this.doors.push({
							x: x + this.x * View.width,
							y: y + this.y * View.height,
							animation: 0,
							inputs: [0]
						})
					} else if (type.special === 'enemy') {
						this.objects.push(new EntityEnemy(this.x * View.width + x + 0.5, this.y * View.height + y + 0.5, 1, true))
					} else if (type.special === 'enemy2') {
						this.objects.push(new EntityEnemy(this.x * View.width + x + 0.5, this.y * View.height + y + 0.5, 2, false))
					}

					type = type.tex;

					for (var i = type.length; i--; )
						this.layer.drawImage(
							WizardGame.images.tileset, 
							type[i] * 32, 0, 32, 32, 
							x * 32, y * 32, 32, 32);
				}
			}

			if (this.x === 3 && this.y === 1) this.buttons[0].permanent = true;
			if (this.x === 3 && this.y === 3) this.doors[1].inputs = [1];
			if (this.x === 1 && this.y === 0) this.objects.push(new EntitySpell(17, 4, 0));
			if (this.x === 3 && this.y === 2) this.objects.push(new EntitySpell(57, 27, 1));
			if (this.x === 3 && this.y === 3) this.objects.push(new EntitySpell(56, 32, 2));
			if (this.x === 1 && this.y === 3) this.objects.push(new EntitySpell(22, 35, 3));
			if (this.x === 1 && this.y === 2) this.objects.push(new EntitySpell(26, 21, 0));
			if (this.x === 1 && this.y === 2) this.objects.push(new EntitySpell(26, 21, 1));
			if (this.x === 1 && this.y === 2) this.objects.push(new EntitySpell(26, 21, 2));
			if (this.x === 1 && this.y === 2) this.objects.push(new EntitySpell(26, 21, 3));
			if (this.x === 1 && this.y === 1) this.doors[0].inputs = [0, 1];
		},

		render: function(layer, x, y) {
			layer.drawImage(this.layer.canvas, x, y, View.totalWidth, View.totalHeight);
			var xx, yy;
			for (var i = this.buttons.length; i--; ) {
				if (!this.buttons[i].pressed) {
					xx = x + (this.buttons[i].x - this.x * View.width) * View.tileScale;
					yy = y + (this.buttons[i].y - this.y * View.height - 1) * View.tileScale;
					// we need da buddon texture
					//console.log('drawing at ' + xx + '; ' + yy);
					layer.drawImage(WizardGame.images.tileset, 0, 32, 32, 64, xx, yy, View.tileScale, View.tileScale * 2);
					//layer.fillStyle('#fff').fillRect(xx, yy, View.tileScale, View.tileScale * 2);
				}
			}

			for (var i = this.doors.length; i--; ) {
				xx = x + (this.doors[i].x - this.x * View.width) * View.tileScale;
				yy = y + (this.doors[i].y - this.y * View.height) * View.tileScale;
				// we need da door texture
				var frame = Math.floor(this.doors[i].animation * 4);
				if (frame < 4) {
					layer.drawImage(WizardGame.images.tileset, 32 + frame * 32, 32, 32, 32, xx, yy, View.tileScale, View.tileScale);
				}
			}
		},

		updateIneractiveTiles: function() {
			// update buttons
			for (var i = this.buttons.length; i--; ) {
				this.buttons[i].pressed = this.buttons[i].pressed && this.buttons[i].permanent;
				this.forEntities(function (o) {
					if (o.x < this.buttons[i].x + 0.5 && o.x + o.width > this.buttons[i].x + 0.5 &&
						o.y < this.buttons[i].y && o.y + o.height >= this.buttons[i].y)
						this.buttons[i].pressed = true;
				});
			}

			for (var i = this.doors.length; i--; ) {
				var pressed = true;
				for (var j = 0; j < this.doors[i].inputs.length; j++)
					pressed = pressed && this.buttons[this.doors[i].inputs[j]].pressed;
				this.doors[i].open = pressed;
				WizardGame.collisions[this.doors[i].x][this.doors[i].y] = this.doors[i].animation > 0.5 ? 0 : 1;
				if (this.doors[i].open)
					this.doors[i].animation = Math.min(1, this.doors[i].animation + 0.03);
				else
					this.doors[i].animation = Math.max(0, this.doors[i].animation - 0.03);
			}
		},

		forEntities: function(callback) {
			for (var i = this.objects.length; i--; )
				if (this.objects[i].interacts)
					callback.call(this, this.objects[i]);
			if (WizardGame.player.interacts)
				callback.call(this, WizardGame.player);
		}
	};

	window.WizardView = View;

})();