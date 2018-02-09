/****************************
*                           *
*   Grid class              *
*                           *
****************************/

var grid = function() {
        this.rows = 34;
        this.cols = 11;
        this.scoreboard = new scoreboard(this.score);
    }

grid.prototype.update = function(delta) {}

grid.prototype.set = function(row,col,color) {
    var G = this.G;
    G[row][col] = color;
    this.G = G;
}

grid.prototype.drawOn = function(layers) {
    for(var row=0; row < this.G.length; row++) {
        for (var col = 0; col < this.G[row].length; col ++) {
            if (this.G[row][col] == 0) {
                var color = "black"
            } else {
                var color = "white"
            }
            new block((col * BLOCK_SIZE), (row * BLOCK_SIZE), color, "bgBlocks").drawOn(layers);
        }
    }
}

grid.prototype.checkCollisions = function(piece, checkpoints) {
    var pieceType = piece._state['color'] == "black" ? 0 : 1;
    checkpoints = checkpoints || ["NW","NE","SW","SE"]
    for (var i = 0; i < piece.blocks.length; i++) {
        for (corner of checkpoints) {
            var row = Math.floor(piece.blocks[i][corner]().y / BLOCK_SIZE);
            var col = Math.floor(piece.blocks[i][corner]().x / BLOCK_SIZE);
            if (col < 0 || col >= GRID_W) {
                return true;
            }
            if (row < 0 || row >= GRID_H) {
                continue;
            }
            if (this.G[row][col] == pieceType) {
                return true;
            }
        }
    }
    return false;
}

grid.prototype.freeze = function(piece) {
    this.scoreboard.add(BLOCK_SCORE);

    var pieceType = piece.color == "black" ? 0 : 1;
    var testRows = [];
    for (var i = 0; i < piece.blocks.length; i++) {
        row = Math.floor(piece.blocks[i].center().y / BLOCK_SIZE);
        col = Math.floor(piece.blocks[i].center().x / BLOCK_SIZE);
        if (row < 0 || row > GRID_H - 1) {
            RUNNING = false;
            console.log("game over");
            return;
        }
        this.set(row, col, pieceType);
        testRows.push(row);
    }

    testRows =  testRows.sort().filter(function(item, pos) {
        return !pos || item != testRows[pos - 1];
    });
    if (pieceType == 0) { testRows = testRows.reverse(); }

    // Check for complete rows:
    var G = this.G;
    var hoffset = 0;
    for (var i = 0; i < testRows.length; i++) {
        var row = testRows[i];
        if (G[row].every(function(cell,i,ary){return(cell == pieceType)})) {
            G.splice(row,1);
            highlight.row(row + hoffset);
            this.scoreboard.multiplier *= LINE_MULTIPLE;
            SPEED += LINE_BOOST;
            if (pieceType == 0) {
                hoffset -= 1;
                testRows = testRows.map(function(row,i,ary){return(row + 1)});
                G.splice(0,0,[1,1,1,1,1,1,1,1,1,1,1]);
            }
            if (pieceType == 1) {
                hoffset += 1;
                testRows = testRows.map(function(row,i,ary){return(row - 1)});
                G.push([0,0,0,0,0,0,0,0,0,0,0]);
            }

        }
    }
    this.G = G;
};

grid.prototype.on_destroy = function() {this.destroyed = true;};

var new_grid = synchronized(
    {score: 0,
     G:     [[1,1,1,1,1,1,1,1,1,1,1],
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
             [0,0,0,0,0,0,0,0,0,0,0]]
    }, FB_GRID,
    grid
)
