var StateGame = {

	enter: function() {
		
		this.x = 1;
		this.y = 1;

		this.movement = { x: 0, y: 0 };

		this.playerDead = 0;
	},

	leave: function() {

	},

	step: function() {

		var scrollSpeed = 0.5;

		if (this.movement.x < 0) {
			this.movement.x -= scrollSpeed;
			if (this.movement.x <= -WizardView.width) { this.x--; this.movement.x = 0; }
		} else if (this.movement.x > 0) {
			this.movement.x += scrollSpeed;
			if (this.movement.x >= WizardView.width) { this.x++; this.movement.x = 0; }
		} else if (this.movement.y < 0) {
			this.movement.y -= scrollSpeed;
			if (this.movement.y <= -WizardView.height) { this.y--; this.movement.y = 0; }
		} else if (this.movement.y > 0) {
			this.movement.y += scrollSpeed;
			if (this.movement.y >= WizardView.height) { this.y++; this.movement.y = 0; }
		} else {
			// update all objects
			if (this.x >= 0 && this.y >= 0 && this.x < WizardGame.mapWidth && this.y < WizardGame.mapHeight) {
				var view = WizardGame.views[this.x][this.y];

				//console.log('objects: ' + view.objects.length);

				view.updateIneractiveTiles();

				WizardGame.lockTiles(
					this.x * WizardView.width, 
					this.y * WizardView.height, 
					(this.x + 1) * WizardView.width,
					(this.y + 1) * WizardView.height);

				for (var i = view.objects.length; i--; )
					view.objects[i].update();
				WizardGame.unlockTiles();
				WizardGame.player.update();

				// remove dead objects
				view.objects.sort(function(a, b) { if (a.alive === b.alive) return 0; else return (a.alive ? -1 : 1); });
				for (var i = view.objects.length; i--; )
					if (!view.objects[i].alive) {
						view.objects.splice(i, view.objects.length - i);
						break;
					}

				if (WizardGame.player.x + WizardGame.player.width / 2 < this.x * WizardView.width) 
					this.movement.x = -1;
				if (WizardGame.player.y + WizardGame.player.height / 2 < this.y * WizardView.height) 
					this.movement.y = -1;
				if (WizardGame.player.x + WizardGame.player.width / 2 > (this.x + 1) * WizardView.width) 
					this.movement.x = 1;
				if (WizardGame.player.y + WizardGame.player.height / 2 > (this.y + 1) * WizardView.height) 
					this.movement.y = 1;
			}
		}

		if (WizardGame.player.timeDead > 90) {
			this.x = 1;
			this.y = 1;
			WizardGame.player.x = 23.25;
			WizardGame.player.y = 16.25;
			WizardGame.player.alive = true;
		}
	},

	render: function() {

		WizardGame.screen.clear('#fff');

		var v = WizardGame.views[this.x][this.y];
		v.render(WizardGame.screen, 
			0 * WizardView.totalWidth - this.movement.x * WizardView.tileScale,
			0 * WizardView.totalHeight - this.movement.y * WizardView.tileScale);
		v = null;
		if (this.movement.x < 0) v = WizardGame.views[this.x - 1][this.y];
		if (this.movement.x > 0) v = WizardGame.views[this.x + 1][this.y];
		if (this.movement.y < 0) v = WizardGame.views[this.x][this.y - 1];
		if (this.movement.y > 0) v = WizardGame.views[this.x][this.y + 1];
		if (v != null)
			v.render(WizardGame.screen, 
				(v.x - this.x) * WizardView.totalWidth - this.movement.x * WizardView.tileScale,
				(v.y - this.y) * WizardView.totalHeight - this.movement.y * WizardView.tileScale);

		if (this.x >= 0 && this.y >= 0 && this.x < WizardGame.mapWidth && this.y < WizardGame.mapHeight) {
			var view = WizardGame.views[this.x][this.y];
			for (var i = view.objects.length; i--; )
				view.objects[i].render(WizardGame.screen, 
					this.x * WizardView.totalWidth + this.movement.x * WizardView.tileScale, 
					this.y * WizardView.totalHeight + this.movement.y * WizardView.tileScale);

			view = null;
			if (this.movement.x < 0) view = WizardGame.views[this.x - 1][this.y];
			if (this.movement.x > 0) view = WizardGame.views[this.x + 1][this.y];
			if (this.movement.y < 0) view = WizardGame.views[this.x][this.y - 1];
			if (this.movement.y > 0) view = WizardGame.views[this.x][this.y + 1];
			if (view != null)
				for (var i = view.objects.length; i--; )
					view.objects[i].render(WizardGame.screen, 
						this.x * WizardView.totalWidth + this.movement.x * WizardView.tileScale, 
						this.y * WizardView.totalHeight + this.movement.y * WizardView.tileScale);

			WizardGame.player.render(WizardGame.screen, 
				this.x * WizardView.totalWidth + this.movement.x * WizardView.tileScale, 
				this.y * WizardView.totalHeight + this.movement.y * WizardView.tileScale);
		}

		var x = (WizardGame.width) / 2 - 20;
		var y = 4;
		for (var i = 0; i < WizardGame.player.spells.length; i++) {
			if (WizardGame.player.spells[i].has) {
				// draw
				if (WizardGame.player.spells[i].has) {
					WizardGame.screen.drawImage(WizardGame.images.spells, 
						WizardGame.player.spells[i].icon * 16, 0, 16, 16,
						x, y, 16, 16);

					if (WizardGame.player.spells[i].cdleft > 0) {
						WizardGame.screen.drawImage(WizardGame.images.timer, 
							Math.floor(16 - WizardGame.player.spells[i].cdleft * 16 / WizardGame.player.spells[i].cooldown) * 16, 0, 16, 16,
							x, y, 16, 16);
					}
				}
				y += 20;
			}
		}
	},

	keydown: function(event) {
		if (this.movement.x === 0 && this.movement.y === 0)
			WizardGame.player.keyPress(event);
	},

	forOverlap: function(entity, callback) {
		var obj = this.currentView().objects;
		for (var i = obj.length; i--; )
			if (entity.intersects(obj[i]) && obj[i] !== entity)
				callback.call(entity, obj[i]);

		if (entity.intersects(WizardGame.player) && WizardGame.player !== entity)
			callback.call(entity, WizardGame.player);
	},

	currentView: function() {
		return WizardGame.views[this.x][this.y];
	}
};