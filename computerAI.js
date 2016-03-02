var coordGenerator = require('./coordinateGenerator.js');

exports.getComputerShotCoords = function(computerShotData, nextShots) {
    var coords;

    do {
        if (nextShots.length >= 1) {
            coords = nextShots.shift();
        } else {
            coords = coordGenerator.getRandomCoords();
        }
    } while (computerShotData[coords.x][coords.y].state != "O");
    return coords;
};

exports.reportHit = function(shotData, nextShots) {
    var nextShotData = deepCopy(shotData);
    nextShotData.y -= 1;
    nextShots.push(deepCopy(nextShotData));
    nextShotData.y += 2;
    nextShots.push(deepCopy(nextShotData));
    nextShotData.y -= 1;

    nextShotData.x -= 1;
    nextShots.push(deepCopy(nextShotData));
    nextShotData.x += 2;
    nextShots.push(deepCopy(nextShotData));

    function deepCopy(value) {
        var newValue = JSON.parse(JSON.stringify(value));
        return newValue
    }
};