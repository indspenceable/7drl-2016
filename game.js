var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,

    init: function() {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());

        this._generateMap();
        this._redrawMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    openSpace: function(x, y) {
        return this.map[y][x] == 0;
    },

    getTile: function(x, y) {
        return this.map[y][x];
    },

    _generateMap: function() {
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ]
        this._createPlayer(5,5);
    },

    _createPlayer: function(x, y) {
        this.player = new Player(x, y);
    },

    // This is for drawing terrain etc.
    drawTileAt: function(x,y) {
        var tileIntToCharacter = [
            ['.','#'],
            [' ','^'],
        ]
        var chrMap = tileIntToCharacter[this.player.currentWorld]
        var chr = chrMap[this.map[y][x]];
        this.display.draw(x, y, chr);
    },

    // This is for drawing the player + enemies etc.
    drawCharacterAt: function(x, y, character, mirrorCharacter) {
        if (mirrorCharacter === undefined) {
            mirrorCharacter = character;
        }
        var chr = [character, mirrorCharacter][this.player.currentWorld];
        this.display.draw(x, y, chr);
    },

    _drawWholeMap: function() {
        for (var y = 0; y < this.map.length; y++) {
            for (var x = 0; x < this.map[0].length; x++) {
                this.drawTileAt(x,y)
            }
        }
    },

    _redrawMap: function() {
        this._drawWholeMap();
        this.player._draw();
    }
};

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    // this._draw();
    // Current world is either 0 or 1.
    this.currentWorld = 0;
}

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var movementKeymap = {};
    movementKeymap[38] = 0;
    movementKeymap[33] = 1;
    movementKeymap[39] = 2;
    movementKeymap[34] = 3;
    movementKeymap[40] = 4;
    movementKeymap[35] = 5;
    movementKeymap[37] = 6;
    movementKeymap[36] = 7;

    var code = e.keyCode;
    /* one of numpad directions? */
    if ((code in movementKeymap)) {
        this._doMovement(ROT.DIRS[8][movementKeymap[code]]);
    } else if (e.keyCode == 32) {
        // Spacebar
        this._swapWorld();
    }
}

Player.prototype._doMovement = function(dir) {
    /* is there a free space? */
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    if (! Game.openSpace(newX, newY)) {
        return;
    }

    // Game.display.draw(this._x, this._y, Game.getTile(this._x, this._y));
    Game.drawTileAt(this._x, this._y);
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

Player.prototype._draw = function() {
    Game.drawCharacterAt(this._x, this._y, "@", "@");
    // Game.drawCharacterAt(this._x, this._y, "@", "#ff0");
}

Player.prototype._swapWorld = function() {
    this.currentWorld += 1;
    this.currentWorld %= 2;
    Game._redrawMap();
}
