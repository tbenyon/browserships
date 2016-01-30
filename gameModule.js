var shipsData = require('./ships.json');

exports.createGame = function(playerID) {
    return {
        'board': setBlankGrid(),
        'allShipsCoords': generateRandomShipsPositions(),
        'playerID': playerID
    };
};

exports.getGameState = function(board, allShipsCoords) {
    return {
        "board": board,
        "shipStatus": checkForDestroyedShips(allShipsCoords)
    };
};

exports.checkForLiveGame = function(playerID, games) {
    for (var game in games) {
        if (games[game].playerID === playerID) {
            console.log("Game Index " + game + " FOUND for playerID: " + playerID + "/n");
            return game
        }
    }
    console.log("Game Index " + game + " CREATED for playerID: " + playerID + "/n");
    return false;
};

setBlankGrid = function() {
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

exports.checkIfShip = function(x, y, allShipsCoords) {
    for (boat in allShipsCoords) {
        for (segment in allShipsCoords[boat]) {
            if (allShipsCoords[boat][segment]["x"] === x && allShipsCoords[boat][segment]["y"] === y) {
                allShipsCoords[boat][segment]["state"] = "inactive";
                return true;
            }
        }
    }
};

checkForDestroyedShips = function(allShipsCoords) {
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

generateRandomShipsPositions = function() {
    var allShipsCoords = {};
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
};