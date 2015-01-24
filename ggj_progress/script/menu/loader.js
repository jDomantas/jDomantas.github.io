var StateLoader = {

	enter: function() {
		
		WizardGame.mapWidth = Math.floor(WizardGame.images.map.width / (WizardView.width + 1));
		WizardGame.mapHeight = Math.floor(WizardGame.images.map.height / (WizardView.height + 1));

		WizardGame.collisions = new Array(WizardGame.mapWidth * WizardView.width);
		for (var i = 0; i < WizardGame.collisions.length; i++) {
			WizardGame.collisions[i] = new Array(WizardGame.mapHeight * WizardView.height);
			for (var j = WizardGame.collisions[i].length - 1; j >= 0; j--) {
				WizardGame.collisions[i][j] = 1;
			};
		}

		this.loadedViews = 0;
		this.totalViews = WizardGame.mapWidth * WizardGame.mapHeight;

		WizardGame.views = new Array(WizardGame.mapWidth);
		for (var x = 0; x < WizardGame.mapWidth; x++) {
			WizardGame.views[x] = new Array(WizardGame.mapHeight);
			for (var y = 0; y < WizardGame.mapHeight; y++) {
				var random = Math.random();
				WizardGame.views[x][y] = new WizardView(x, y);
			}
		}

		this.loadViews();
	},

	loadViews: function() {
		var loader = function(state, x, y) {
			if (x >= WizardGame.mapWidth) {
				x = 0;
				y++;
				if (y >= WizardGame.mapHeight)
					return;
			}
			WizardGame.views[x][y].load(WizardGame.images.map);
			state.loadedViews++;
			if (state.loadedViews < state.totalViews)
				setTimeout(function() {
					loader(state, x + 1, y);
				}, 50);
			else
				state.onLoaded();
		}

		loader(this, 0, 0);
	},

	render: function() {

		WizardGame.layer.clear('#000');
		WizardGame.layer
			.fillStyle('#fff')
			.font('64px Arial')
			.fillText('Loading: ' + (this.loadedViews) + '/' + (this.totalViews), 32, 64);

	},

	onLoaded: function() {
		WizardGame.setState(StateGame);
	}

};