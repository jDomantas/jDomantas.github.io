var gameCustomState = {
	enter: function() {
		if (!this.game) {
			this.game = new Game(app.width / (app.pixelScale * app.scale), app.height / (app.pixelScale * app.scale));
			if (dataState.hasData()) {
				this.game.loadLevel(app, JSON.parse(LZV.decode(Base64.decode(app.dataContainer.innerHTML))), true, true);
			} else {
				messageState.show('Couldn\'t load level.');
			}
		}
	},

	step: function() {
		this.game.update(app);
		if (this.game.won) {
			messageState.show('Win!');		
		}
	},

	draw: function() {
		app.screen.clear('#000');
		this.game.draw(app);
	},

	keydown: function(event) {
		if (event.key === 'r' && this.game.currentLevel)
			this.game.loadLevel(app, this.game.currentLevel, false, undefined, true);
	},

}