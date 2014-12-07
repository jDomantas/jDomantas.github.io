var app = playground({

	width: 640,
	height: 480,
	container: document.getElementById('container'),
	scale: 16,
	pixelScale: 2,
	smoothing: false,
	preventKeyboardDefault: true,

	create: function() {
		this.screen = cq(this.width / this.pixelScale, this.height / this.pixelScale);
		this.loadImages('tiles', 'player', 'laser', 'crate', 'portal', 'font', 'weapon', 'button', 'bg', 'title');
		this.loadSounds('death', 'level', 'press', 'release', 'teleport');
	},

	ready: function() {
		this.images.tiles = new Spritesheet(this.images.tiles, 16, 32);
		this.images.player = new Spritesheet(this.images.player, 12, 13);
		this.images.crate = new Spritesheet(this.images.crate, 12, 16);
		this.images.portal = new Spritesheet(this.images.portal, 22, 22);
		this.images.font = new Spritesheet(this.images.font, 8, 10);
		this.images.weapon = new Spritesheet(this.images.weapon, 8, 5);
		this.images.button = new Spritesheet(this.images.button, 120, 30);

		this.setState(mainMenuState);
	},

	step: function(delta) {
		//if (!this.state)
		//	this.game.update(this);
	},

	render: function(delta) {
		//this.screen.clear('#000');
		//this.game.draw(this);
		if (this.state)
			if (this.state.draw)
				this.state.draw();
		this.layer.drawImage(this.screen.canvas, 0, 0, this.width, this.height);
	},

	mousedown: function(event) { },

	mouseup: function(event) { },

	mousemove: function(event) { },

	keydown: function(event) { },

	keyup: function(event) { }

});

var gameState = {
	enter: function() {
		if (!this.game)
			this.game = new Game(app.width / (app.pixelScale * app.scale), app.height / (app.pixelScale * app.scale));
		this.game.loadLevel(app, levels.level1, true, undefined, true);
		this.game.player.weapon = false;
	},

	step: function() {
		this.game.update(app);
	},

	draw: function() {
		app.screen.clear('#000');
		this.game.draw(app);
	},

	keydown: function(event) {
		if (event.key === 'r')
			this.game.loadLevel(app, this.game.currentLevel, false, undefined, true);
	},

}
