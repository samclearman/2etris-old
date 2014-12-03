var BLOCK_SIZE = 20;
var FREEZE_DELAY = 1;
var RUNNING = true;


function addPts(p,q) {
    return({x: p.x + q.x, y: p.y + q.y});
}

function mul(M,v) {
    return([(M[0][0] * v[0]) + (M[0][1] * v[1]),
            (M[1][0] * v[0]) + (M[1][1] * v[1])]);
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
    tetromino.generate = function(color) {
        entities.push(new tetromino(false,5*BLOCK_SIZE,0,{x: 0, y: 20}));
    };
    
    tetromino.generate("black");
    
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

grid.prototype.update = function(delta) {}

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
    for (var i = 0; i < piece.blocks.length; i++) {
        for (corner of ["NW","NE","SW","SE"]) {
            row = Math.floor(piece.blocks[i][corner]().y / BLOCK_SIZE);
            col = Math.floor(piece.blocks[i][corner]().x / BLOCK_SIZE);
            if (this.state[row][col] == pieceType) {
                return true;
            }
        }
    }
    return false;
}

grid.prototype.freeze = function(piece) {
    var pieceType = piece.color == "black" ? 0 : 1;
    for (var i = 0; i < piece.blocks.length; i++) {
        row = Math.floor(piece.blocks[i].center().y / BLOCK_SIZE);
        col = Math.floor(piece.blocks[i].center().x / BLOCK_SIZE);
        this.state[row][col] = pieceType;
    }
};

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

block.prototype.center = function() {
    return {x: this.screenX() + (this.width / 2),
            y: this.screenY() + (this.height / 2)};
};

block.prototype.update = function(delta) { };

block.prototype.drawOn = function(layers) {
    var that = this;
    layers[this.blockLayer].drawings.push(function(ctx) {   
        ctx.fillStyle = that.color;
        // ctx.strokeStyle = that.color;
        ctx.fillRect(that.screenX(), that.screenY(), that.width, that.height);
        // ctx.strokeRect(that.screenX(), that.screenY(), that.width, that.height);
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
    this.shape = shape || [[-1,0],[0,0],[0,1],[1,0]]
    this.blocks = []
    for(var i=0; i < this.shape.length; i++) {
        blk = new block(this.x + (this.shape[i][0] * BLOCK_SIZE) , this.y + (this.shape[i][1] * BLOCK_SIZE) ,color)
        this.blocks.push(blk)
    }
    
    that = this;
    this.keyListener = function(e) { that.handleKeyUp(e); };
    window.addEventListener("keyup", this.keyListener);
}

tetromino.prototype.positionBlocks = function() {
    for(var i=0; i < this.blocks.length; i++) {
        this.blocks[i].x = Math.floor(this.x) + (this.shape[i][0] * BLOCK_SIZE);
        this.blocks[i].y = Math.floor(this.y) + (this.shape[i][1] * BLOCK_SIZE);
    }
};

tetromino.prototype.update = function(delta) {
    if (this.frozen && new Date().getTime() - this.frozen > 1000 * FREEZE_DELAY) {
        this.grid().freeze(this);
        this.destroy();
    }
    
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    this.positionBlocks();
    
    if (this.grid().checkCollisions(this)) {
        this.x -= this.velocity.x * delta;
        this.y -= this.velocity.y * delta;
        this.frozen = this.frozen || new Date().getTime();
    } else {
        this.frozen = false;
    } 
};

tetromino.prototype.drawOn = function(layers) {
    for (var i=0; i < this.blocks.length; i++) {
        this.blocks[i].drawOn(layers);
    }
};

tetromino.prototype.handleKeyUp = function(e) {
    switch(e.keyCode) {
    case 38: // Up
        this.rotate("L");
        break;
    case 37: //
        this.shift("L");
        break;
    case 39:
        this.shift("R");
        break;
    }
    
};

tetromino.prototype.shift = function(dir) {
    switch (dir) {
    case "L":
        dir = {x: -1 * BLOCK_SIZE, y: 0};
        break;
    case "R":
        dir = {x: BLOCK_SIZE, y: 0};
        break;
    }
    this.x += dir.x;
    this.y += dir.y;
};

tetromino.prototype.rotate = function(M) {
    switch (M) {
    case "L":
        M = [[0,-1],[1,0]];
        break;
    case "R":
        M = [[0,1],[-1,0]];
        break;
    }
    for(var i=0; i < this.shape.length; i++) {
        this.shape[i] = mul(M,this.shape[i]);
    }
};

tetromino.prototype.destroy = function() {
    this.destroyed = true;
    window.removeEventListener("keyup", this.keyListener);    
    tetromino.generate(this.color);
}


