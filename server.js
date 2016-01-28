var express = require('express');
var bodyParser = require('body-parser');
var gameModule = require('./gameModule.js');
var cookieParser = require('cookie-parser');
var app = express();

app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(cookieParser("secret messagessdf"));

var  games = [];
games.push(gameModule.createGame());
var openConnections = [];


app.get('/', function(req, res) {
    res.sendfile('assets/game.html');
});

app.get('/state', function(req, res) {
    console.log("Cookies: ", req.cookies);
    if (req.cookies['beenBefore'] == 'yes') {
        console.log("Played before! Player ID = " + req.cookies['playersID']);
    } else {
        var playerID = Math.floor(Math.random() * 1000);
        res.cookie("beenBefore", 'yes', {maxAge: 1000 * 60 * 60 * 24});
        res.cookie("playersID", playerID, {maxAge: 1000 * 60 * 60 * 24});
        console.log("New player! Player ID = " + playerID);
    }
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
    connection.write('data:' + JSON.stringify(gameModule.getGameState(games[0].board, games[0].allShipsCoords)) +   '\n\n');
}

app.post('/shot',function(req,res){
    var cell = req.body.cell;
    if (gameModule.checkIfShip(cell.x, cell.y, games[0].allShipsCoords)) {
        games[0].board[cell.x][cell.y].state = "H";
    }
    else {
        games[0].board[cell.x][cell.y].state = "M";
    }
    reportGameStateChange();
    res.send(200);
});

app.post('/reset',function(req,res) {
    gameModule.setBlankGrid(games[0].board);
    games[0].allShipsCoords = gameModule.generateRandomShipsPositions();
    reportGameStateChange();
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
