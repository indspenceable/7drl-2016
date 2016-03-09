var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,
    entities: [],
    scheduler: null,
    currentWorld: 0,
    messages: ["Back log of messages!", "Which we should show"],
    maxHp: 22,

    init: function() {
        this.display = new ROT.Display({
            // forceSquareRatio:true,
            // spacing:0.75,
        });
        document.getElementById("game").appendChild(this.display.getContainer());
        this.scheduler = new ROT.Scheduler.Simple();
        this.engine = new ROT.Engine(this.scheduler);

        this._generateMap();
        this._redrawMap();
        this._drawMapUIDivider();
        this._drawUI();

        this.engine.start();
    },

    findPathTo: function(start, end) {
        var path = [];
        var passableCallback = function(x,y) {
            var monsterAtSpace = Game.monsterAt(x,y)
            return ((monsterAtSpace === undefined) ||
                    (monsterAtSpace === start) ||
                    (monsterAtSpace === end)) &&
                    Game.getTile(x,y).isWalkable();
        }
        var astar = new ROT.Path.AStar(start._x, start._y, passableCallback, {topology: 4});
        astar.compute(end._x, end._y, function(x,y) {
            path.push([x,y]);
        });
        return path;
    },

    getTile: function(x, y) {
        return this.map[y][x];
    },

    _generateMap: function() {
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,2,0,0,0,0,0,2,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,2,2,2,2,2,2,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,3,0,2,2,2,2,2,2,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,2,2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,2,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ]
        for (var y = 0; y < this.map.length; y+=1) {
            for (var x = 0; x < this.map[0].length; x+=1) {
                this.map[y][x] = new Tile(x, y, this.map[y][x]);
            }
        }
        this._createPlayer(20,5);
        this._createMonster(7,7,3);
        this._createMonster(10,5,5);
    },

    _createPlayer: function(x, y) {
        this.player = new Player(x, y, this.maxHp);
        this.entities.push(this.player);
        this.scheduler.add(this.player, true);
    },

    _createMonster: function(x,y,hp) {
        var monster = new Monster(x,y,hp);
        this.entities.push(monster);
        this.scheduler.add(monster, true);
    },

    // This is for drawing terrain etc.
    drawMapTileAt: function(x,y) {
        var m = this.monsterAt(x,y);
        if (m !== undefined) {
            m._draw();
            return;
        }

        this.getTile(x,y).draw();
    },

    // This is for drawing the player + enemies etc.
    drawCharacterByWorld: function(x, y, chr1, fg1, bg1, chr2, fg2, bg2) {
        if (this.currentWorld == 0) {
            this.display.draw(x, y, chr1, fg1, bg1);
        } else {
            this.display.draw(x, y, chr2, fg2, bg2);
        }
    },

    killMonster: function(monster) {
        this.scheduler.remove(monster);
        var index = this.entities.indexOf(monster);
        if (index >= 0) {
            this.entities.splice(index, 1);
        }
        this.drawMapTileAt(monster._x, monster._y);
    },

    monsterAt: function(x,y) {
       for(var i = 0; i < this.entities.length; i+= 1) {
            if (this.entities[i].isAt(x,y)) {
                return this.entities[i];
            }
        }
        return undefined;
    },

    _drawWholeMap: function() {
        for (var y = 0; y < this.map.length; y++) {
            for (var x = 0; x < this.map[0].length; x++) {
                this.drawMapTileAt(x,y)
            }
        }
    },

    _redrawMap: function() {
        this._drawWholeMap();
        this.player._draw();
    },

    _drawMapUIDivider: function() {
        var x = 55;
        for (var y = 0; y < 25; y+=1) {
            this.display.draw(x, y, "|");
        }
    },

    _drawUI: function() {
        var x = 56;
        var y = 0;
        var width = 80-56;
        var height = 25;

        var worldName = this.currentWorld == 0 ? "Badlands" : "Subspace";
        this.display.drawText(x, y, "World: " + worldName);
        y+=1;
        for (var j = 0; j < width; j+=1) {
            this.display.draw(x+j, y, " ");
        }

        this.display.drawText(x, y, "" + this.player._hp + "/" + this.maxHp);
        y+=1;
        this.display.drawText(x, y, "[" +
            Array(this.player._hp).join("=") +
            Array(this.maxHp - this.player._hp+1).join(" ") +
            "]", "#000", "#000");
        y+=1;
        y+=1;
        y+=1;
        y+=1;
        y+=1;
        this._clearAndDrawMessageLog();
    },

    _clearAndDrawMessageLog: function() {
        var x = 56;
        var y = 15;
        var width = 80-56;
        var height = 25-15;

        var index = this.messages.length;

        this.display.drawText(x, y, Array(width).join("-"), "#000", "#000");
        y+=1
        for (var i = 0; i < height-1; i+=1) {
            // clear the line
            for (var j = 0; j < width; j+=1) {
                this.display.draw(x+j, y, " ");
            }

            index -= 1;
            if (index >= 0) {
                // Draw this message
                this.display.drawText(x, y, this.messages[index])
            }
            y+=1;
        }
    },

    logMessage: function(message) {
        this.messages.push(message);
        this._clearAndDrawMessageLog();
    },

    swapWorld: function() {
        this.currentWorld = this.otherWorld();
        this._redrawMap();
    },

    otherWorld: function() {
        return (this.currentWorld + 1)%2;
    }
};

var Tile = function(x,y,terrain) {
    this.x = x;
    this.y = y;
    this.terrain = terrain;
}

Tile.prototype.draw = function() {
    var world1Tiles = [
        ['.', '#f99', '#000'],
        ['#', '#f99', '#000'],
        ['~', '#f99', '#922'],
        ['_', '#555', '#000']
    ][this.terrain];
    var world2Tiles = [
        [' ', '#000', '#99f'],
        ['U', '#000', '#99f'],
        ['~', '#9f9', '#99f'],
        [' ', '#fff', '#222']
    ][this.terrain];

    // Draw the tile correctly, accounting for which world we're in.
    // Game.display.draw(x, y, chrData[0], chrData[1], chrData[2]);

    Game.drawCharacterByWorld(this.x, this.y, world1Tiles[0], world1Tiles[1], world1Tiles[2],
                                              world2Tiles[0], world2Tiles[1], world2Tiles[2]);
}

Tile.prototype.isWalkable = function(world) {
    if (world === undefined) {
        world = Game.currentWorld;
    }
    return this.terrain == 0 || this.terrain == 2 || (this.terrain == 3 && world == 0);
}

Tile.prototype.trigger = function() {
    switch(this.terrain) {
        case 2:
            if (Game.currentWorld == 0) {
                Game.logMessage("the lava singes you!");
                Game.player.takeHit(1);
            } else {
                Game.logMessage("You're bogged down in the slime!")
                Game.player.delay += 1;
            }
        break;
    }
}

var ThingInATile = function(x, y, hp) {
    this._x = x;
    this._y = y;
    this._hp = hp;
}

var Monster = function(x, y, hp) {
    this._x = x;
    this._y = y;
    this._hp = hp;
}

Monster.prototype = new ThingInATile();

Monster.prototype.act = function() {
    path = Game.findPathTo(Game.player, this);
    if (path.length <= 1) {
        //No path! Ignore
    } else if (path.length == 2) {
        Game.logMessage("Monster attacks!");
        Game.player.takeHit(1);
    } else {
        this.stepTowardsPlayer(path);
    }
}

Monster.prototype.stepTowardsPlayer = function(path) {
    if (path === undefined) {
        path = Game.findPathTo(Game.player, this);
    }
    if (path.length < 3) {
        return;
    }
    var oldX = this._x;
    var oldY = this._y;

    var xy = path[1];
    this._x = xy[0];
    this._y = xy[1]
    Game.drawMapTileAt(oldX, oldY);
    this._draw();
}

Monster.prototype._draw = function() {
    Game.drawCharacterByWorld(this._x, this._y, "m", "#fff", "#000",
                                                "M", "#000", "#fff");
}

ThingInATile.prototype.isAt = function(x,y) {
    return x == this._x && y == this._y;
}

ThingInATile.prototype.takeHit = function(damage) {
    this._hp -= damage;
    if (this._hp <= 0) {
        this.die()
    }
}

Monster.prototype.die = function() {
    Game.killMonster(this);
}

var Player = function(x, y, hp) {
    this._x = x;
    this._y = y;
    this._hp = hp;
    this.delay = 0;
}

Player.prototype = new ThingInATile();

Player.prototype.act = function() {
    if (this.delay > 0) {
        this.delay -= 1;
    } else {
        Game.engine.lock();
        window.addEventListener("keydown", this);
    }
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
        event.preventDefault()
        this._attemptMovement(ROT.DIRS[8][movementKeymap[code]]);
    } else if (e.keyCode == 190) {
        // . (wait)
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    } else if (e.keyCode == 32) {
        event.preventDefault()
        // Spacebar (worldswap)
        if (!this.canSwapWorld()) {
            Game.logMessage("You're unable to phase to the other world in this location.")
            return;
        }
        Game.swapWorld();
        Game._drawUI();
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    }
}

Player.prototype.canSwapWorld = function() {
    return Game.getTile(this._x, this._y).isWalkable(Game.otherWorld());
}

Player.prototype._attemptMovement = function(dir) {
    /* is there a free space? */
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];

    var monster = Game.monsterAt(newX, newY)
    if (monster !== undefined) {
        this._doAttack(monster);
    } else if (Game.getTile(newX, newY).isWalkable()) {
        this._doMovement(newX, newY)
    }
}

Player.prototype._doMovement = function(newX, newY) {
    var oldX = this._x;
    var oldY = this._y;
    this._x = newX;
    this._y = newY;
    Game.drawMapTileAt(oldX, oldY);
    this._draw();

    Game.getTile(this._x, this._y).trigger();

    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

Player.prototype.takeHit = function(damage) {
    var rtn = ThingInATile.prototype.takeHit.call(this, damage);
    Game._drawUI();
    return rtn;
}

Player.prototype._doAttack = function(monster) {
    monster.takeHit(1);
    Game.logMessage("You hit the monster!");
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

Player.prototype._draw = function() {
    Game.drawCharacterByWorld(this._x, this._y, "@", "#fff", "#000",
                                                "@", "#000", "#fff");
}
