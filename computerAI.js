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
    var nextShotData = JSON.parse(JSON.stringify(shotData));
    nextShotData.y -= 1;
    nextShots.push(nextShotData);
};