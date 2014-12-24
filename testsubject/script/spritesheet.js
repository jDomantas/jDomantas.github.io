function Spritesheet(image, width, height) {
	this.frameWidth = width;
	this.frameHeight = height;
	this.columns = Math.floor(image.width / width);
	this.rows = Math.floor(image.height / height);
	this.image = image;
}

Spritesheet.prototype = {
	region: function(frame) {
		return [
				this.frameWidth * (frame % this.columns), 
				this.frameHeight * Math.floor(frame / this.columns), 
				this.frameWidth, 
				this.frameHeight
			];
	}
}
