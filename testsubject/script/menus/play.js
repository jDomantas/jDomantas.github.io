var playState = {
	enter: function() {
		if (!this.buttons) {
			this.buttons = [];
			this.buttons.push(new Button(app.width / app.pixelScale / 2 - 60, 70, 120, 35, 'Singleplayer', function() { /*window.app.setState(gameState);*/ }));
			this.buttons.push(new Button(app.width / app.pixelScale / 2 - 60, 110, 120, 35, 'Coop', function() { /*window.app.setState(mainMenuState);*/ }));
			this.buttons.push(new Button(app.width / app.pixelScale / 2 - 60, 150, 120, 35, 'Custom', function() { dataState.show(gameCustomState, 'Paste game data', '', true); }));
			this.buttons.push(new Button(app.width / app.pixelScale / 2 - 60, 190, 120, 35, 'Back to main menu', function() { window.app.setState(mainMenuState); }));
		}
	},

	leave: function() {

	},

	step: function() {
	},
	
	mousedown: function(event) {
		for (var i = this.buttons.length - 1; i >= 0; i--)
			this.buttons[i].mouseClick();
	},

	draw: function() {
		app.screen.clear('#ffffff');
		for (var i = this.buttons.length - 1; i >= 0; i--)
			this.buttons[i].draw();
	}
}