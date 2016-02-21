exports.getRandomCoords = function() {
    var x = Math.floor((Math.random() * 10));
    var y = Math.floor((Math.random() * 10));
    return {
        'x': x,
        'y': y
    };

};