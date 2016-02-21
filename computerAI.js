var coordGenerator = require('./coordinateGenerator.js');

exports.getComputerShotCoords = function(computerShotData) {
    var coords;
    do {
        coords = coordGenerator.getRandomCoords();
    } while (computerShotData[coords.x][coords.y].state != "O");

    return coords;
};