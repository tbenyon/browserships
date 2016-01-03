var express = require('express');
var bodyParser = require('body-parser');
var shipsData = require('./ships.json');
var app = express();

app.use(express.static('assets'));
app.use(bodyParser.json());

var openConnections = [];
var board = [];
var shipsCoords = {};
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

function updateClients() {
    openConnections.forEach(function(resp) {
        var d = new Date();
        resp.write('id: ' + d.getMilliseconds() + '\n');
        resp.write('data:' + JSON.stringify(getGameState()) +   '\n\n');
    });
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
    updateClients();
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

function getShipData() {
    for (var boat in shipsData.ships) {
        var direction = checkDirection();
        var addToX = direction[0];
        var addToY = direction[1];

        shipsCoords[boat] = {};

        for (var i = 0; i < shipsData["ships"][boat]["length"]; i++) {
            shipsCoords[boat]["segment" + i] = {
                "x": "",
                "y": "",
                "state": "active"
            };
            shipsCoords[boat]["segment" + i]["x"] = shipsData["ships"][boat]["coord"]["x"] + addToX * i;
            shipsCoords[boat]["segment" + i]["y"] = shipsData["ships"][boat]["coord"]["y"] + addToY * i;
        }
    }
    return shipsCoords;

    function checkDirection() {
        var addToX = 0;
        var addToY = 0;

        if (shipsData["ships"][boat]["orientation"] === "x") {
            addToX = 1;
        }
        else {
            addToY = 1;
        }

        return [addToX, addToY];
    }
}

function checkForDestroyedShips() {
    statusOfShips = [];
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

app.post('/reset',function(req,res){
    console.log(req.body);
    setBlankGrid(board);
    getShipData();
    checkForDestroyedShips();
    updateClients();
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
    updateClients();
}

allShipsCoords = getShipData();
checkForDestroyedShips();

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
