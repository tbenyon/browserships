var express = require('express');
var bodyParser = require('body-parser');
var gameModule = require('./gameModule.js');
var cookieParser = require('cookie-parser');
var guid = require('guid');
var app = express();

app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(cookieParser("secret messagessdf"));

var games = [];
var openConnections = [];

app.get('/', function(req, res) {
    if (req.cookies['playersID'] === undefined) {
        var playerID = guid.raw();
        res.cookie("playersID", playerID, {maxAge: 1000 * 60 * 60 * 24});
    } else {
        var playerID = req.cookies['playersID'];
    }
    var gameID = gameModule.findGameID(playerID, games);
    if (gameID === false) {
        var game = gameModule.createGame(playerID, guid.raw());
        games.push(game);
    } else {
        var game = gameModule.findGame(games, gameID);
    }
    res.redirect(303, '/games/' + game.gameID);
});

app.get('/games/:id', function(req, res) {
    res.sendfile('assets/game.html');
});

app.get('/games/:id/state', function(req, res) {
    req.socket.setTimeout(60000);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    var playerID = req.cookies['playersID'];
    var gameID = req.params.id;
    openConnections.push({'playerID': playerID, 'response': res});
    reportClientConnectionChange('Client connected');
    reportGameStateToClient(playerID, gameID);

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

function reportGameStateToClient(playerID, gameID) {
    var d = new Date();
    var game = gameModule.findGame(games, gameID);
    for (var connectionIndex in openConnections) {
        if (openConnections[connectionIndex].playerID === playerID) {
            openConnections[connectionIndex].response.write('id: ' + d.getMilliseconds() + '\n');
            openConnections[connectionIndex].response.write('data:' + JSON.stringify(gameModule.getGameState(game)) + '\n\n');
        }
    }
}

app.post('/games/:id/shot',function(req,res){
    var cell = req.body.cell;
    var playerID = req.cookies['playersID'];
    var gameID = req.params.id;
    var game = gameModule.findGame(games, gameID);
    var hitOrMiss = gameModule.hitOrMiss(cell.x, cell.y, game.computerShipPositions);
    game.playerShotData[cell.x][cell.y].state = hitOrMiss;
    do {
        var computerXShot = Math.floor((Math.random() * 10));
        var computerYShot = Math.floor((Math.random() * 10));
    } while (game.computerShotData[computerXShot][computerYShot].state != "O");
    hitOrMiss = gameModule.hitOrMiss(computerXShot, computerYShot, game.playerShipPositions);
    game.computerShotData[computerXShot][computerYShot].state = hitOrMiss;
    reportGameStateToClient(playerID, gameID);
    res.send(200);
});

app.post('/games/:id/reset',function(req,res) {
    var newGameData = gameModule.createGame();
    var playerID = req.cookies['playersID'];
    var gameID = req.params.id;
    var game = gameModule.findGame(games, gameID);
    game.playerShotData = newGameData.playerShotData;
    game.playerShipPositions = newGameData.playerShipPositions;
    game.computerShotData = newGameData.computerShotData;
    game.computerShipPositions = newGameData.computerShipPositions;

    reportGameStateToClient(playerID, gameID);
    res.send(200);
});

function reportClientConnectionChange(description) {
    console.log(description + ' (clients: ' + openConnections.length + ')');
}

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
