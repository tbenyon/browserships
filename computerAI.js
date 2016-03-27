var coordGenerator = require('./coordinateGenerator.js');
var shipsInformation = require('./ships.json');

exports.getComputerShotCoords = function(computerShotData, nextShots) {
    var coords;

    do {
        if (nextShots.length !== 0 && nextShots[0].length === 0) {
                nextShots.shift();
        }

        if (nextShots.length >= 1) {
            coords = nextShots[0].shift();
        } else {
            coords = coordGenerator.getRandomCoords();
        }

        if (computerShotData[coords.x][coords.y].state != "O") {
            nextShots.shift();
        }
    } while (computerShotData[coords.x][coords.y].state != "O");

    return coords;
};

exports.reportHit = function(shotData, computerPlayerMemory) {
    computerPlayerMemory.hitCoords.push(shotData);
    var nextShots = computerPlayerMemory.nextShots;

    if (nextShots.length === 0) {
        addFourLineShotsToNextShots(nextShots, shotData);
    }
};

exports.reportMiss = function(computerMemory) {
        computerMemory.nextShots.shift();
};

exports.reportDestroyedShip = function(computerPlayerMemory, shipName) {
    var hits = computerPlayerMemory.hitCoords;
    var nextShots = computerPlayerMemory.nextShots;
    var killShot = hits[hits.length - 1];

    computerPlayerMemory.nextShots.length = 0;

    deleteDestroyedShipHits();

    for (var i = 0; i < hits.length; i++) {
        addFourLineShotsToNextShots(nextShots, hits[i])
    }

    function deleteDestroyedShipHits() {
        var hitsToDelete = getHitsToDelete();

        for (var i = hits.length - 1; i >= 0; i--) {
            for (var j = hitsToDelete.length - 1; j >= 0; j--) {
                if (JSON.stringify(hits[i]) === JSON.stringify(hitsToDelete[j])) {
                    hits.splice(i, 1);
                }
            }
        }

        function getHitsToDelete() {
            var destroyedShipDirection = getShipDirection();
            var hitsToDelete = [];
            var destroyedShipCoord = deepCopy(killShot);
            for (var i = 0; i < getDestroyedShipLength(); i++) {
                hitsToDelete.push(deepCopy(destroyedShipCoord));
                destroyedShipCoord.x += destroyedShipDirection.x;
                destroyedShipCoord.y += destroyedShipDirection.y;
            }
            return hitsToDelete
        }

        function getDestroyedShipLength() {
            var shipLength;
            for (var ship in shipsInformation.ships) {
                if (shipName === ship) {
                    shipLength = shipsInformation.ships[ship]['length']
                }
            }
            return shipLength;
        }

        function getShipDirection() {
            for (var i in hits) {
                if (hits[i].x === killShot.x && hits[i].y === killShot.y - 1) {
                    return {'x': 0, 'y': -1};
                } else if (hits[i].x === killShot.x && hits[i].y === killShot.y + 1) {
                    return {'x': 0, 'y': 1};
                } else if (hits[i].x === killShot.x - 1 && hits[i].y === killShot.y) {
                    return {'x': -1, 'y': 0};
                } else if (hits[i].x === killShot.x + 1 && hits[i].y === killShot.y) {
                    return {'x': 1, 'y': 0};
                }
            }
        }
    }
};

function addFourLineShotsToNextShots(nextShots, shotData) {

    var nextShotData = deepCopy(shotData);

    nextShots.push([]);
    while (nextShotData.y > 0) {
        nextShotData.y -= 1;
        nextShots[0].push(deepCopy(nextShotData));
    }

    nextShots.push([]);
    nextShotData = deepCopy(shotData);
    while (nextShotData.y < 9) {
        nextShotData.y += 1;
        nextShots[1].push(deepCopy(nextShotData));
    }

    nextShots.push([]);
    nextShotData = deepCopy(shotData);
    while (nextShotData.x > 0) {
        nextShotData.x -= 1;
        nextShots[2].push(deepCopy(nextShotData));
    }

    nextShots.push([]);
    nextShotData = deepCopy(shotData);
    while (nextShotData.x < 9) {
        nextShotData.x += 1;
        nextShots[3].push(deepCopy(nextShotData));
    }
}

function deepCopy(value) {
    return JSON.parse(JSON.stringify(value));
}
