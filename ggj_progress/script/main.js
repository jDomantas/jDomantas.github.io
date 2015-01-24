var WizardGame = playground({

	width: 768,
	height: 576,
	preventKeyboardDefault: false,
	smoothing: false,

	create: function() {
		
		this.loadImages('map', 'tileset', 'characters', 'spells');

	},

	ready: function() {
		this.images.map = cq(this.images.map);
		this.setState(StateLoader);

		this.player = new EntityWizard(2, 2);

		this.locked = null;
	},

	loadViews: function() {

		
	},

	step: function(delta) {
		
	},

	render: function(delta) {

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