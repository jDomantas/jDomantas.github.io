(function() {

	var width = 24;
	var height = 18;
	var tileScale = 32;

	function View(x, y) {
		this.x = x;
		this.y = y;
		this.layer = cq(width * 8, height * 8);
		this.collisions = new Array(width * height);
		this.objects = [];
	}

	View.width = width;
	View.height = height;
	View.tileScale = tileScale;
	View.totalWidth = width * tileScale;
	View.totalHeight = height * tileScale;

	var colorToType = {
		0x000000: { tex: 1, collision: 1 }, // wall
		0xffffff: { tex: 0, collision: 0 }, // bg
		0xc3c3c3: { tex: 2, collision: 4 }, // ladder without plaform
		0x7f7f7f: { tex: 3, collision: 6 }, // ladder with platform
		0xed1c24: { tex: 4, collision: 2 }  // platform
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
					if (typeof colorToType[type] === 'undefined') console.log('Unknown color: ' + type);

					WizardGame.collisions
						[this.x * View.width + x]
						[this.y * View.height + y] = 
						colorToType[type].collision; // set collision type

					this.layer.drawImage(
						WizardGame.images.tileset, 
						colorToType[type].tex * 8, 0, 8, 8, 
						x * 8, y * 8, 8, 8);
				}
			}
		},

		render: function(layer, x, y) {
			layer.drawImage(this.layer.canvas, x, y, View.totalWidth, View.totalHeight);
			// also render dynamic tiles and entities
		}
	};

	window.WizardView = View;

})();