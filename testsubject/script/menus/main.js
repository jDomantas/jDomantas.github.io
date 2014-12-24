var mainMenuState = {
	enter: function() {
		if (!this.buttons) {
			this.buttons = [];
			this.buttons.push(new Button(app.width / app.pixelScale / 2 - 60, 110, 120, 35, 'Play', function() { window.app.setState(playState); }));
			this.buttons.push(new Button(app.width / app.pixelScale / 2 - 60, 150, 120, 35, 'Editor', function() { window.app.setState(editorState); }));
			this.buttons.push(new Button(app.width / app.pixelScale / 2 - 60, 190, 120, 35, 'Options', function() { /*window.app.setState(editorState);*/ }));
		}
		/*if (!this.explanations) {
			this.explanations = Font.createPanel(app, 'Controls: wasd/arrows and mouse', 170, true);
		}*/
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

		//app.screen.drawImage(app.images.bg, 0, 0);
		app.screen.clear('#fff');

		for (var i = this.buttons.length - 1; i >= 0; i--) {
			this.buttons[i].draw();
		};

		app.screen.drawImage(app.images.title, (app.width / app.pixelScale - app.images.title.width) / 2, 20);
		//app.screen.drawImage(this.explanations.canvas, (app.width / app.pixelScale - this.explanations.canvas.width) / 2, 190);
	}
}
