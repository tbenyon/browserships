var assert = require('chai').assert;
var mockery = require('mockery');
var testShipPositions = require('../ships.json');

describe('Computer Player', function() {

    var testResultGenerator = function() {

        var results = [];
        return {
            initResults: function(testResults) {
              results = testResults;
            },
            stub: {
                getRandomCoords: function() {
                    return results.shift();
                }
            }
        };
    }();

    var AI = null;
    var gameModule = null;
    before(function () {
        mockery.enable();
        mockery.registerMock('./coordinateGenerator.js', testResultGenerator.stub);
        mockery.registerMock('./shipPlacement.js', {generateRandom: function() {
            return testShipPositions;
        }});
        mockery.registerAllowable('../computerAI.js');
        AI = require("../computerAI.js");
        gameModule = require("../gameModule.js");
    });

    after(function() {
        mockery.disable();
    });


    describe('For an empty board', function() {
        it('should select a random coordinate', function() {
            testResultGenerator.initResults([{x: 2, y: 2}]);

            var testBoardData = getBlankGrid();
            var nextShot = AI.getComputerShotCoords(testBoardData, []);
            assert.propertyVal(nextShot, 'x', 2);
            assert.propertyVal(nextShot, 'y', 2);
        });
    });

    describe('For a position already shot at', function() {
       it('should request a different set of coordinates', function() {
           testResultGenerator.initResults([
               {x: 3, y: 3},
               {x: 3, y: 3},
               {x: 2, y: 2}
           ]);

           var testBoardData = getBlankGrid();
           testBoardData[3][3].state = "M";
           var nextShot = AI.getComputerShotCoords(testBoardData, []);
           assert.propertyVal(nextShot, 'x', 2);
           assert.propertyVal(nextShot, 'y', 2);
       });
    });

    describe('When an initial hit is made', function() {
        it('should store next shot lines for the four surrounding cells', function() {
            testResultGenerator.initResults([{x: 3, y: 3}]);

            var testBoardData = getBlankGrid();
            var nextShots = [];


            gameModule.computerShot({
                    computerShotData: testBoardData,
                    playerShipPositions: testShipPositions.ships,
                    computerNextShots: nextShots
            });

            assert.propertyVal(nextShots[0][0], 'x', 3);
            assert.propertyVal(nextShots[0][0], 'y', 2);

            assert.propertyVal(nextShots[0][1], 'x', 3);
            assert.propertyVal(nextShots[0][1], 'y', 1);

            assert.propertyVal(nextShots[1][0], 'x', 3);
            assert.propertyVal(nextShots[1][0], 'y', 4);

            assert.propertyVal(nextShots[2][0], 'x', 2);
            assert.propertyVal(nextShots[2][0], 'y', 3);

            assert.propertyVal(nextShots[2][1], 'x', 1);
            assert.propertyVal(nextShots[2][1], 'y', 3);

            assert.propertyVal(nextShots[3][5], 'x', 9);
            assert.propertyVal(nextShots[3][5], 'y', 3);
        });

        it('should make the next shot at the coordinate above', function() {
           testResultGenerator.initResults([
               {x: 3, y: 0},
               {x: 1, y: 1},
               {x: 2, y: 2}
           ]);

            var testBoardData = getBlankGrid();
            var nextShots = [];

            for (var i = 0; i < 2; i++) {
                gameModule.computerShot({
                    computerShotData: testBoardData,
                    playerShipPositions: testShipPositions.ships,
                    computerNextShots: nextShots
                });
            }

            var nextShot = AI.getComputerShotCoords(testBoardData, nextShots);

            assert.propertyVal(nextShot, 'x', 1);
            assert.propertyVal(nextShot, 'y', 0);
        });
    });
});



var getBlankGrid = function() {
    var board = [];
    for (var x = 0; x < 10; x++) {
        board[x] = [];
        for (var y = 0; y < 10; y++) {
            board[x][y] = {
                state: "O"
            }
        }
    }
    return board;
};