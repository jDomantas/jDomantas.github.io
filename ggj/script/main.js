var WizardGame = playground({

	container: document.getElementById('container'),
	width: 960,
	height: 640,
	preventKeyboardDefault: true,
	smoothing: false,

	create: function() {
		
		this.loadImages('deth', 'map', 'tileset', 'characters', 'spells', 'timer', 'player', 'playerflip', 'skillball', 'enemy', 'enemy2', 'title');
		
		this.screen = cq(this.width / 2, this.height / 2);

	},

	ready: function() {
		this.images.map = cq(this.images.map);
		this.setState(StateLoader);

		this.player = new EntityWizard(23, 16);

		this.locked = null;
	},

	loadViews: function() {

		
	},

	step: function(delta) {
		
	},

	render: function(delta) {
		this.layer.drawImage(this.screen.canvas, 0, 0, this.width, this.height)
	},

	worldTile: function(x, y) {
		if (x < 0 || y < 0 || x >= this.collisions.length || y >= this.collisions[0].length)
			return 1;
		if (this.locked && (
			x < this.locked.x1 || 
			y < this.locked.y1 || 
			x >= this.locked.x2 ||
			y >= this.locked.y2))
			return 1;
		return this.collisions[x][y];
	},

	lockTiles: function(x1, y1, x2, y2) {
		this.locked = {
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2
		}
	},

	unlockTiles: function() {
		this.locked = null;
	}

});