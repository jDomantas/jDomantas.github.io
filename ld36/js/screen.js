'use strict';

function Screen(width, height) {
	this.width = width;
	this.height = height;
	this.tiles = [];
	for (var x = 0; x < width; x++) {
		var column = [];
		for (var y = 0; y < height; y++)
			column.push({ ch: '?', color: '#2D2', depth: -1 });
		this.tiles.push(column);
	}
}

Screen.prototype.draw = function(x, y, ch, color, depth) {
	if (x >= 0 && y >= 0 && x < this.width && y < this.height && depth > this.tiles[x][y].depth) {
		if (ch == '<') ch = '&lt';
		if (ch == '>') ch = '&gt';
		this.tiles[x][y].ch = ch;
		this.tiles[x][y].color = color;
		this.tiles[x][y].depth = depth;
	}
}

Screen.prototype.drawObj = function(o, depth) {
	this.draw(o.x, o.y, o.ch, o.color, depth);
}

Screen.prototype.refresh = function() {
	for (var x = 0; x < this.width; x++)
		for (var y = 0; y < this.height; y++) {
			/*$('#x' + x + 'y' + y)
				.html(this.tiles[x][y].ch)
				.css('color', this.tiles[x][y].color);*/
			var element = document.getElementById('x' + x + 'y' + y);
			element.innerHTML = this.tiles[x][y].ch;
			element.style.color = this.tiles[x][y].color;
			this.tiles[x][y].depth = -1;
		}
}

