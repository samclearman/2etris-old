var BLOCK_SIZE = 20;
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
        bgBlocks: {z: 1, drawings: []},
        blocks: {z: 3, drawings: []}
    }
    
    var g = new grid();
    entities.push(g);
    tetromino.prototype.grid = function() { return g; };
    entities.push(new tetromino(false,false,false,{x: 0, y: 10}));
    // entities.push(new block(320,100));
    // entities.push(new block(400,220,undefined,"white","NE"));
    
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
            layers[layerName].drawings = [];
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
    
    var loopId = setInterval(loop, 16);
    
}


/****************************
*                           *
*   Grid class              *
*                           *
****************************/

function grid() {
    this.rows = 10
    this.cols = 20
    this.state = [[1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0]];
}

grid.prototype.update = function() {}

grid.prototype.drawOn = function(layers) {
    for(var row=0; row < this.state.length; row++) {
        for (var col = 0; col < this.state[row].length; col ++) {
            if (this.state[row][col] == 0) {
                color = "black"
            } else {
                color = "white"
            }
            new block((col * BLOCK_SIZE), (row * BLOCK_SIZE), color, "bgBlocks").drawOn(layers);
        }
    }
}

grid.prototype.checkCollisions = function(piece) {
    var pieceType = piece.color == "black" ? 0 : 1;
    if (pieceType == 0) {
        for (var i = 0; i < piece.blocks.length; i++) {
            row = Math.floor(piece.blocks[i].y / BLOCK_SIZE);
            col = Math.floor((piece.blocks[i].x + piece.blocks[i].width) / BLOCK_SIZE);
            if (0 <= row && row < this.rows && 0 <= col && col < this.cols) {
                if (this.state[row][col] == 0) {
                    piece.x -= ((piece.blocks[i].x + piece.blocks[i].width) - (col * BLOCK_SIZE));
                    return true;
                }
            }
        }
    }
    return false;
}


/****************************
*                           *
*   Block class             *
*                           *
****************************/

function block(x,y,color, blockLayer) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = BLOCK_SIZE;
    this.height = BLOCK_SIZE;
    this.color = color || "black";
    this.blockLayer = blockLayer || "blocks";
};

block.prototype.screenX = function() { return this.x; };
block.prototype.screenY = function() { return this.y; };

block.prototype.NW = function() {
    return {x: this.screenX(), y: this.screenY()};
};
block.prototype.NE = function() {
    return {x: this.screenX() + this.width, y: this.screenY()};
};
block.prototype.SW = function() {
    return {x: this.screenX(), y: this.screenY() + this.height};
};
block.prototype.SE = function() {
    return {x: this.screenX() + this.width, y: this.screenY() + this.height};
};


block.prototype.update = function(delta) { };

block.prototype.drawOn = function(layers) {
    var that = this;
    layers[this.blockLayer].drawings.push(function(ctx) {   
        ctx.fillStyle = that.color;
        ctx.fillRect(that.screenX(), that.screenY(), that.width, that.height);
    });
};



/****************************
*                           *
*   Tetromino class         *
*                           *
****************************/

function tetromino(shape, x, y, velocity, color) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = BLOCK_SIZE;
    this.height = BLOCK_SIZE;
    this.color = color || "black";
    this.velocity = velocity || {x: 0, y: 0};
    this.shape = shape || [[-1,-1],[0,0],[0,1],[1,0]]
    this.blocks = []
    for(var i=0; i < this.shape.length; i++) {
        blk = new block(this.x + (this.shape[i][0] * BLOCK_SIZE) , this.y + (this.shape[i][1] * BLOCK_SIZE) ,color)
        this.blocks.push(blk)
    }
}

tetromino.prototype.positionBlocks = function() {
    for(var i=0; i < this.blocks.length; i++) {
        this.blocks[i].x = this.x + (this.shape[i][0] * BLOCK_SIZE);
        this.blocks[i].y = this.y + (this.shape[i][1] * BLOCK_SIZE);
    }
}

tetromino.prototype.update = function(delta) {
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    this.positionBlocks();
    if (this.grid().checkCollisions(this)) {
        this.frozen = this.frozen || new Date().getTime();
    } else {
        this.frozen = false;
    }
    for (var i=0; i < this.blocks.length; i++) {
        this.blocks[i].update(delta);
        
    }
}

tetromino.prototype.drawOn = function(layers) {
    for (var i=0; i < this.blocks.length; i++) {
        this.blocks[i].drawOn(layers);
    }
}

