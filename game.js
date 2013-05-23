var SHADOW_SIZE = 25;
var SHADOW_COLOR = "rgb(128,128,128)";

function addPts(p,q) {
	return({x: p.x + q.x, y: p.y + q.y})
}
var entities = [];

function game() {
	var canvas = document.getElementById('game');
	entities.push(new block())
	if (canvas.getContext){
		var ctx = canvas.getContext("2d");
		for(var i = 0; i < entities.length; i++) {
			entities[i].drawOn(ctx);
		}
	}
}

entities.push({
	drawOn: function(ctx) {
		ctx.fillStyle = "white";
		ctx.fillRect(0,0,400,400);
		ctx.fillStyle = "black";
		ctx.fillRect(400,0,400,400);
	}
})

function block() {
	this.x = 300;
	this.y = 100;
	this.width = 200;
	this.height = 200;
	this.color = "black";
	this.shadowDirection = "NE"
}

block.prototype.NW = function() {
	return {x: this.x, y: this.y};
}

block.prototype.NE = function() {
	return {x: this.x + this.width, y: this.y};
}
block.prototype.SW = function() {
	return {x: this.x, y: this.y + this.height};
}
block.prototype.SE = function() {
	return {x: this.x + this.width, y: this.y + this.height};
}

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
}

block.prototype.drawOn = function(ctx) {
	ctx.fillStyle = SHADOW_COLOR;
	ctx.beginPath();
	var pts = this.shadowPoints();
	console.log(pts);
	ctx.moveTo(pts[0].x, pts[0].y);
	for(var i=1; i<pts.length; i++) {
		ctx.lineTo(pts[i].x, pts[i].y);
	}
	ctx.fill();
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
}
