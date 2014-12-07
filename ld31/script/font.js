var Font = {
	widths: [
		5, 4, 4, 4, 4, 2, 4, 4, 1, 1, 4, 1, 5, 4, 4, 4, 4, 4, 4, 2, 4, 5, 7, 5, 4, 4,
		5, 5, 5, 5, 5, 5, 5, 5, 2, 4, 5, 4, 7, 6, 5, 5, 5, 5, 5, 5, 5, 5, 7, 5, 5, 5,
		3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 5, 5, 2, 2, 5, 5, 5, 5, 5, 4, 1,
		4
	],

	line: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,!;:?-()#*+_=/' ",

	charWidth: function(char) {
		var index = this.line.indexof(char);
		return index < 0 ? 0 : this.widths[index];
	},

	length: function(line) {
		var w = 0, index;
		for (var i = line.length - 1; i >= 0; i--) {
			index = this.line.indexOf(line.charAt(i));
			if (index != -1)
				w += this.widths[index] + 1;
		}
		return w;
	},

	createPanel: function(app, message, width, nobg) {
		if (!nobg) nobg = false;
		var text = this.measure(message, width - 4);
		var height = text.height + 6;
		var layer = cq(width, height);
		if (!nobg) {
			layer.fillStyle('#555').fillRect(1, 0, width - 2, 1).fillRect(0, 1, 1, height - 2)
				.fillRect(1, height- 1, width - 2, 1).fillRect(width - 1, 1, 1, height - 2)
				.fillStyle('#7090BE').fillRect(1, 1, width - 2, height - 2);
		} else {
			var col = cq.color('#fff');
			col.a(0);
			layer.clear(col);
		}
		var index;
		var x;
		for (var y = 0; y < text.text.length; y++) {
			x = 2;
			for (var i = 0; i < text.text[y].length; i++) {
				index = this.line.indexOf(text.text[y].charAt(i));
				if (index >= 0) {
					layer.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), y * 10 + 1);
					x += this.widths[index] + 1;
				}
			}
		}
		return layer;
	},

	measure: function(message, width) {
		var words = message.split(' ');
		var lines = [];
		var current = '';
		var currlen = 0, wordlen;
		for (var i = 0; i < words.length; i++) {
			wordlen = this.length(' ' + words[i]);
			if (currlen + wordlen > width) {
				lines.push(current);
				currlen = this.length(words[i])
				current = words[i] + ' ';
			} else {
				currlen += wordlen;
				current += words[i] + ' ';
			}
		}
		if (current !== '')
			lines.push(current);
		return { text: lines, height: lines.length * 10 - 3 };
	}
}