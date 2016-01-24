var express = require('express');
var bodyParser = require('body-parser');
var shipsData = require('./ships.json');
var app = express();

app.use(express.static('assets'));
app.use(bodyParser.json());

var openConnections = [];
var board = [];
var allShipsCoords = {};
var statusOfShips = [];

function setBlankGrid(board) {
    for (x = 0; x < 10; x++) {
        board[x] = [];
        for (y = 0; y < 10; y++) {
            board[x][y] = {
                state: "O"
            }
        }
    }
}
setBlankGrid(board);

app.get('/', function(req, res) {
    res.sendfile('assets/game.html');
});

app.get('/state', function(req, res) {
    req.socket.setTimeout(60000);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    openConnections.push(res);
    reportClientConnectionChange('Client connected');
    reportGameStateToClient(res);

    req.on("close", function() {
        var toRemove;
        for (var j = 0; j < openConnections.length; j++) {
            if (openConnections[j] == res) {
                toRemove = j;
                break;
            }
        }
        openConnections.splice(toRemove, 1);
        reportClientConnectionChange('Client disconnected');
    });
});

function reportGameStateChange() {
    openConnections.forEach(function(connection) {
        reportGameStateToClient(connection);
    });
}

function reportGameStateToClient(connection) {
    var d = new Date();
    connection.write('id: ' + d.getMilliseconds() + '\n');
    connection.write('data:' + JSON.stringify(getGameState()) +   '\n\n');
}

app.post('/shot',function(req,res){
    var cell = req.body.cell;
    if (checkIfShip(cell.x, cell.y)) {
        board[cell.x][cell.y].state = "H";
    }
    else {
        board[cell.x][cell.y].state = "M";
    }
    checkForDestroyedShips();
    reportGameStateChange();
    res.send(200);
});

function checkIfShip(x, y) {
    for (boat in allShipsCoords) {
        for (segment in allShipsCoords[boat]) {
            if (allShipsCoords[boat][segment]["x"] === x && allShipsCoords[boat][segment]["y"] === y) {
                allShipsCoords[boat][segment]["state"] = "inactive";
                return true;
            }
        }
    }
}

function generateRandomShipsPositions() {
    allShipsCoords = {};
    for (var boat in shipsData.ships) {
        allShipsCoords[boat] = {};
        placeShip();
    }
    return allShipsCoords;

    function placeShip() {
        var direction;
        var addToX;
        var addToY;
        var startingX;
        var startingY;

        var placed = false;
        while (placed === false) {
            direction = getRandomDirection();
            addToX = direction[0];
            addToY = direction[1];
            startingX = Math.floor(Math.random() * 10);
            startingY = Math.floor(Math.random() * 10);
            placed = isShipPlacementValid(startingX, startingY, addToX, addToY, boat)
        }

        var currentX;
        var currentY;

        for (var i = 0; i < shipsData["ships"][boat]["length"]; i++) {
            currentX = startingX + addToX * i;
            currentY = startingY + addToY * i;

            allShipsCoords[boat]["segment" + i] = {
                "x": currentX,
                "y": currentY,
                "state": "active"
            };
        }
    }

    function getRandomDirection() {
        var addToX = 0;
        var addToY = 0;
        var xDirection = Math.random() >= 0.5;

        if (xDirection) {
            addToX = 1;
        }
        else {
            addToY = 1;
        }

        return [addToX, addToY];
    }

    function isShipPlacementValid(startingX, startingY, addToX, addToY, boat) {
        var currentX;
        var currentY;
        for (var i = 0; i < shipsData["ships"][boat]["length"]; i++) {
            currentX = startingX + addToX * i;
            currentY = startingY + addToY * i;

            if (currentX > 9 || currentY > 9) {
                return false;
            }

            if (shipInOwnSpace(currentX, currentY) === false) {
                return false;
            }
        }
        return true;
    }

    function shipInOwnSpace(currentX, currentY) {
        for (boat in allShipsCoords) {
            for (var coord in allShipsCoords[boat]) {
                var xCoord = allShipsCoords[boat][coord]["x"];
                var yCoord = allShipsCoords[boat][coord]["y"];

                if (xCoord === currentX && yCoord == currentY) {
                    return false;
                }
            }
        }
    }
}

function checkForDestroyedShips() {
    statusOfShips.length = 0;
    var activeBoat;
    for (boat in allShipsCoords) {
        activeBoat = false;
        for (segment in allShipsCoords[boat]) {
            if (allShipsCoords[boat][segment]["state"] === "active") {
                activeBoat = true;
            }

        }
        var boatObj = {};
        if (activeBoat === false) {
            boatObj["ship"] = boat;
            boatObj["status"] = "Destroyed";

        }
        else {
            boatObj["ship"] = boat;
            boatObj["status"] = "Active";
        }
        statusOfShips.push(boatObj);
    }
}

app.post('/reset',function(req,res) {
    setBlankGrid(board);
    generateRandomShipsPositions();
    checkForDestroyedShips();
    reportGameStateChange();
    res.send(200);
});

function getGameState() {
    return {
        "board": board,
        "shipStatus": statusOfShips
    };
}

function reportClientConnectionChange(description) {
    console.log(description + ' (clients: ' + openConnections.length + ')');
}

allShipsCoords = generateRandomShipsPositions();
checkForDestroyedShips();

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
