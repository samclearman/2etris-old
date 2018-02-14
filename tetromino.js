/****************************
*                           *
*   Tetromino class         *
*                           *
****************************/


let tetromino = synchronized(
    {
        x: 0,
        y: 0,
        color: "black",
        shape: [[-1,0],[0,0],[0,1],[1,0]],
        velocity: {x: 0, y: 0},
    },
    FB_TETROMINOS,
    function () {
        this.width = BLOCK_SIZE;
        this.height = BLOCK_SIZE;
        this.blocks = [];
        this.turbo = 1;
        for(var i=0; i < this._state['shape'].length; i++) {
            blk = new block(this._state['x'] + (this._state['shape'][i][0] * BLOCK_SIZE) , this._state['y'] + (this._state['shape'][i][1] * BLOCK_SIZE), this._state['color'])
            this.blocks.push(blk)
        }

        // All of these handlers have to be stored on the object so that they can be cleaned up on destroy
        var that = this;
        this.keyDownListener = function(e) { e.preventDefault(); that.handleKeyDown(e);};
        this.keyUpListener = function(e) { e.preventDefault(); that.handleKeyUp(e,that);};
        window.addEventListener("keyup", this.keyUpListener);
        window.addEventListener("keydown", this.keyDownListener);

        this.fbMoveListener = function(d) {
            if (!that) {
                console.log("no that");
            }
            if (!that.handleFbMove) {
                console.log("no handler");
                console.log(that);
                console.log(that.prototype);
            }
            that.handleFbMove(d.val());
        };
        FB_MOVES_LIST.on("child_added", this.fbMoveListener);
    }
);

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

    this.x += this.velocity.x * delta * SPEED * this.turbo;
    this.y += this.velocity.y * delta * SPEED * this.turbo;
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
        FB_MOVES_LIST.push({color: this.color, move: "turbo_on"});
        break;
    }

};

tetromino.prototype.handleKeyUp = function(e) {
    switch(e.keyCode) {
    case CONTROLS[this.color]["rotate"]:
        FB_MOVES_LIST.push({color: this.color, move: "rotate"});
        break;
    case CONTROLS[this.color]["left"]:
        FB_MOVES_LIST.push({color: this.color, move: "left"});
        break;
    case CONTROLS[this.color]["right"]:
        FB_MOVES_LIST.push({color: this.color, move: "right"});
        break;
    case CONTROLS[this.color]["turbo"]:
        FB_MOVES_LIST.push({color: this.color, move: "turbo_off"});
        break;
    }
};

tetromino.prototype.handleFbMove = function(move) {
    if (move.color != this.color) { return; }
    switch(move.move) {
    case "rotate":
        this.rotate("L");
        break;
    case "left":
        this.shift("L");
        break;
    case "right":
        this.shift("R");
        break;
    case "turbo_on":
        this.turbo = TURBO_MULTIPLIER;
        break;
    case "turbo_off":
        this.turbo = 1;
        break;
    }
};

tetromino.prototype.grid = function() { return {checkCollisions: function(t){return false;}}; };

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

        // CHEATTT
        if (this.y % BLOCK_SIZE < 5 || BLOCK_SIZE - (this.y & BLOCK_SIZE) < 3) {
            var oldx = this.x;
            var oldy = this.y;
            this.y = Math.round(this.y / BLOCK_SIZE) * BLOCK_SIZE;
            this.x += dir.x;
            this.y += dir.y;
            this.positionBlocks();
            if (this.grid().checkCollisions(this, ["center"])) {
                this.x = oldx;
                this.y = oldy;
                this.positionBlocks();
            }
        }
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

    var oldShape = this.shape.slice(0);

    for(var i=0; i < this.shape.length; i++) {
        this.shape[i] = mul(M,this.shape[i]);
    }

    this.positionBlocks();
    if (this.grid().checkCollisions(this)) {
        this.shape = oldShape;
        this.positionBlocks();
    }

};

tetromino.prototype.on_destroy = function() {
    this.destroyed = true;
    tetromino.generate(this.color);
    window.removeEventListener("keyup", this.keyUpListener);
    window.removeEventListener("keydown", this.keyDownListener);
}
