function EntitySpell(x, y, spell) { 
	EntityBase.call(this, x + 0.25, y + 0.25, 0.5, 0.5);

	this.spell = spell;
	this.interacts = true;
}

EntitySpell.prototype = Object.create(EntityBase.prototype);
EntitySpell.constructor = EntitySpell;

EntitySpell.prototype.update = function() {
	if (this.alive)
		StateGame.forOverlap(this, function (other) {
			if (other.interacts && other.alive && other.collectsSpells) {
				other.spells[this.spell].has = true;
				this.kill();
			}
			
		});
};

EntitySpell.prototype.kill = function() {
	this.alive = false;
};
EntitySpell.prototype.render = function(layer, dx, dy) {
	layer.drawImage(
		WizardGame.images.spells,
		this.spell * 16,
		0, 16, 16,
		this.x * WizardView.tileScale - dx,
		this.y * WizardView.tileScale - dy,
		this.width * WizardView.tileScale,
		this.height * WizardView.tileScale
	);
};