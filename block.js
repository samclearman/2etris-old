/****************************
*                           *
*   Block class             *
*                           *
****************************/

function block(x,y,color, blockLayer, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || BLOCK_SIZE;
    this.height = height || BLOCK_SIZE;
    this.color = color || "black";
    this.blockLayer = blockLayer || "blocks";
};

block.prototype.screenX = function() { return this.x; };
block.prototype.screenY = function() { return this.y; };

block.prototype.NW = function() {
    return {x: this.screenX() + 1, y: this.screenY()};
};
block.prototype.NE = function() {
    return {x: this.screenX() + this.width - 1, y: this.screenY()};
};
block.prototype.SW = function() {
    return {x: this.screenX() + 1, y: this.screenY() + this.height};
};
block.prototype.SE = function() {
    return {x: this.screenX() + this.width - 1, y: this.screenY() + this.height};
};

block.prototype.center = function() {
    return {x: this.screenX() + (this.width / 2),
            y: this.screenY() + (this.height / 2)};
};

block.prototype.update = function(delta) { };

block.prototype.drawOn = function(layers) {
    var that = this;
    layers[this.blockLayer].drawings.push(function(ctx) {
        ctx.fillStyle = that.color;
        ctx.fillRect(that.screenX(), that.screenY(), that.width, that.height);
    });
};

block.prototype.destroy = function() { this.destroyed = true; };
