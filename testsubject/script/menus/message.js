var messageState = {

	show: function(message) {
		this.message = message;
		app.setState(this);
		this.panel = Font.createPanel(app, this.message, 170, true);
		console.log(this.panel);
		this.button = new Button(app.width / app.pixelScale / 2 - 60, 200, 120, 35, 'Back to main menu', function() {
			app.setState(mainMenuState);
		});
	},

	mousedown: function(event) {
		this.button.click();
	},

	draw: function() {
		app.screen.clear('#fff');
		this.button.draw();
		app.screen.drawImage(this.panel.canvas, (app.width / app.pixelScale - this.panel.canvas.width) / 2, 50);
	}

}