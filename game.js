var DEBUG = true;

var GRID_H = 34;
var GRID_W = 11;
var BLOCK_SIZE = 20;
var FREEZE_DELAY = 1;
var TURBO_MULTIPLIER = 4;

var BLOCK_SCORE = 10;
var LINE_MULTIPLE = 1.1;
var RUNNING = true;

var SPEED = .5;
var LINE_BOOST = .05;

var CONTROLS = {white: {rotate: 83, left: 81, right: 69, turbo: 87},
                black: {rotate: 38, left: 37, right: 39, turbo: 40}};

var SHAPES = [
    [[-1,0],[0,0],[1,0],[0,1]],
    [[-1,1],[-1,0],[0,0],[1,0]],
    [[-1,0],[0,0],[1,0],[1,1]],
    [[-1,0],[0,0],[1,0],[2,0]],
    [[-1,0],[0,0],[-1,1],[0,1]],
    [[-1,1],[0,1],[0,0],[1,0]],
    [[1,1],[0,1],[0,0],[-1,0]],
];

var HIGHLIGHT_COLORS = [
    "255,0,0",
    "255,255,0",
    "0,255,0",
    "0,255,255",
    "0,0,255",
    "255,0,255"
];

var BLOCKED = false;

var SERVER = false;
if (((new URL(document.location)).searchParams).get('server') == "true") {
    SERVER = true
}

var FB_MOVES_LIST = firebase.database().ref('moves_list');
var FB_TETROMINOS = firebase.database().ref('tetrominos_list');
if (SERVER) {
    FB_MOVES_LIST.remove();
    FB_TETROMINOS.remove();
}

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

function random_element_of(ary) {
    return(eval(JSON.stringify(ary[Math.floor(ary.length * Math.random())])));
}

function game() {
    
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext("2d");
    var lastFrame = new Date().getTime();
    
    var entities = [];
    grid.prototype.entities = entities;
    
    var layers = {
        bgBlocks: {z: 1, drawings: []},
        blocks: {z: 3, drawings: []},
        effects: {z: 5, drawings: []}
    };    
    
    DEBUG = {}
    DEBUG.entities = entities;

    synchronized.prototype.on_add = function(entity) {
        entities.push(entity);
    }
    
    tetromino.generate = function(color) {
	if (!SERVER) {
	    return
	}
        var shape = random_element_of(SHAPES);
	var y = 0;
	var v = 0;
        if (color == "black") {
            y = -1 * BLOCK_SIZE;
            v = {x: 0, y: BLOCK_SIZE};
        }
        if (color == "white") {
            y = GRID_H * BLOCK_SIZE;
            v = {x: 0, y: (-1 * BLOCK_SIZE)};
        }
        entities.push(new tetromino({
            shape: shape,
            width: 5*BLOCK_SIZE,
            x: Math.floor(GRID_W/2) * BLOCK_SIZE,
            y: y,
            velocity: v,
            color: color
        }));
    }

    highlight.row = function(row) {
        var rgb = random_element_of(HIGHLIGHT_COLORS)
        entities.push(new highlight(0, row * BLOCK_SIZE, BLOCK_SIZE, GRID_W * BLOCK_SIZE, rgb, .5));
    };

    function setup() {
        var g = new_grid();
        entities.push(g);
        tetromino.generate("black");
        tetromino.generate("white");
    }

    if (SERVER) setup();

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

    function reset(){
        entities.forEach(function(e,a,i) {e.destroy()});
        update(0);
        setup();
        var lastFrame = new Date().getTime();
    }
    document.getElementById('reset_button').addEventListener("click", reset);

    var loopId = setInterval(loop, 16);

}

function synchronized(properties, fb_root, cls) {

    if (SERVER) {
        fb_root.remove();
    }

    let synched_cls = function (state, state_ref) {
        this._state = state;
        this._state_ref = state_ref;
        let that = this;
        this._state_ref.on("value",function(s) {
            if (s.val() === null) {
               that.on_destroy();
               return;
            }
            that._state = s.val();
        });
        cls.call(this);
    }

    synched_cls.prototype = cls.prototype;

    synched_cls.prototype.destroy = function () {
        if (SERVER) {
            this._state_ref.off("value", this.fbStateCallback);
            this._state_ref.remove();
        }
        this.on_destroy();
    }

    let wrapper = function(state) {
        state = state || {};
        state = Object.assign(properties, state);
        if(!SERVER) {
            return null;
        }
        let state_ref = fb_root.push(state);
        return new synched_cls(state, state_ref);
    }

    wrapper.prototype = cls.prototype


    Object.keys(properties).forEach(p => {
        Object.defineProperty(synched_cls.prototype, p, {
            get: function() {
                return this._state[p];
            },
            set: function(val) {
                this._state[p] = val;
                if (SERVER) {
                    this._state_ref.set(this._state);
                }
            }
        });
    });

    if (!SERVER) {
    fb_root.on('child_added', function(child) {
        var entity = new synched_cls(child.val(), child.ref);
        synchronized.prototype.on_add(entity);
    });
    }

    return wrapper;

};

synchronized.prototype.on_add = function(entity) { return null; };
