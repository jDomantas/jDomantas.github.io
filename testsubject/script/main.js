//var div = document.getElementById('container');
//div.style['margin-top'


var app = playground({

	width: 768,
	height: 576,
	container: document.getElementById('container'),
	scale: 16,
	pixelScale: 2,
	smoothing: false,
	preventKeyboardDefault: true,

	create: function() {
		this.screen = cq(this.width / this.pixelScale, this.height / this.pixelScale);
		this.overlay = cq(this.width / this.pixelScale, this.height / this.pixelScale);
		this.loadImages('tilesbase', 'player', 'crate', 'font', 'weapon', 'button', 'bg', 'title', 'logic', 'settings');
		this.loadSounds('death', 'level', 'press', 'release', 'teleport');
	},

	ready: function() {
		this.images.tiles = new Spritesheet(textures.loadTextures(this.images.tilesbase), 16, 32);
		this.images.player = new Spritesheet(this.images.player, 12, 13);
		this.images.crate = new Spritesheet(this.images.crate, 12, 16);
		this.images.font = new Spritesheet(this.images.font, 8, 10);
		this.images.weapon = new Spritesheet(this.images.weapon, 8, 5);
		this.images.button = new Spritesheet(this.images.button, 120, 30);
		this.images.logic = new Spritesheet(this.images.logic, 16, 16);

		this.layer.canvas.style.position = 'absolute';
		this.layer.canvas.style.left = '0';
		this.layer.canvas.style.top = '0';

		this.dataContainer = document.createElement('div');
		this.dataContainer.contentEditable = true;
		this.dataContainer.style['overflow-y'] = 'scroll';
		this.dataContainer.style.display = 'none';
		this.dataContainer.style.fontSize = '8px';
		this.dataContainer.style.fontFamily = 'Courier New';
		this.dataContainer.style.position = 'absolute';
		this.dataContainer.style.marginTop = '50px';
		this.dataContainer.style.marginLeft = '10px';
		this.dataContainer.style.width = (this.width - 20) + 'px';
		this.dataContainer.style.height = (this.height - 160) + 'px';
		this.dataContainer.style.wordWrap = 'break-word';
		this.container.appendChild(this.dataContainer);

		this.setState(mainMenuState);
	},

	step: function(delta) {
		//if (!this.state)
		//	this.game.update(this);
	},

	render: function(delta) {
		this.screen.clear('#000');
		this.overlay.clear();
		//this.game.draw(this);
		if (this.state)
			if (this.state.draw)
				this.state.draw();
		this.layer.drawImage(this.screen.canvas, 0, 0, this.width, this.height);
		this.layer.a(0.9);
		this.layer.drawImage(this.overlay.canvas, 0, 0, this.width, this.height);
		this.layer.a(1);
	},

	mousedown: function(event) { },

	mouseup: function(event) { },

	mousemove: function(event) { },

	keydown: function(event) { },

	keyup: function(event) { },

	showData: function(string) {
		this.dataContainer.innerHTML = string;
		this.dataContainer.style.display = 'inline';
	},

	selectData: function() {
		var text = this.dataContainer, range, selection;    
		if (document.body.createTextRange) {
			range = document.body.createTextRange();
			range.moveToElementText(text);
			range.select();
		} else if (window.getSelection) {
			selection = window.getSelection();        
			range = document.createRange();
			range.selectNodeContents(text);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	},

	hideData: function() {
		this.dataContainer.style.display = 'none';
	}
});


