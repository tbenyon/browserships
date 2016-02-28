var shipsData = require('./ships.json');

exports.generateRandom = function() {
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
        var horizontal;

        if (addToY === 1) {
            horizontal = false;
        } else {
            horizontal = true;
        }

        for (var i = 0; i < shipsData["ships"][boat]["length"]; i++) {
            currentX = startingX + addToX * i;
            currentY = startingY + addToY * i;

            allShipsCoords[boat]["segment" + i] = {
                "x": currentX,
                "y": currentY,
                "state": "active",
                "horizontal": horizontal
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