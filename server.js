var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static('assets'));
app.use(bodyParser.json());

var openConnections = [];
var board = [];

function setBlankGrid(board) {
    for (x = 0; x < 5; x++) {
        board[x] = [];
        for (y = 0; y < 5; y++) {
            board[x][y] = {
                state: "W"
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

setInterval(function() {
    openConnections.forEach(function(resp) {
        var d = new Date();
        resp.write('id: ' + d.getMilliseconds() + '\n');
        resp.write('data:' + JSON.stringify(getGameState()) +   '\n\n');
    });
}, 1000);

app.post('/shot',function(req,res){
    console.log(req.body);
    var cell = req.body.cell;
    board[cell.x][cell.y].state = "H";
    res.send(200);
});

app.post('/reset',function(req,res){
    console.log(req.body);
    setBlankGrid(board);
    res.send(200);
});

function getGameState() {
    return {
        board: board
    };
}

function reportClientConnectionChange(description) {
    console.log(description + ' (clients: ' + openConnections.length + ')');
}

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
