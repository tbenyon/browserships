var express = require('express');
var bodyParser = require('body-parser');
var gameModule = require('./gameModule.js');
var app = express();

app.use(express.static('assets'));
app.use(bodyParser.json());

var openConnections = [];
var board = [];
var allShipsCoords = {};

gameModule.setBlankGrid(board);

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
    connection.write('data:' + JSON.stringify(gameModule.getGameState(board, allShipsCoords)) +   '\n\n');
}

app.post('/shot',function(req,res){
    var cell = req.body.cell;
    if (gameModule.checkIfShip(cell.x, cell.y, allShipsCoords)) {
        board[cell.x][cell.y].state = "H";
    }
    else {
        board[cell.x][cell.y].state = "M";
    }
    reportGameStateChange();
    res.send(200);
});

app.post('/reset',function(req,res) {
    gameModule.setBlankGrid(board);
    allShipsCoords = gameModule.generateRandomShipsPositions();
    reportGameStateChange();
    res.send(200);
});

function reportClientConnectionChange(description) {
    console.log(description + ' (clients: ' + openConnections.length + ')');
}

allShipsCoords = gameModule.generateRandomShipsPositions();

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
