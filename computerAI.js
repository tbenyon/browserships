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
    var nextShotData = deepCopy(shotData);

    if (nextShots.length === 0) {
        storeDataIfNextShotsIsEmpty(nextShotData);
    }

    function storeDataIfNextShotsIsEmpty() {
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
};

exports.reportMiss = function(computerMemory) {
        computerMemory.nextShots.shift();
};

exports.reportDestroyedShip = function(computerPlayerMemory, shipName) {
    var hits = computerPlayerMemory.hitCoords;
    var nextShots = computerPlayerMemory.nextShots;

    computerPlayerMemory.nextShots.length = 0;

    if (shipsInformation.ships[shipName].length !== hits.length) {
        placeNextShotsFromTwoShipsHitKnowledge();
    }

    hits.length = 0;

    function placeNextShotsFromTwoShipsHitKnowledge() {
        if (areShotsVertical()) {
            var highestLowestData = findHighestAndLowestHits();
            var highest = highestLowestData[0];
            var lowest = highestLowestData[1];
            var nextShotData = {};

            computerPlayerMemory.nextShots.push([]);
            nextShotData = deepCopy(highest);
            while (nextShotData.x > -1) {
                nextShotData.x -= 1;
                nextShots[nextShots.length - 1].push(deepCopy(nextShotData));
            }

            computerPlayerMemory.nextShots.push([]);
            nextShotData = deepCopy(highest);
            while (nextShotData.x < 9) {
                nextShotData.x += 1;
                nextShots[nextShots.length - 1].push(deepCopy(nextShotData));
            }

            computerPlayerMemory.nextShots.push([]);
            nextShotData = deepCopy(lowest);
            while (nextShotData.x > -1) {
                nextShotData.x -= 1;
                nextShots[nextShots.length - 1].push(deepCopy(nextShotData));
            }

            computerPlayerMemory.nextShots.push([]);
            nextShotData = deepCopy(lowest);
            while (nextShotData.x < 9) {
                nextShotData.x += 1;
                nextShots[nextShots.length - 1].push(deepCopy(nextShotData));
            }
        }

        function areShotsVertical() {
            var lastTwoHits = hits.slice(-2);
            if (lastTwoHits[0].x === lastTwoHits[1].x) {
                return true;
            } else {
                return false;
            }
        }

        function findHighestAndLowestHits() {
            var highest = {};
            var lowest = {};
            for (var i in hits) {
                if (i === "0") {
                    highest = hits[i];
                    lowest = hits[i];
                } else {
                    if (hits[i].y < highest.y) {
                        highest = hits[i];
                    }

                    if (hits[i].y > lowest.y) {
                        lowest = hits[i];
                    }
                }
            }
            return [highest, lowest]
        }
    }
};

function deepCopy(value) {
    return JSON.parse(JSON.stringify(value));
}
