var dataState = {
	enter: function() {

	},

	leave: function() {

        app.dataContainer.innerHTML = app.dataContainer.innerHTML.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	},

	step: function() {
	},
	
	mousedown: function(event) {
		for (var i = this.buttons.length - 1; i >= 0; i--)
			if (this.buttons[i].text !== 'Select all')
				this.buttons[i].mouseClick();
	},

	mouseup: function(event) {
		for (var i = this.buttons.length - 1; i >= 0; i--)
			if (this.buttons[i].text === 'Select all')
				this.buttons[i].mouseClick();
	},

	draw: function() {
		app.screen.clear('#ffffff');
		for (var i = this.buttons.length - 1; i >= 0; i--)
			this.buttons[i].draw();

		var x = 2;
		for (var i = 0; i < this.title.length; i++) {
			index = Font.line.indexOf(this.title.charAt(i));
			if (index >= 0) {
				app.screen.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), 2);
				x += Font.widths[index] + 1;
			}
		}
	},

	show: function(parent, title, data, cancel) {
		this.parent = parent;
		this.title = title;
		app.setState(this);
		app.showData(data);
		this.buttons = [];
		this.needData = cancel;
		this.buttons.push(new Button(app.width / app.pixelScale - 130, app.height / app.pixelScale - 45, 120, 35, 'OK', 
			function() { 
				dataState.success = dataState.needData; 
				app.hideData();
				app.setState(dataState.parent); 
			}));
		if (cancel)
			this.buttons.push(new Button(app.width / app.pixelScale - 260, app.height / app.pixelScale - 45, 120, 35, 'Cancel', 
				function() { 
					dataState.success = false;
					app.hideData();
					app.setState(dataState.parent); 
				}));
		else
			this.buttons.push(new Button(app.width / app.pixelScale - 260, app.height / app.pixelScale - 45, 120, 35, 'Select all', 
				function() { 
					app.selectData();
				}));
	},

	hasData: function() {
		var res = dataState.success;
		dataState.success = false;
		return res; 
	}
}