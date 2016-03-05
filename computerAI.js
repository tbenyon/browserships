var coordGenerator = require('./coordinateGenerator.js');
var shipsInformation = require('./ships.json');

exports.getComputerShotCoords = function(computerShotData, nextShots) {
    var coords;
    if (nextShots.length !== 0 && nextShots[0].length === 0) {
            nextShots.shift();
    }

    do {
        if (nextShots.length >= 1) {
            coords = nextShots[0].shift();
        } else {
            coords = coordGenerator.getRandomCoords();
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

    function deepCopy(value) {
        return JSON.parse(JSON.stringify(value));
    }
};

exports.reportDestroyedShip = function(computerPlayerMemory, shipName) {
    if (shipsInformation.ships[shipName].length === computerPlayerMemory.hitCoords.length) {
        computerPlayerMemory.hitCoords.length = 0;
        computerPlayerMemory.nextShots.length = 0;
    }
};
