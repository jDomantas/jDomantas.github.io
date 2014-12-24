var editorState = {
	enter: function() {
		if (!this.game) {
			this.game = new Game(app.width / (app.pixelScale * app.scale), app.height / (app.pixelScale * app.scale));
			this.game.won = true;
			this.testGame = new Game(app.width / (app.pixelScale * app.scale), app.height / (app.pixelScale * app.scale));
			this.crates = new Array(this.game.width);
			for (var i = 0; i < this.crates.length; i++)
				this.crates[i] = new Array(this.game.height);
			this.logic = [];
			this.game.objects = [];
		}

		this.drawingTile = 'floor';
		editorMenu.open();
		this.editorOpen = true;
		this.editorY = 0;
		this.oldLeft = false;
		this.oldRight = false;
		this.dragged = null;
		this.dragFrom = false;
		this.testing = false;

		var data = dataState.hasData();
		if (data) {
			this.load(JSON.parse(LZV.decode(Base64.decode(app.dataContainer.innerHTML))));
		}
	},

	step: function() {
		if (this.testing) {
			this.testGame.update(app);
			if (this.testGame.won) {
				this.testing = false;
				this.editorY = -100;
				this.editorOpen = false;
			}
		} else {
			if (this.editorOpen)
				editorMenu.step();

			if (this.editorOpen)
				this.editorY = Math.min(0, this.editorY + 10);
			else
				this.editorY = Math.max(-100, this.editorY - 10);

			this.game.update(app);

			if (this.editorY < -95 && !this.editorOpen && editorMenu.tab === 0 && app.mouse.left) {
				var x = Math.floor((app.mouse.x - this.game.offset.x) / app.scale);
				var y = Math.floor((app.mouse.y - this.game.offset.y) / app.scale);
				if (x >= 0 && y >= 0 && x < this.game.width && y < this.game.height) {
					this.game.tiles[x][y].change(this.drawingTile);
					if (this.drawingTile === 'dispenser')
						this.crates[x][y] = this.crates[x][y] || 1;
					else
						this.crates[x][y] = 0;
				}
			}

			if (this.dragged) {
				this.dragged.x = app.mouse.x;
				this.dragged.y = app.mouse.y;
			}

			if (!app.mouse.left && this.dragged) {
				if (this.dragged.x < 0 || 
					this.dragged.y < 0 || 
					this.dragged.x >= app.width / app.pixelScale || 
					this.dragged.y >= app.height / app.pixelScale) {
					this.dragged.removed = true;
					for (var i = 0; i < this.logic.length; i++)
						if (this.logic[i] === this.dragged) {
							this.logic.splice(i, 1);
							break;
						}
					for (var i = 0; i < this.logic.length; i++)
						this.logic[i].updateInputs();
				}
				this.dragged = null;
			}

			//console.log(this.draggedFrom);

			if (!app.mouse.right && this.draggedFrom) {
				for (var i = 0; i < this.logic.length; i++) {
					if ((this.logic[i].x - app.mouse.x) * (this.logic[i].x - app.mouse.x) + 
						(this.logic[i].y - app.mouse.y) * (this.logic[i].y - app.mouse.y) <= 64) {
						if (this.draggedFrom === this.logic[i])
							this.draggedFrom.inputs = [];
						else
							this.draggedFrom.addInput(this.logic[i]);
						break;
					}
				}
				this.draggedFrom = null;
			}
		}
	},

	draw: function() {
		if (this.testing) {
			this.testGame.draw(app);
		} else {
			editorMenu.draw();
			this.game.draw(app);
			for (var x = 0; x < this.game.width; x++)
				for (var y = 0; y < this.game.height; y++)
					if (this.crates[x][y])
						app.screen.drawFrame(app.images.crate, this.crates[x][y] - 1, 
							x * app.scale + this.game.offset.x + 2, 
							y * app.scale + this.game.offset.y - 3);
				
			if (editorMenu.tab === 0 && !this.editorOpen) {
				var x = Math.floor((app.mouse.x - this.game.offset.x) / app.scale);
				var y = Math.floor((app.mouse.y - this.game.offset.y) / app.scale);
				if (x >= 0 && y >= 0 && x < this.game.width && y < this.game.height) {
					app.screen.beginPath();
					x = x * app.scale + this.game.offset.x;
					y = y * app.scale + this.game.offset.y;
					app.screen.moveTo(x + 0.5, y + 0.5);
					app.screen.lineTo(x + app.scale - 0.5, y + 0.5);
					app.screen.lineTo(x + app.scale - 0.5, y + app.scale - 0.5);
					app.screen.lineTo(x + 0.5, y + app.scale - 0.5);
					app.screen.lineTo(x + 0.5, y + 0.5);
					app.screen.strokeStyle('#ff0000').lineWidth(1).stroke();
				}
			} else if (editorMenu.tab === 1) {
				for (var i = this.logic.length - 1; i >= 0; i--)
					this.logic[i].draw();
				if (!this.editorOpen && this.dragged === null) {
					for (var i = 0; i < this.logic.length; i++) {
						if ((this.logic[i].x - app.mouse.x) * (this.logic[i].x - app.mouse.x) + 
							(this.logic[i].y - app.mouse.y) * (this.logic[i].y - app.mouse.y) <= 64) {
							if (this.logic[i].hasSettings()) {
								app.screen.drawImage(app.images.settings, Math.floor(this.logic[i].x), Math.floor(this.logic[i].y - 48));
								this.logic[i].drawSettings(this.logic[i].x + 2, this.logic[i].y - 46);
							}
							break;
						}
					}
				}
			}
			app.screen.drawImage(editorMenu.panel.canvas, 0, this.editorY);
		}
	},

	keydown: function(event) {
		if (!this.testing) {
			if (event.key === 'space') {
				this.editorOpen = !this.editorOpen;
				if (this.editorOpen) editorMenu.open();
				else editorMenu.closed();
			} else if (!this.editorOpen && event.key === 'up') {
				for (var i = 0; i < this.logic.length; i++) {
					if ((this.logic[i].x - app.mouse.x) * (this.logic[i].x - app.mouse.x) + 
						(this.logic[i].y - app.mouse.y) * (this.logic[i].y - app.mouse.y) <= 64) {
						if (this.logic[i].hasSettings)
							this.logic[i].modifySetting(1);
						break;
					}
				}
			} else if (!this.editorOpen && event.key === 'down') {
				for (var i = 0; i < this.logic.length; i++) {
					if ((this.logic[i].x - app.mouse.x) * (this.logic[i].x - app.mouse.x) + 
						(this.logic[i].y - app.mouse.y) * (this.logic[i].y - app.mouse.y) <= 64) {
						if (this.logic[i].hasSettings)
							this.logic[i].modifySetting(-1);
						break;
					}
				}
			} else
				editorMenu.keydown(event);
		} else {
			if (event.key === 'escape') {
				this.testing = false;
				this.editorY = -100;
				this.editorOpen = false;
			}
		}
	},

	mousedown: function(event) {
		if (this.editorOpen) {
			editorMenu.click(event);
		} else if (event.x >= 0 && event.y >= 0 && event.x < 70 && event.y < 11) {
			this.editorOpen = true;
			editorMenu.open();
		} else if (editorMenu.tab === 1) {
			if (event.button === 'left') {
				for (var i = 0; i < this.logic.length; i++) {
					if ((this.logic[i].x - event.x) * (this.logic[i].x - event.x) + 
						(this.logic[i].y - event.y) * (this.logic[i].y - event.y) <= 64) {
						this.dragged = this.logic[i];
						break;
					}
				}
				if (this.dragged === null) {
					// nothing clicked, add new
					this.logic.push(this.dragged = new Item(event.x, event.y, editorMenu.logicSelected));
				}
			} else if (event.button === 'right') {
				for (var i = 0; i < this.logic.length; i++) {
					if ((this.logic[i].x - event.x) * (this.logic[i].x - event.x) + 
						(this.logic[i].y - event.y) * (this.logic[i].y - event.y) <= 64) {
						this.draggedFrom = this.logic[i];
						break;
					}
				}
			}
		} else if (editorMenu.tab === 0 && event.button === 'right') {
			var x = Math.floor((event.x - this.game.offset.x) / app.scale);
			var y = Math.floor((event.y - this.game.offset.y) / app.scale);
			if (x >= 0 && y >= 0 && x < this.game.width && y < this.game.height) {
				if (this.game.tiles[x][y].type === 'block_up') this.game.tiles[x][y].change('block_right');
				else if (this.game.tiles[x][y].type === 'block_right') this.game.tiles[x][y].change('block_down');
				else if (this.game.tiles[x][y].type === 'block_down') this.game.tiles[x][y].change('block_left');
				else if (this.game.tiles[x][y].type === 'block_left') this.game.tiles[x][y].change('block_up');
				else if (this.game.tiles[x][y].type === 'dispenser') this.crates[x][y] = (this.crates[x][y] % 8) + 1;
			}
		}
	},

	mouseup: function(event) {

	},

	compile: function() {
		var obj = {};
		obj.tiles = new Array(this.game.width);
		for (var i = 0; i < obj.tiles.length; i++)
			obj.tiles[i] = new Array(this.game.height);
		for (var x = 0; x < this.game.width; x++)
			for (var y = 0; y < this.game.height; y++)
				obj.tiles[x][y] = this.game.tiles[x][y].type;

		obj.crates = [];
		for (var x = 0; x < this.game.width; x++)
			for (var y = 0; y < this.game.height; y++)
				if (this.crates[x][y])
					obj.crates.push({ x: x, y: y, t: this.crates[x][y] - 1 });

		obj.tools = true;
		obj.events = [];

		for (var i = 0; i < this.logic.length; i++)
			this.logic[i].index = i;
		for (var i = 0; i < this.logic.length; i++)
			obj.events.push(this.logic[i].compile(this.game));

		return obj;
	},

	export: function() {
		return JSON.stringify(this.compile());
	},

	save: function() {
		var obj = {};
		obj.tiles = new Array(this.game.width);
		for (var i = 0; i < obj.tiles.length; i++)
			obj.tiles[i] = new Array(this.game.height);
		for (var x = 0; x < this.game.width; x++)
			for (var y = 0; y < this.game.height; y++)
				obj.tiles[x][y] = this.game.tiles[x][y].type;

		obj.crates = this.crates;

		for (var i = 0; i < this.logic.length; i++)
			this.logic[i].index = i;
		obj.logic = new Array(this.logic.length);
		for (var i = 0; i < obj.logic.length; i++) {
			obj.logic[i] = {};
			for (var key in this.logic[i])
				if (key === 'inputs')
					obj.logic[i][key] = this.logic[i].getInputs();
				else
					obj.logic[i][key] = this.logic[i][key];
		}

		return obj;
	},

	load: function(obj) {

		if (obj.tiles) {
			for (var x = 0; x < this.game.width; x++)
				for (var y = 0; y < this.game.height; y++)
					this.game.tiles[x][y].type = obj.tiles[x][y];
		}

		if (obj.crates) this.crates = obj.crates;
		if (obj.logic) {
			this.logic = new Array(obj.logic.length);
			for (var i = 0; i < this.logic.length; i++) {
				this.logic[i] = new Item(0, 0, 0) 
				for (var key in obj.logic[i])
					this.logic[i][key] = obj.logic[i][key];
			}
		}

		for (var i = 0; i < this.logic.length; i++)
			for (var j = 0; j < this.logic[i].inputs.length; j++)
				this.logic[i].inputs[j] = this.logic[this.logic[i].inputs[j]];

	}
}

var editorMenu = {

	tiles: [ 
		[ 'floor', 0 ],
		[ 'wall', 15 ],
		[ 'pit', 85 ],
		[ 'button', 47 ],
		[ 'block', 23 ],
		[ 'block_up', 55 ],
		[ 'block_right', 63 ],
		[ 'block_down', 71 ],
		[ 'block_left', 79 ],
		[ 'dispenser', 39 ],
		[ 'target', 31 ],
		[ 'mirror', 95 ],
		[ 'sensor', 103 ],
		[ 'spawn', 111 ]
	],

	open: function() {
		if (!this.panel)
			this.panel = cq(200, 111);
		if (!this.tab)
			this.tab = 0;
		if (!this.tileSelected)
			this.tileSelected = 0;
		if (!this.logicSelected)
			this.logicSelected = 0;
	},

	closed: function() {
		editorState.drawingTile = this.tiles[this.tileSelected][0];
	},

	step: function() {

	},

	draw: function() {
		this.panel.clear();
		this.panel.fillStyle('#cccccc').fillRect(0, 0, 200, 100).fillStyle('#aaaaaa').fillRect(0, 100, 70, 11);
		var x = 1;
		for (var i = 0; i < 'Menu (space)'.length; i++) {
			index = Font.line.indexOf('Menu (space)'.charAt(i));
			if (index >= 0) {
				this.panel.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), 101);
				x += Font.widths[index] + 1;
			}
		}

		var titles = [ 'Tiles', 'Logic', 'Test', 'File' ];
		for (var j = 0; j < titles.length; j++) {
			x = 2 + j * 40;
			this.panel.fillStyle(this.tab == j ? '#bbbbbb' : '#aaaaaa').fillRect(x, 2, 38, 11);
			for (var i = 0; i < titles[j].length; i++) {
				index = Font.line.indexOf(titles[j].charAt(i));
				if (index >= 0) {
					this.panel.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), 2);
					x += Font.widths[index] + 1;
				}
			}
		}

		var x, y;
		if (this.tab === 0) {
			for (var i = 0; i < this.tiles.length; i++) {
				x = 2 + i % 10 * 20;
				y = 20 + Math.floor(i / 10) * 40;
				this.panel.drawFrame(app.images.tiles, this.tiles[i][1], x, y);
				var index = Font.line.indexOf('QWERTYUASDFGHJ'.charAt(i));
				this.panel.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), y);
				if (i === this.tileSelected) {
					this.panel.beginPath();
					this.panel.moveTo(x - 0.5, y - 0.5);
					this.panel.lineTo(x + 16.5, y - 0.5);
					this.panel.lineTo(x + 16.5, y + 32.5);
					this.panel.lineTo(x - 0.5, y + 32.5);
					this.panel.lineTo(x - 0.5, y - 0.5);
					this.panel.strokeStyle('#ff0000').lineWidth(1).stroke();
				}
			}
		} else if (this.tab === 1) {
			for (var i = 0; i < 6; i++) {
				x = 2 + i * 20;
				y = 20;
				var index = Font.line.indexOf('XCVBNM'.charAt(i));
				this.panel.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), y);
				this.panel.drawFrame(app.images.logic, i, x, y + 10);
				if (i === this.logicSelected) {
					this.panel.beginPath();
					this.panel.moveTo(x - 0.5, y + 9.5);
					this.panel.lineTo(x + 16.5, y + 9.5);
					this.panel.lineTo(x + 16.5, y + 26.5);
					this.panel.lineTo(x - 0.5, y + 26.5);
					this.panel.lineTo(x - 0.5, y + 9.5);
					this.panel.strokeStyle('#ff0000').lineWidth(1).stroke();
				}
			}
		} else if (this.tab === 3) {
			var buttons = [ 'Clear', 'Save', 'Load', 'Export', 'Main menu' ];
			for (var j = 0; j < 5; j++) {
				x = 2;// + j * 40;
				y = 20 + j * 13;
				this.panel.fillStyle('#aaaaaa').fillRect(x, y, 50, 11);
				for (var i = 0; i < buttons[j].length; i++) {
					index = Font.line.indexOf(buttons[j].charAt(i));
					if (index >= 0) {
						this.panel.drawFrame(app.images.font, index, x - (index == 9 ? 2 : 0), y);
						x += Font.widths[index] + 1;
					}
				}
			}
		}
	},

	click: function(event) {
		if (event.x >= 2 && event.y >= 2 && event.x < 40 && event.y < 13) this.tab = 0;
		if (event.x >= 42 && event.y >= 2 && event.x < 80 && event.y < 13) this.tab = 1;
		if (event.x >= 122 && event.y >= 2 && event.x < 160 && event.y < 13) this.tab = 3;
		if (event.x >= 82 && event.y >= 2 && event.x < 120 && event.y < 13) {
			//this.tab = 2;
			editorState.testing = true;
			editorState.testGame.loadLevel(app, editorState.compile(), true, true);
		}

		if (event.x >= 0 && event.y >= 100 && event.x < 70 && event.y < 111) {
			editorState.editorOpen = false;
			this.closed();
		}

		var x, y;
		if (this.tab === 0) {
			for (var i = 0; i < this.tiles.length; i++) {
				x = 2 + i % 10 * 20;
				y = 20 + Math.floor(i / 10) * 40;
				if (event.x >= x && event.y >= y && event.x < x + 16 && event.y < y + 32) {
					this.tileSelected = i;
					break;
				}
			}
		} else if (this.tab === 1) {
			for (var i = 0; i < 6; i++) {
				x = 2 + i * 20;
				y = 20;
				if (event.x >= x && event.x < x + 16 && event.y >= y && event.y < y + 26)
					this.logicSelected = i;
			}
		} else if (this.tab === 3) {
			for (var j = 0; j < 5; j++) {
				x = 2;// + j * 40;
				y = 20 + j * 13;
				if (event.x >= x && event.y >= y && event.x < x + 50 && event.y < y + 11) {
					if (j === 0) {
						if (window.confirm('Do you really want to clear current level?')) {
							for (var i = 0; i < editorState.game.width; i++) {
								for (var j = 0; j < editorState.game.height; j++) {
									editorState.game.tiles[i][j].type = 'floor';
									editorState.game.tiles[i][j].target = null;
									editorState.crates[i][j] = 0;
								}
							}
							for (var i = 0; i < editorState.game.width; i++) {
								editorState.game.tiles[i][0].type = 'wall';
								editorState.game.tiles[i][editorState.game.height - 1].type = 'wall';
							}
							for (var i = 0; i < editorState.game.height; i++) {
								editorState.game.tiles[0][i].type = 'wall';
								editorState.game.tiles[editorState.game.width - 1][i].type = 'wall';
							}
							editorState.logic = [];
						}
					} else if (j === 1) {
						var string = JSON.stringify(editorState.save());
						console.log('saved size: ' + string.length)
						string = Base64.encode(LZV.encode(string));
						console.log('Compressed size: ' + string.length);
						dataState.show(editorState, 'Editor data, copy for sharing.', string, false);
					} else if (j === 2) {
						dataState.show(editorState, 'Paste editor data here.', 'paste here', true);
					} else if (j === 3) {
						var string = editorState.export();
						console.log('Exported size: ' + string.length)
						string = Base64.encode(LZV.encode(string));
						console.log('Compressed size: ' + string.length);
						dataState.show(editorState, 'Level data, copy for sharing.', string, false);
					} else if (j === 4) {
						app.setState(mainMenuState);
					}
					break;
				}
			}
		}
	},

	keydown: function(event) {
		if (event.key === 'q') { this.tab = 0; this.tileSelected = 0; }
		if (event.key === 'w') { this.tab = 0; this.tileSelected = 1; }
		if (event.key === 'e') { this.tab = 0; this.tileSelected = 2; }
		if (event.key === 'r') { this.tab = 0; this.tileSelected = 3; }
		if (event.key === 't') { this.tab = 0; this.tileSelected = 4; }
		if (event.key === 'y') { this.tab = 0; this.tileSelected = 5; }
		if (event.key === 'u') { this.tab = 0; this.tileSelected = 6; }
		if (event.key === 'a') { this.tab = 0; this.tileSelected = 7; }
		if (event.key === 's') { this.tab = 0; this.tileSelected = 8; }
		if (event.key === 'd') { this.tab = 0; this.tileSelected = 9; }
		if (event.key === 'f') { this.tab = 0; this.tileSelected = 10; }
		if (event.key === 'g') { this.tab = 0; this.tileSelected = 11; }
		if (event.key === 'h') { this.tab = 0; this.tileSelected = 12; }
		if (event.key === 'j') { this.tab = 0; this.tileSelected = 13; }
		editorState.drawingTile = this.tiles[this.tileSelected][0];
		if (event.key === 'x') { this.tab = 1; this.logicSelected = 0; }
		if (event.key === 'c') { this.tab = 1; this.logicSelected = 1; }
		if (event.key === 'v') { this.tab = 1; this.logicSelected = 2; }
		if (event.key === 'b') { this.tab = 1; this.logicSelected = 3; }
		if (event.key === 'n') { this.tab = 1; this.logicSelected = 4; }
		if (event.key === 'm') { this.tab = 1; this.logicSelected = 5; }
	}
}