'use strict';
	
window.onLoadInit = (function() {
	var width = 30;
	var height = 16;
	
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(e) {
			for (var i = 0; i < this.length; i++)
				if (this[i] == e)
					return i;
			return -1;
		}
	}
	
	/*for (var y = 0; y < height; y++) {
		var p = $('<p>').addClass('view').addClass('unselectable');
		for (var x = 0; x < width; x++)
			p.append($('<span>').attr('id', 'x' + x + 'y' + y));
		$('#gameView').append(p);
	}*/
	
	var screen = new Screen(width, height);
	var game = new Game(screen);
	game.play();
});

