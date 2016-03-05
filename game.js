var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,

    init: function() {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());

        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    openSpace: function(x, y) {
        return this.map[y][x] == '.';
    },

    getTile: function(x, y) {
        return this.map[y][x];
    },

    _generateMap: function() {
        this.map = [
            ["x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"],
            ["x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"],
            ["x","x","x",".",".",".",".",".",".",".",".",".",".",".","x","x","x","x","x","x"],
            ["x","x","x",".",".",".",".",".",".",".",".",".",".",".","x","x","x","x","x","x"],
            ["x","x","x",".",".",".",".",".",".",".",".",".",".",".","x","x","x","x","x","x"],
            ["x","x","x",".",".",".",".",".",".",".",".",".",".",".","x","x","x","x","x","x"],
            ["x","x","x",".",".",".",".",".",".",".",".",".",".",".","x","x","x","x","x","x"],
            ["x","x","x",".",".",".",".",".",".",".",".",".",".",".","x","x","x","x","x","x"],
            ["x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"],
            ["x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"],
        ]
        this._drawWholeMap();
        this._createPlayer(5,5);
    },

    _createPlayer: function(x, y) {
        this.player = new Player(x, y);
    },

    _drawWholeMap: function() {
        for (var y = 0; y < this.map.length; y++) {
            for (var x = 0; x < this.map[0].length; x++) {
                this.display.draw(x, y, this.map[y][x]);
            }
        }
    }
};

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    var code = e.keyCode;
    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }

    /* is there a free space? */
    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    if (! Game.openSpace(newX, newY)) {
        return;
    }

    Game.display.draw(this._x, this._y, Game.getTile(this._x, this._y));
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}
