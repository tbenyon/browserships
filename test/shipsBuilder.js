var shipPlacement = require('../shipPlacement.js');
var testShipData = require('../ships.json');


exports.shipsBuilder = function() {
    var shipData = testShipData.ships;
    return {
            withCruiserAt: function(x, y, horizontal) {
                shipData.cruiser = {
                    "coord": {
                        "x": x,
                        "y": y
                    },
                    "length": 2,
                        "state": "active",
                        "horizontal": horizontal
                };
                return this;
            },

            build: function() {
                return shipPlacement.checkAndStoreDefinedShipPlacement(shipData);
            }
    };
};