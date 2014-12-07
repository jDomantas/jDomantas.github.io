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
		this.loadImages('tiles', 'player', 'laser', 'crate', 'portal', 'font', 'weapon');
		this.loadSounds('death', 'level', 'press', 'release', 'teleport');
		this.game = new Game(this.width / (this.pixelScale * this.scale), this.height / (this.pixelScale * this.scale));
	},

	ready: function() {
		this.images.tiles = new Spritesheet(this.images.tiles, 16, 32);
		this.images.player = new Spritesheet(this.images.player, 12, 13);
		this.images.crate = new Spritesheet(this.images.crate, 12, 16);
		this.images.portal = new Spritesheet(this.images.portal, 22, 22);
		this.images.font = new Spritesheet(this.images.font, 8, 10);
		this.images.weapon = new Spritesheet(this.images.weapon, 8, 5);
		this.game.loadLevel(app, levels.level1, true);
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
		//if (event.key === 'r')
		//	this.game.loadLevel(app, this.game.currentLevel, false, undefined, true);
	},

	keyup: function(event) {

	}

});
