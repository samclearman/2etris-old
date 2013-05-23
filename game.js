var SHADOW_SIZE = 20;
var BLOCK_SIZE = 100;
var SHADOW_COLOR = "rgb(128,128,128)";
var RUNNING = true;

function addPts(p,q) {
	return({x: p.x + q.x, y: p.y + q.y})
}



function game() {
	
	var canvas = document.getElementById('game');
	var ctx = canvas.getContext("2d");
	var lastFrame = new Date().getTime();
	
	var entities = [];
	var layers = {
		bgShadows: {z: 0, drawings: []},
		bgBlocks: {z: 1, drawings: []},
		shadows: {z: 2, drawings: []},
		blocks: {z: 3, drawings: []}
	}
	
	entities.push(new grid());
	// entities.push(new block(420,300));
	entities.push(new block(320,100));
	entities.push(new block(400,220,undefined,"white","NE"));
	
	function update(delta) {
		
		for(var i=0; i<entities.length; i++) {
			entities[i].update(delta);
		}
		
		for(var i = entities.length - 1; i >= 0; i--) {
			if (entities[i].destroyed) {
				entities.splice(i,1);
			}
		}
				
	}

	function draw() {
		for(var i = 0; i < entities.length; i++) {
			entities[i].drawOn(layers);
		}
	}
	
	function render() {
		for (var layerName in layers) {
			for (var i=0; i < layers[layerName].drawings.length; i++) {
				layers[layerName].drawings[i](ctx);
			}
		}
	}

	function loop(){
		now = new Date().getTime();
		delta = (now - lastFrame) / 1000;
		update(delta);
		draw();
		render();
		lastFrame = now;
	}
	
	var loopId = setInterval(loop, 10);
	
}


function grid() {
	this.state = [[1,1,1,1,0,0,0,0],
				  [1,1,1,1,0,0,0,0],
				  [1,1,1,1,0,0,0,0],
				  [1,1,1,1,0,0,0,0]];
}

grid.prototype.update = function() {}

grid.prototype.drawOn = function(layers) {
	for(var row=0; row < this.state.length; row++) {
		for (var col = 0; col < this.state[row].length; col ++) {
			if (this.state[row][col] == 0) {
				color = "black"
				shadow = "SW"
				offset = {x: SHADOW_SIZE, y: 0}
			} else {
				color = "white"
				shadow = "NE"
				offset = {x: 0, y: SHADOW_SIZE}
			}
			new block((col * 100) + offset.x, (row * 100) + offset.y, 0, color, shadow, "bgBlocks", "bgShadows").drawOn(layers);
		}
	}
}

function block(x,y,velocity,color, shadowDirection, blockLayer, shadowLayer) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = BLOCK_SIZE;
	this.height = BLOCK_SIZE;
	this.color = color || "black";
	this.shadowDirection = shadowDirection || "SW";
	this.velocity = velocity || {x: 0, y: 0};
	this.blockLayer = blockLayer || "blocks";
	this.shadowLayer = shadowLayer || "shadows";
};

block.prototype.NW = function() {
	return {x: this.x, y: this.y};
};
block.prototype.NE = function() {
	return {x: this.x + this.width, y: this.y};
};
block.prototype.SW = function() {
	return {x: this.x, y: this.y + this.height};
};
block.prototype.SE = function() {
	return {x: this.x + this.width, y: this.y + this.height};
};

block.prototype.shadowPoints = function() {
	var points = [];
	var offset; var route;
	
	if (this.shadowDirection == "SW") {
		offset = {x: -SHADOW_SIZE, y: SHADOW_SIZE};
		route = ["NW", "SW", "SE"];
	} else if (this.shadowDirection == "NE") {
		offset = {x: SHADOW_SIZE, y: -SHADOW_SIZE};
		route = ["NW", "NE", "SE"];
	}
	points.push(this[route[0]]());
	for(var i=0; i<route.length; i++) {
		points.push(addPts(this[route[i]](), offset));
	}
	points.push(this[route[route.length - 1]]());
	return points;
};

block.prototype.update = function(delta) {
	this.x += delta * this.velocity.x
	this.y += delta * this.velocity.y
};

block.prototype.drawOn = function(layers) {
	var that = this;
	layers[this.shadowLayer].drawings.push(function(ctx) {
		ctx.fillStyle = SHADOW_COLOR;
		ctx.beginPath();
		var pts = that.shadowPoints();
		ctx.moveTo(pts[0].x, pts[0].y);
		for(var i=1; i<pts.length; i++) {
			ctx.lineTo(pts[i].x, pts[i].y);
		}
		ctx.fill();
	});
	layers[this.blockLayer].drawings.push(function(ctx) {	
		ctx.fillStyle = that.color;
		ctx.fillRect(that.x, that.y, that.width, that.height);
	});
};
