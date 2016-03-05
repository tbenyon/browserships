var AIModule = require('./computerAI.js');
var guid = require('guid');
var shipPlacement = require('./shipPlacement.js');

exports.findOrCreateGame = function(playerID, games) {
    var gameID = findGameID(playerID, games);
    if (gameID === false) {
        var game = createGame(playerID, guid.raw());
        games.push(game);
        return game;
    } else {
        return findGame(games, gameID);
    }
};

var createGame = function(playerID, gameID) {
    return {
        'playerShotData': setBlankGrid(),
        'playerShipPositions': shipPlacement.generateRandom(),

        'computerShotData': setBlankGrid(),
        'computerShipPositions': shipPlacement.generateRandom(),

        'playerID': playerID,
        'gameID': gameID,

        'computerPlayerMemory': {
            'nextShots': [],
            'hitCoords': []
        }
    };
};

exports.getGameState = function(game) {
    if (checkForWinner(game.playerShipPositions)) {
        var winner = "computer";
    } else if (checkForWinner(game.computerShipPositions)) {
        var winner = "player";
    } else {
        var winner = false;
    }
    return {
        'playerShotData': game.playerShotData,
        'playerShipStatus': checkForDestroyedShips(game.playerShipPositions),
        'computerShipStatus': checkForDestroyedShips(game.computerShipPositions),
        'computerShotData': game.computerShotData,
        'playerShipPositions': game.playerShipPositions,
        'winner': winner
    };
};

var findGameID = function(playerID, games) {
    for (var game in games) {
        if (games[game].playerID === playerID) {
            return games[game].gameID;
        }
    }
    return false;
};

var findGame = function(games, gameID) {
    for (var game in games) {
        if (games[game].gameID === gameID) {
            return games[game];
        }
    }
    return false;
};

exports.findGame = findGame;

exports.playerShot = function(req, gameID, game) {
    var cell = req.body.cell;
    if (game.playerShotData[cell.x][cell.y].state === "O") {
        var hitOrMiss = isShotHitOrMiss(cell, game.computerShipPositions);
        game.playerShotData[cell.x][cell.y].state = hitOrMiss;
        computerShot(game);
    }
};

var computerShot = function(game) {
    var beforeShipStatus = checkForDestroyedShips(game.playerShipPositions);
    var shotData = AIModule.getComputerShotCoords(game.computerShotData, game.computerPlayerMemory.nextShots);

    var hitOrMiss = isShotHitOrMiss(shotData, game.playerShipPositions);
    if (hitOrMiss === "H") {
        AIModule.reportHit(shotData, game.computerPlayerMemory);
    } else {
        AIModule.reportMiss(game.computerPlayerMemory);
    }

    game.computerShotData[shotData.x][shotData.y].state = hitOrMiss;
    var afterShipStatus = checkForDestroyedShips(game.playerShipPositions);
    checkIfShotDestroyedShip(game, beforeShipStatus, afterShipStatus);
};

var checkIfShotDestroyedShip = function(game, before, after) {
    for (var i in before) {
        if (before[i].status !== after[i].status) {
            AIModule.reportDestroyedShip(game.computerPlayerMemory, before[i].ship);
        }
    }
};

exports.computerShot = computerShot;

var checkForWinner = function(shipPositions) {
    var statusOfShips = checkForDestroyedShips(shipPositions);
    for (var ship in statusOfShips) {
        if (statusOfShips[ship].status === "Active") {
            return false;
        }
    }
    return true;
};

exports.resetGame = function(games, gameID) {
    var newGameData = createGame();
    var game = findGame(games, gameID);
    game.playerShotData = newGameData.playerShotData;
    game.playerShipPositions = newGameData.playerShipPositions;
    game.computerShotData = newGameData.computerShotData;
    game.computerShipPositions = newGameData.computerShipPositions;
    game.computerPlayerMemory = {
        'nextShots': [],
        'hitCoords': []
    };
};

var isShotHitOrMiss = function(shotData, shipPositions) {
    if (checkIfShip(shotData, shipPositions)) {
        return "H";
    }
    else {
        return "M";
    }
};

var setBlankGrid = function() {
    var board = [];
    for (var x = 0; x < 10; x++) {
        board[x] = [];
        for (var y = 0; y < 10; y++) {
            board[x][y] = {
                state: "O"
            }
        }
    }
    return board;
};

var checkIfShip = function(shotData, allShipsCoords) {
    for (var boat in allShipsCoords) {
        for (var segment in allShipsCoords[boat]) {
            if (allShipsCoords[boat][segment]["x"] === shotData.x && allShipsCoords[boat][segment]["y"] === shotData.y) {
                allShipsCoords[boat][segment]["state"] = "inactive";
                return true;
            }
        }
    }
};

var checkForDestroyedShips = function(allShipsCoords) {
    var statusOfShips = [];
    var activeBoat;
    for (var boat in allShipsCoords) {
        activeBoat = false;
        for (var segment in allShipsCoords[boat]) {
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
    return statusOfShips;
};

