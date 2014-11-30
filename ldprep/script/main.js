var app = playground({

	width: 640,
	height: 480,
	smoothing: false,
	container: document.getElementById("container"),
	preventKeyboardDefault: false,

	create: function() {
		this.pixelScale = 4;
		this.viewScale = 10;
		this.screen = cq(this.width / this.pixelScale, this.height / this.pixelScale);
		this.world = new World(this.width / (this.pixelScale * this.viewScale), this.height / (this.pixelScale * this.viewScale));
		this.offset = { x: 0, y: 0 };	
		
		this.loadImages('walls', 'player', 'cursor', 'map');
		this.loadSounds('jump', 'land', 'hurt');
	},

	ready: function() {
		this.images.walls = new Spritesheet(this.images.walls, 10, 10);
		this.images.player = new Spritesheet(this.images.player, 8, 8);
		this.images.cursor = new Spritesheet(this.images.cursor, 10, 10);
		
		var map = cq(this.images.map);
		
		for (var x = 0; x < this.world.width; x++)
			for (var y = 0; y < this.world.height; y++) {
				if (this.world.solid(x, y)) continue;
				var val = map.getPixel(x, y)[1];
				if (val == 195) this.world.setTile(x, y, this.world.tileTypes.air);
				if (val == 127) this.world.setTile(x, y, this.world.tileTypes.stone);
				if (val == 255) this.world.setTile(x, y, this.world.tileTypes.grass);
				if (val == 121) this.world.setTile(x, y, this.world.tileTypes.dirt);
				if (val == 0) { 
					this.world.setTile(x, y, this.world.tileTypes.wood);
					this.world.setTile(x, y - 1, this.world.tileTypes.wood);
					this.world.setTile(x, y - 2, this.world.tileTypes.leaves);
					this.world.setTile(x, y - 3, this.world.tileTypes.leaves);
					this.world.setTile(x - 1, y - 2, this.world.tileTypes.leaves);
					this.world.setTile(x + 1, y - 2, this.world.tileTypes.leaves);
				}
			}
	},

	step: function(delta) {
		
		/*if (this.mouse.left) {
			var x = Math.floor(this.mouse.x / this.pixelScale / this.viewScale);
			var y = Math.floor(this.mouse.y / this.pixelScale / this.viewScale);
			this.world.setTile(x, y, this.world.tileTypes.air);
		}
		if (this.mouse.right) {
			var x = Math.floor(this.mouse.x / this.pixelScale / this.viewScale);
			var y = Math.floor(this.mouse.y / this.pixelScale / this.viewScale);
			this.world.setTile(x, y, this.world.tileTypes.stone);
		}*/
	
		this.world.update(this, delta);
	},

	render: function(delta) {

		//this.layer.clear("#008");
		//this.layer.fillStyle("#fff").font("64px Arial").fillText("Hello World!", 32, 64);
		this.world.draw(this, delta);
		this.layer.drawImage(this.screen.canvas, 0, 0, this.width, this.height);
		
	},

	mousedown: function(event) {
		
	},

	mouseup: function(event) {
		
	},

	mousemove: function(event) {
		
	},

	keydown: function(event) {
	},

	keyup: function(event) {
	}

});