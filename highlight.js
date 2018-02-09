/****************************
*                           *
*   Highlight class         *
*                           *
****************************/

function highlight(x, y, height, width, rgb, duration) {
    this.x = x || 0;
    this.y = y || 0;
    this.height = height || 10;
    this.width = width || 10;
    this.rgb = rgb || '255,255,0';
    this.duration = duration || 1;

    this.color = "rgb(" + this.rgb + ")";
    this.created = new Date().getTime();
}

highlight.prototype.update = function(delta) {
    var elapsed = ((new Date().getTime() - this.created) / 1000);
    if (elapsed > this.duration) {
        this.destroy();
    } else {
        var alpha = 1 - (elapsed / this.duration);
        this.color = "rgba(" + this.rgb + "," + alpha + ")";
    }

}

highlight.prototype.destroy = function() { this.destroyed = true };

highlight.prototype.drawOn = function(layers) {
    new block(this.x, this.y, this.color, "effects", this.width, this.height).drawOn(layers);
};
