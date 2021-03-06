var assert = require('chai').assert;
var mockery = require('mockery');
var builderModule = require('./shipsBuilder.js');

var shipsBuilder = new builderModule.shipsBuilder();

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

        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

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
        it('should store next shot lines for the four surrounding cells', function () {
            testResultGenerator.initResults([{x: 3, y: 3}]);

            var playerShipPositions = shipsBuilder.build();
            var testGameData = setUpShotDataAndTakeShots(1, playerShipPositions);
            var nextShots = testGameData.nextShots;

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

            var playerShipPositions = shipsBuilder.build();
            var testGameData = setUpShotDataAndTakeShots(2, playerShipPositions);
            var testBoardData = testGameData.testBoardData;
            var nextShots = testGameData.nextShots;

            var nextShot = AI.getComputerShotCoords(testBoardData, nextShots);

            assert.propertyVal(nextShot, 'x', 1);
            assert.propertyVal(nextShot, 'y', 0);
        });
    });

    describe('When a ship is destroyed with the correct amount of shots', function() {
        it('should clear the stored next shots', function() {
            testResultGenerator.initResults([
                {x: 9, y: 4}
            ]);

            var playerShipPositions = shipsBuilder.build();
            var testGameData = setUpShotDataAndTakeShots(3, playerShipPositions);
            var nextShots = testGameData.nextShots;

            assert.equal(nextShots.length, 0);
        });
    });

    describe('Once an initial hit has been made and this is followed by a miss', function() {
        it('should delete the current attack plan', function() {
            testResultGenerator.initResults([
                {x: 9, y: 3}
            ]);

            var playerShipPositions = shipsBuilder.build();
            var testGameData = setUpShotDataAndTakeShots(3, playerShipPositions);
            var testBoardData = testGameData.testBoardData;
            var nextShots = testGameData.nextShots;
            var nextShot = AI.getComputerShotCoords(testBoardData, nextShots);

            assert.propertyVal(nextShot, 'x', 9);
            assert.propertyVal(nextShot, 'y', 4);
        });
    });

    describe('When a horizontal ship is against the left side of the board', function() {
        it('should not shoot off the grid', function() {
            testResultGenerator.initResults([
                {x: 0, y: 7},
                {x: 6, y: 8}
            ]);

            var playerShipPositions = shipsBuilder.build();
            var testGameData = setUpShotDataAndTakeShots(3, playerShipPositions);
            var testBoardData = testGameData.testBoardData;
            var nextShots = testGameData.nextShots;

            var nextShot = AI.getComputerShotCoords(testBoardData, nextShots);

            assert.propertyVal(nextShot, 'x', 1);
            assert.propertyVal(nextShot, 'y', 7);
        });
    });

    describe('When shooting at position that is already taken', function() {
        it('should shoot at the next location', function() {
            testResultGenerator.initResults([
                {x: 0, y: 1},
                {x: 0, y: 4},
                {x: 9, y: 9}
            ]);
            var playerShipPositions = shipsBuilder.build();
            var testGameData = setUpShotDataAndTakeShots(4, playerShipPositions);
            var testBoardData = testGameData.testBoardData;
            var nextShots = testGameData.nextShots;

            var nextShot = AI.getComputerShotCoords(testBoardData, nextShots);

            assert.propertyVal(nextShot, 'x', 0);
            assert.propertyVal(nextShot, 'y', 5);
        });
    });

    describe('When a ship is destroyed with more shots than are required', function () {
        it('should add to nextShots for the hits that were not part of the destroyed ship', function() {
            testResultGenerator.initResults([
                {x: 3, y: 3},
                {x: 0, y: 4},
                {x: 9, y: 9}
            ]);
            var playerShipPositions = shipsBuilder.build();
            var testGameData = setUpShotDataAndTakeShots(5, playerShipPositions);
            var nextShots = testGameData.nextShots;

            assert.equal(nextShots.length, 4);

            assert.propertyVal(nextShots[0][0], 'x', 3);
            assert.propertyVal(nextShots[0][0], 'y', 0);

            assert.propertyVal(nextShots[1][0], 'x', 3);
            assert.propertyVal(nextShots[1][0], 'y', 2);

            assert.propertyVal(nextShots[1][1], 'x', 3);
            assert.propertyVal(nextShots[1][1], 'y', 3);

            assert.propertyVal(nextShots[2][2], 'x', 0);
            assert.propertyVal(nextShots[2][2], 'y', 1);

            assert.propertyVal(nextShots[3][0], 'x', 4);
            assert.propertyVal(nextShots[3][0], 'y', 1);
        })
    });

    function setUpShotDataAndTakeShots(numberOfShots, playerShipPositions) {
        var testBoardData = getBlankGrid();
        var nextShots = [];
        var hitCoords = [];
        for (var i = 0; i < numberOfShots; i++) {
            gameModule.computerShot({
                'computerShotData': testBoardData,
                'playerShipPositions': playerShipPositions,
                'computerPlayerMemory': {
                    'nextShots': nextShots,
                    'hitCoords': hitCoords
                }
            });
        }
        return {
            testBoardData: testBoardData,
            nextShots: nextShots
        }
    }
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
