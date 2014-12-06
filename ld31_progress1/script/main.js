var app = playground({

	width: 640,
	height: 480,
	container: document.getElementById('container'),
	scale: 16,
	pixelScale: 2,
	smoothing: false,
	preventKeyboardDefault: false,

	create: function() {
		this.screen = cq(this.width / this.pixelScale, this.height / this.pixelScale);
		this.loadImages('tiles', 'player', 'laser', 'crate', 'portal');
		this.loadSounds('death', 'level', 'press', 'release', 'teleport')
		this.game = new Game(this.width / (this.pixelScale * this.scale), this.height / (this.pixelScale * this.scale));
		this.game.loadLevel(levels.level1, true);
		console.log(this.game);
	},

	ready: function() {
		this.images.tiles = new Spritesheet(this.images.tiles, 16, 32);
		this.images.player = new Spritesheet(this.images.player, 12, 13);
		this.images.crate = new Spritesheet(this.images.crate, 10, 16);
		this.images.portal = new Spritesheet(this.images.portal, 22, 22);
	},

	step: function(delta) {
		this.game.update(this);
	},

	render: function(delta) {
		this.screen.clear('#000');
		this.game.draw(this);
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
