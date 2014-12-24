var ObjectBase = {
	intersects: function(x, y, w, h) {
		return this.pos.x < x + w && x < this.pos.x + this.size.x &&
			this.pos.y < y + h && y < this.pos.y + this.size.y;
	},

	getCenter: function(obj) {
		return { x: obj.pos.x + obj.size.x / 2, y: obj.pos.y - obj.pos.z - obj.size.y / 2 - obj.size.z / 2 }
	},

	getInnerMirrors: function(obj) {
		if (obj.getInnerMirrors)
			return obj.getInnerMirrors();
		return [];
	}
}