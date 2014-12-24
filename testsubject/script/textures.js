var textures = {

	loadTextures: function(src) {
		var srcl = cq(src);
		var dest = cq(128, 14 * 32);//384);

		var colors = [
			[0, 0, 0],
			[229, 229, 57],
			[57, 229, 57],
			[57, 57, 229],
			[229, 57, 57],
			[229, 160, 229],
			[56, 226, 226]
		];

		this.drawTileFrames(src, dest, 0, 0, 3);

		this.drawRotation(dest, 1, 9, 0, function() { return false; }); // floor

		this.drawRotation(dest, 17, 9, 0, function() { return false; }); // sensor activated
		dest.drawImage(src, 96, 64, 16, 32, 16, 0, 16, 32);

		this.drawRotation(dest, 33, 9, 0, this.texture(srcl, 97, 9, 0), cq.color([145, 0, 0])); // button activated

		for (var i = 1; i < 6; i++)
			this.drawTile(dest, 0, 32 + i * 32, this.texture(srcl, i * 16 + 33, 9), cq.color(colors[i]), src);

		for (var i = 1; i < 4; i++)
			this.drawTile(dest, 0, 192 + i * 32, this.texture(srcl, 113, 9, i), cq.color(colors[5]), src);

		this.drawWall(dest, 0, 32, 0, 32, src);
		this.drawWall(dest, 0, 352, 64, 32, src);
		this.drawPit(dest, 0, 320)
		
		this.drawTileFrames(src, dest, 0, 384, 8);
		for (var i = 0; i < 8; i++) {
			this.drawRotation(dest, 16 * i + 1, 393, 0, function() { return false; });
			if (i > 1)
				dest.drawImage(src, (i - 2) * 16, 64, 16, 32, 16 * i, 384, 16, 32);
		}

		this.drawTile(dest, 0, 416, this.texture(srcl, 129, 9, 0), cq.color(colors[6]), src);
		/*
		var wires = [
			0, 0,
			0, 1,
			1, 0,
			1, 1,
			1, 2,
			1, 3,
			2, 0,
			2, 1,
			2, 2, 
			2, 3,
			3, 0
		];

		for (var i = 0; i < 11; i++) {
			this.drawTile(dest, 0, 384 + i * 32, 
				this.texture(srcl, 129 + wires[2 * i] * 16, 9, wires[i * 2 + 1]), 
				cq.color(colors[6]), src);
			this.drawTileFrames(src, dest, i % 8 * 16, 736 + Math.floor(i / 8) * 32, 1);
			this.drawRotation(dest, i % 8 * 16 + 1, 745 + Math.floor(i / 8) * 32, 0, 
				this.texture(srcl, 129+ wires[2 * i] * 16, 9, wires[i * 2 + 1]), cq.color([ 255, 178, 102 ]));
			//  		
		}
		*/
		dest.appendTo(document.body);

		return dest.canvas;
	},

	drawTile: function(dest, x, y, tex, col, src) {
		this.drawTileFrames(src, dest, x, y, 8, tex);
		for (var i = 0; i < 8; i++) {
			this.drawRotation(dest, x + 16 * i + 1, y + 9, (i) * Math.PI / 7, i < 4 ? function() { return false; } : tex, col);
		}
	},

	drawWall: function(dest, x, y, sx, sy, src) {
		for (var i = 0; i < 8; i++) {
			//                  srcx		srcy 		w & h 		x					y 		w 	h
			dest.drawImage(src, 0, 			0, 			16,	32,		x + (7 - i) * 16,	y,		16,	32); // base
			dest.drawImage(src, sx + 16, 	sy + 16, 	16,	16,		x + (7 - i) * 16,	y + 16,	16,	16); // side
			dest.drawImage(src, sx, 		sy, 		16,	16,		x + (7 - i) * 16,	y + i,	16,	16); // top
			dest.drawImage(src, sx + 32, 	sy, 		16,	13 - i,	x + (7 - i) * 16,	y + i,	16,	13 - i); // inner side wall
			dest.context.globalAlpha = 1 - (i / 8);
			dest.drawImage(src, sx + 16, 	sy, 		16,	17,		x + (7 - i) * 16,	y + i,	16,	17); // shaded top
			dest.context.globalAlpha = 1;
			dest.drawImage(src, sx + 48, 	sy, 		16,	16,		x + (7 - i) * 16,	y + i,	16,	16); // inner top border
		}
	},

	drawPit: function(dest, x, y) {
		var floor = cq(16, 32).drawImage(dest.canvas, 0, 0, 16, 32, 0, 0, 16, 32);
		//floor.appendTo(document.body);
		for (var i = 0; i < 8; i++) {
			dest.fillStyle('#000').fillRect(x + i * 16, y + 8, 16, 24);
			dest.context.globalAlpha = 1 - i / 7;
			dest.drawImage(floor.canvas, x + i * 16, y, 16, 32);
			dest.context.globalAlpha = 1;
		}
	},

	texture: function(srclayer, x, y, rot) {
		return function(xx, yy) {
			if (rot === 1) 		return srclayer.getPixel(x + yy, 		y + 13 - xx	)[0] < 1 ? 1 : 0;// ? col : bg;
			else if (rot === 2)	return srclayer.getPixel(x + 13 - xx, 	y + 13 - yy	)[0] < 1 ? 1 : 0;// ? col : bg;
			else if (rot === 3)	return srclayer.getPixel(x + 13 - yy,	y + xx		)[0] < 1 ? 1 : 0;// ? col : bg;
			else 				return srclayer.getPixel(x + xx, 		y + yy		)[0] < 1 ? 1 : 0;// ? col : bg;
		}
	},

	drawTileFrames: function(src, dest, x, y, count, tex) {
		for (var i = 0; i < count; i++) {
			dest.drawImage(src, 0, 0, 16, 32, x + i * 16, y, 16, 32);
			dest.drawImage(src, 16, 0, 16, 32, x + i * 16, y, 16, 32);
		}
	},

	color: function(tex, x, y, width) {
		var xs = x / width * 14;
		var xe = (x + 1) / width * 14;
		var sum = tex(Math.floor(xs), y) * (Math.ceil(xs) - xs);
		for (var i = Math.ceil(xs); i < xe; i++) 
			sum += tex(i, y);
		sum += tex(Math.floor(xe), y) * (xe - Math.floor(xe));
		//console.log('(' + x + '; ' + y + ') at width ' + width + ', range: ' + xs + ' - ' + xe + ', total: ' + sum);
		return sum >= (xe - xs) * 0.7;
	},

	drawRotation: function(dest, x, y, rot, tex, col) {
		var width = 7 * Math.cos(rot);
		var hoffset = Math.round(7 * Math.sin(rot));
		var bgcolor = cq.color([249, 249, 249, 1]);
		if (width < 0) {
			hoffset *= -1;
			width *= -1;
		}
		width = Math.round(width);
		//console.log('width: ' + width + ', offset: ' + hoffset);
		if (width < 2) {
			hoffset = Math.abs(hoffset);
			for (var i = 0; i < hoffset + 14; i++) {
				dest.setPixel(bgcolor, x + 6, y - hoffset + i);
				dest.setPixel(bgcolor, x + 7, y - hoffset + i);
			}
		} else {
			for (var xx = 0; xx < width; xx++) {
				var ys = Math.round(-hoffset * (1 - (xx) / width));
				//console.log('col ' + xx + ': ' + ys + ', raw: ' + (-hoffset * (1 - (xx) / width)));
				for (var yy = 0; yy < 14; yy++) {
					if (yy + ys < 14) 
						dest.setPixel(this.color(tex, xx, yy, width * 2) ? col : bgcolor, x + 7 - width + xx, y + yy + ys);
					if (yy - ys < 14) 
						dest.setPixel(this.color(tex, width * 2 - 1 - xx, yy, width * 2) ? col : bgcolor, x + 6 + width - xx, y + yy - ys);
				}
			}
		}
	},
}
