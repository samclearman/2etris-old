var DEBUG = false;

var GRID_H = 34
var BLOCK_SIZE = 20;
var FREEZE_DELAY = 1;
var TURBO_MULTIPLIER = 4;
var RUNNING = true;

var CONTROLS = {white: {rotate: 83, left: 81, right: 69, turbo: 87},
                black: {rotate: 38, left: 37, right: 39, turbo: 40}};

var SHAPES = [
    
]
var BLOCKED = false;


function addPts(p,q) {
    return({x: p.x + q.x, y: p.y + q.y});
}

function scalePt(p,s) {
    return({x: p.x * s, y: p.y * s});
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
    
    DEBUG = {}
    DEBUG.entities = entities;
    
    var g = new grid();
    entities.push(g);
    
    tetromino.prototype.grid = function() { return g; };
    tetromino.generate = function(color) {
        if (color == "black") {
            var y = 0;
            var v = {x: 0, y: BLOCK_SIZE};
        }
        if (color == "white") {
            var y = GRID_H * BLOCK_SIZE;
            var v = {x: 0, y: (-1 * BLOCK_SIZE)};
        }
        entities.push(new tetromino(false,5*BLOCK_SIZE,y,v,color));
        
    }
    
    tetromino.generate("black");
    tetromino.generate("white");
    
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
        if (!RUNNING) { return true }
        if (BLOCKED) { return false }
        BLOCKED = true
        var now = new Date().getTime();
        var delta = (now - lastFrame) / 1000;
        update(delta);
        draw();
        render();
        lastFrame = now;
        BLOCKED = false
    }
    
    var loopId = setInterval(loop, 16);
    
}


/****************************
*                           *
*   Grid class              *
*                           *
****************************/

function grid() {
    this.rows = 34
    this.cols = 11
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
                var color = "black"
            } else {
                var color = "white"
            }
            new block((col * BLOCK_SIZE), (row * BLOCK_SIZE), color, "bgBlocks").drawOn(layers);
        }
    }
}

grid.prototype.checkCollisions = function(piece) {
    var pieceType = piece.color == "black" ? 0 : 1;
    for (var i = 0; i < piece.blocks.length; i++) {
        for (corner of ["NW","NE","SW","SE"]) {
            var row = Math.floor(piece.blocks[i][corner]().y / BLOCK_SIZE);
            var col = Math.floor(piece.blocks[i][corner]().x / BLOCK_SIZE);
            if (row < 0 || row > GRID_H - 1) {
                continue;
            }
            
            if (this.state[row][col] == pieceType) {
                return true;
            }
        }
    }
    return false;
}

grid.prototype.freeze = function(piece) {
    var pieceType = piece.color == "black" ? 0 : 1;
    var testRows = []
    for (var i = 0; i < piece.blocks.length; i++) {
        row = Math.floor(piece.blocks[i].center().y / BLOCK_SIZE);
        col = Math.floor(piece.blocks[i].center().x / BLOCK_SIZE);
        if (row < 0 || row > GRID_H - 1) {RUNNING = false; console.log("game over");}
        this.state[row][col] = pieceType;
        testRows.push(row);
    }
    
    testRows =  testRows.sort().filter(function(item, pos) {
        return !pos || item != testRows[pos - 1];
    });
    if (pieceType == 0) { testRows = testRows.reverse(); }
    
    // Check for complete rows:
    for (var i = 0; i < testRows.length; i++) {
        var row = testRows[i];
        if (this.state[row].every(function(cell,i,ary){return(cell == pieceType)})) {
            this.state.splice(row,1);
            if (pieceType == 0) {
                testRows = testRows.map(function(row,i,ary){return(row + 1)});
                this.state.splice(0,0,[1,1,1,1,1,1,1,1,1,1,1]);
            }
            if (pieceType == 1) {
                testRows = testRows.map(function(row,i,ary){return(row - 1)});
                this.state.push([0,0,0,0,0,0,0,0,0,0,0]);
            }
            
        }
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
    this.shape = shape || [[-1,0],[0,0],[0,1],[1,0]];
    this.blocks = [];
    this.turbo = 1;
    for(var i=0; i < this.shape.length; i++) {
        blk = new block(this.x + (this.shape[i][0] * BLOCK_SIZE) , this.y + (this.shape[i][1] * BLOCK_SIZE) ,color)
        this.blocks.push(blk)
    }
    
    var that = this;
    this.keyDownListener = function(e) { that.handleKeyDown(e);};
    this.keyUpListener = function(e) { that.handleKeyUp(e,that);};
    window.addEventListener("keyup", this.keyUpListener);
    window.addEventListener("keydown", this.keyDownListener);
    
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
    
    this.x += this.velocity.x * delta * this.turbo;
    this.y += this.velocity.y * delta * this.turbo;
    this.positionBlocks();
    
    if (this.grid().checkCollisions(this)) {
        this.x -= this.velocity.x * delta * this.turbo;
        this.y -= this.velocity.y * delta * this.turbo;
        this.y = Math.round(this.y / BLOCK_SIZE) * BLOCK_SIZE;
        this.positionBlocks();
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

tetromino.prototype.handleKeyDown = function(e) {
    switch(e.keyCode) {
    case CONTROLS[this.color]["turbo"]:
        this.turbo = TURBO_MULTIPLIER;
        break;
    }
    
};

tetromino.prototype.handleKeyUp = function(e) {
    switch(e.keyCode) {
    case CONTROLS[this.color]["rotate"]:
        this.rotate("L");
        break;
    case CONTROLS[this.color]["left"]:
        this.shift("L");
        break;
    case CONTROLS[this.color]["right"]:
        this.shift("R");
        break;
    case CONTROLS[this.color]["turbo"]:
        this.turbo = 1;
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
    this.positionBlocks();
    if (this.grid().checkCollisions(this)) {
        this.x -= dir.x;
        this.y -= dir.y;
        this.positionBlocks();
    }
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
    window.removeEventListener("keyup", this.keyUpListener);
    window.removeEventListener("keydown", this.keyDownListener);
    tetromino.generate(this.color);
}


