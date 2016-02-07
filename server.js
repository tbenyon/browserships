var express = require('express');
var bodyParser = require('body-parser');
var gameModule = require('./gameModule.js');
var cookieParser = require('cookie-parser');
var app = express();

app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(cookieParser("secret messagessdf"));

var games = [];
var openConnections = [];

app.get('/', function(req, res) {
    if (req.cookies['playersID'] === undefined) {
        var playerID = Math.floor(Math.random() * 1000).toString();
        res.cookie("playersID", playerID, {maxAge: 1000 * 60 * 60 * 24});
    } else {
        var playerID = req.cookies['playersID'];
    }
    var gameIndex = gameModule.findGameIndex(playerID, games);
    if (gameIndex === false) {
        var game = gameModule.createGame(playerID);
        games.push(game);
        gameIndex = games.length - 1;
    }
    res.redirect(303, '/games/' + gameIndex);
});

app.get('/games/:id', function(req, res) {
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

    var playerID = req.cookies['playersID'];
    var gameIndex = gameModule.findGameIndex(playerID, games);
    openConnections.push({'playerID': playerID, 'response': res});
    reportClientConnectionChange('Client connected');
    reportGameStateToClient(playerID, gameIndex);

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

function reportGameStateToClient(playerID, gameIndex) {
    var d = new Date();
    var game = games[gameIndex];
    for (var connectionIndex in openConnections) {
        if (openConnections[connectionIndex].playerID === playerID) {
            openConnections[connectionIndex].response.write('id: ' + d.getMilliseconds() + '\n');
            openConnections[connectionIndex].response.write('data:' + JSON.stringify(gameModule.getGameState(game.board, game.allShipsCoords)) + '\n\n');
        }
    }

}

app.post('/shot',function(req,res){
    var cell = req.body.cell;
    var playerID = req.cookies['playersID'];
    var gameIndex = gameModule.findGameIndex(playerID, games);
    if (gameModule.checkIfShip(cell.x, cell.y, games[gameIndex].allShipsCoords)) {
        games[gameIndex].board[cell.x][cell.y].state = "H";
    }
    else {
        games[gameIndex].board[cell.x][cell.y].state = "M";
    }
    reportGameStateToClient(playerID, gameIndex);
    res.send(200);
});

app.post('/reset',function(req,res) {
    var newGameData = gameModule.createGame();
    var playerID = req.cookies['playersID'];
    var gameIndex = gameModule.findGameIndex(playerID, games);
    games[gameIndex].board = newGameData.board;
    games[gameIndex].allShipsCoords = newGameData.allShipsCoords;
    reportGameStateToClient(playerID, gameIndex);
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
