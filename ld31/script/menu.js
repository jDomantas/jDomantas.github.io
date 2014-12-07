function Button(x, y, width, height, text, click) {
	this.x = x;
	this.y = y;
	this.w = width;
	this.h = height;
	this.text = text;
	this.click = click;
	this.over = false;
}

Button.prototype = {
	mouseOver: function() {
		return app.mouse.x / app.pixelScale >= this.x && app.mouse.x / app.pixelScale < this.x + this.w &&
			app.mouse.y / app.pixelScale >= this.y && app.mouse.y / app.pixelScale < this.y + this.h;
	},
	update: function() {
		this.over = this.mouseOver();
		if (app.mouse.left && this.over) {
			if (this.click)
				this.click();
		}
	},
	draw: function() {
		app.screen.drawFrame(app.images.button, this.over ? 1 : 0,
			this.x, this.y, this.w, this.h);
		var index;
		var x = this.x + this.w / 2 - Font.length(this.text) / 2;
		for (var i = 0; i < this.text.length; i++) {
			index = Font.line.indexOf(this.text.charAt(i));
			if (index >= 0) {
				app.screen.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), this.y + this.h / 2 - 7);
				x += Font.widths[index] + 1;
			}
		}
	}
}

var mainMenuState = {
	enter: function() {
		if (!this.buttons) {
			this.buttons = [];
			this.buttons.push(new Button(100, 110, 120, 35, 'Play', function() { window.app.setState(gameState); }));
		}
		if (!this.explanations) {
			this.explanations = Font.createPanel(app, 'Controls: wasd/arrows and mouse', 170, true);
		}
	},
	leave: function() {

	},
	step: function() {
		for (var i = this.buttons.length - 1; i >= 0; i--) {
			this.buttons[i].update();
		};
	},
	draw: function() {

		app.screen.drawImage(app.images.bg, 0, 0);

		for (var i = this.buttons.length - 1; i >= 0; i--) {
			this.buttons[i].draw();
		};

		app.screen.drawImage(app.images.title, (app.width / app.pixelScale - app.images.title.width) / 2, 20);
		app.screen.drawImage(this.explanations.canvas, (app.width / app.pixelScale - this.explanations.canvas.width) / 2, 150);
	}
}

var endState = {
	enter: function() {
		if (!this.buttons) {
			this.buttons = [];
			this.buttons.push(new Button(100, app.height / app.pixelScale - 50, 120, 35, 'Main menu', 
				function() { window.app.setState(mainMenuState); }));
		}
		if (!this.explanations) {
			this.explanations = Font.createPanel(app, 
				'You lost, as you are trapped in a tiny room for the rest of your life. But maybe you have won, because you successfully completed all the tests. I guess we can make an optimist/pessimist test out of that. Either way, you completed the game.', 160, true);
		}
	},
	leave: function() {

	},
	step: function() {
		for (var i = this.buttons.length - 1; i >= 0; i--) {
			this.buttons[i].update();
		};
	},
	draw: function() {

		app.screen.drawImage(app.images.bg, 0, 0);

		for (var i = this.buttons.length - 1; i >= 0; i--) {
			this.buttons[i].draw();
		};

		app.screen.drawImage(this.explanations.canvas, (app.width / app.pixelScale - this.explanations.canvas.width) / 2, 50);
	}
}