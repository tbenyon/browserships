var shipsData = require('./ships.json');

exports.checkAndStoreDefinedShipPlacement = function(allBoatsData) {
    var validShip;
    var allShipsCoords = {};
    var allBoatCoords = {};
    for (var boat in allBoatsData) {
        allBoatCoords[boat] = {
            'startingX': allBoatsData[boat]['coord'].x,
            'startingY': allBoatsData[boat]['coord'].y,
            'addToX': 0,
            'addToY': 0
        };
        if (allBoatsData[boat]['horizontal'] === true) {
            allBoatCoords[boat]['addToX'] = 1;
        } else {
            allBoatCoords[boat]['addToY'] = 1;
        }

        allShipsCoords[boat] = {};
        validShip = isShipPlacementValid(allShipsCoords, boat, allBoatCoords[boat]);
        if (validShip === false) {
            console.log(boat + " cannot be placed here!");
            return boat + "invalid"
        } else {
            placeShip(allBoatCoords, boat, allBoatCoords[boat]);
        }
    }
    return allBoatCoords;
};

exports.generateRandom = function() {
    var allShipsCoords = {};
    for (var boat in shipsData.ships) {
        allShipsCoords[boat] = {};
        getRandomShipCoords(allShipsCoords, boat);
    }
    return allShipsCoords;
};

function getRandomShipCoords(allShipsCoords, boat) {
    var direction;
    var boatData;

    var placed = false;
    while (placed === false) {
        direction = getRandomDirection();
        boatData = {
            addToX: direction[0],
            addToY: direction[1],
            startingX: Math.floor(Math.random() * 10),
            startingY: Math.floor(Math.random() * 10)
        };

        placed = isShipPlacementValid(allShipsCoords, boat, boatData)
    }
    placeShip(allShipsCoords, boat, boatData);

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
}

function placeShip(allShipsCoords, boat, boatData) {
    var startingX = boatData.startingX;
    var startingY = boatData.startingY;
    var addToX = boatData.addToX;
    var addToY = boatData.addToY;
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

function isShipPlacementValid(allShipsCoords, boat, providedBoatData) {
    var startingX = providedBoatData.startingX;
    var startingY = providedBoatData.startingY;
    var addToX = providedBoatData.addToX;
    var addToY = providedBoatData.addToY;
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