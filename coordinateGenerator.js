exports.getRandomCoords = function() {
    var x;
    var y;
    do {
        x = Math.floor((Math.random() * 10));
        y = Math.floor((Math.random() * 10));
    } while ((x + y) % 2 === 1);

    return {
        'x': x,
        'y': y
    };

};