function Button(x, y, width, height, text, click, custom) {
	this.x = x;
	this.y = y;
	this.w = width;
	this.h = height;
	this.text = text;
	this.click = click;
	this.over = false;
	this.enabled = true;
	this.custom = custom || false;
	this.highlight = false;
}

Button.prototype = {
	mouseOver: function() {
		return app.mouse.x >= this.x && app.mouse.x < this.x + this.w &&
			app.mouse.y >= this.y && app.mouse.y < this.y + this.h;
	},

	draw: function() {
		if (!this.enabled) return;

		if (!this.custom) {
			app.screen.drawFrame(app.images.button, this.mouseOver() ? 1 : 0,
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
		} else {
			var x = this.x + 2;
			app.screen.fillStyle(this.highlight ? '#bbbbbb' : '#aaaaaa').fillRect(x, 2, this.width, this.height);
			for (var i = 0; i < this.text.length; i++) {
				index = Font.line.indexOf(this.text.charAt(i));
				if (index >= 0) {
					app.screen.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), this.y + 2);
					x += Font.widths[index] + 1;
				}
			}
		}
	},

	mouseClick: function() {
		this.over = this.mouseOver();
		if (this.enabled && this.mouseOver() && this.click)
			this.click();
	}
}
