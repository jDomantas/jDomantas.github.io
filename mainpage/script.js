$(this).ready(function() {

	function createTile(tile) {
		
		var div = $("<div></div>").addClass("tile");
		if (tile.wide) div.addClass("wide");
		if (tile.text) {
			div.append("<p>" + tile.text + "</p>");
			if (tile.dark) div.css("color", "black");
		}
		if (tile.image)
			div.css("background-image", "url(mainpage/resources/" + tile.image + ")");

		if (tile.link) {
			div.click(function() {
				window.location.href = tile.link;
			});
		}

		if (tile.noAntiAlias) {
			div.css("image-rendering", "optimizeSpeed");
			div.css("image-rendering", "-moz-crisp-edges");
			div.css("image-rendering", "-o-crisp-edges");
			div.css("image-rendering", "-webkit-optimize-contrast");
			div.css("image-rendering", "pixelated");
			div.css("image-rendering", "optimize-contrast");
			div.css("-ms-interpolation-mode", "nearest-neighbor");
		}

		$("#container").append(div);
	}

	console.log("html width: " + $("html").width());
	console.log("container width: " + $("#container").width());
	
	console.log("tiles to be displayed: " + jDomantasHomeTiles.length);
	
	var htmlWidth = $("html").width();
	var fontSize = Math.floor(htmlWidth / 44 * 0.9);
	$("html").css("font-size", fontSize);

	var rtime = new Date(1, 1, 2000, 12, 0, 0);
	var timeout = false;
	var delta = 100;
	$(window).resize(function() {
		rtime = new Date();
		if (timeout === false) {
			timeout = true;
			setTimeout(resizeend, delta);
		}
	});

	function resizeend() {
		if (new Date() - rtime < delta) {
			setTimeout(resizeend, delta);
		} else {
			timeout = false;
			var htmlWidth = $("html").width();
			var fontSize = Math.floor(htmlWidth / 44 * 0.9);
			$("html").css("font-size", fontSize);
		}
	}

	/*$(window).resize(function() {
		var htmlWidth = $("html").width();
		var fontSize = Math.floor(htmlWidth / 44 * 0.9);
		$("html").css("font-size", fontSize);
	});*/

	for (var i = 0; i < jDomantasHomeTiles.length; i++)
		createTile(jDomantasHomeTiles[i]);
});