var endState = {
	enter: function() {
		if (!this.buttons) {
			this.buttons = [];
			this.buttons.push(new Button(100, app.height / app.pixelScale - 50, 120, 35, 'Main menu', 
				function() { window.app.setState(mainMenuState); }));
		}
		if (!this.explanations) {
			this.explanations = Font.createPanel(app, 
				'You lost, as you are trapped in a tiny room for the rest of your life. But maybe you have won, because you successfully completed all the tests. I guess we can make an optimist/pessimist test out of that. Either way, you have completed the game.', 160, true);
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

		app.screen.drawImage(app.images.bg, 0, 0);

		for (var i = this.buttons.length - 1; i >= 0; i--) {
			this.buttons[i].draw();
		};

		app.screen.drawImage(this.explanations.canvas, (app.width / app.pixelScale - this.explanations.canvas.width) / 2, 50);
	}
}
