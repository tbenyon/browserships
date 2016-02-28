var coordGenerator = require('./coordinateGenerator.js');

var nextShots = [];

exports.getComputerShotCoords = function(computerShotData) {
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

exports.reportHit = function(shotData) {
    var nextShotData = JSON.parse(JSON.stringify(shotData));
    nextShotData.y -= 1;
    nextShots.push(nextShotData);
};