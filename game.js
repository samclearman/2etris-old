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
	entities.push({
		drawOn: function(ct) {
			ct.fillStyle = "white";
			ct.fillRect(0,0,390,400);
			// ct.fillStyle = "grey";
			// ct.fillRect(390,0,20,400);
			ct.fillStyle = "black";
			ct.fillRect(410,0,400,400);
		},
		update: function(delta) { }
	})
	entities.push(new block(410,320))
	entities.push(new block(310,100))
	entities.push(new block(390,220,undefined,"white","NE"))
	
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

	function redraw() {
		for(var i = 0; i < entities.length; i++) {
			entities[i].drawOn(ctx);
		}
	}

	function loop(){
		now = new Date().getTime();
		delta = (now - lastFrame) / 1000;
		update(delta);
		redraw();
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

grid.prototype.drawOn = function(ctx) {
	
}

function block(x,y,velocity,color, shadowDirection) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = BLOCK_SIZE;
	this.height = BLOCK_SIZE;
	this.color = color || "black";
	this.shadowDirection = shadowDirection || "SW";
	this.velocity = velocity || {x: 0, y: 0};
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

block.prototype.drawOn = function(ctx) {
	ctx.fillStyle = SHADOW_COLOR;
	ctx.beginPath();
	var pts = this.shadowPoints();
	ctx.moveTo(pts[0].x, pts[0].y);
	for(var i=1; i<pts.length; i++) {
		ctx.lineTo(pts[i].x, pts[i].y);
	}
	ctx.fill();
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
};
