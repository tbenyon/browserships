var app = angular.module('battleships', []);

function boardCtrl($scope, $http) {
    $scope.frontEndShipData = [];
    $scope.board = {};
    $scope.rowLabels = function() {
        var vals = [];
        for(var i = 0; i < 26; i++) {
            vals.push(String.fromCharCode(65 + i));
        }
        return vals;
    }();

    var handleStateUpdate = function (msg) {
        $scope.$apply(function () {
            var messageData = JSON.parse(msg.data);
            var boardData = messageData.board;
            $scope.board = convertBoardDataToHTMLTableViewModel(boardData);
            $scope.frontEndShipData = generateShipImages(messageData.shipStatus);
        });
    };

    var generateShipImages = function(statusOfShips) {
        var shipImageData = [
            {"shipId": "aircraftCarrier", "activeImg": "images/ships/AircraftCarrier.png", "destroyedImg": "images/ships/AircraftCarrier Destroyed.png"},
            {"shipId": "battleship", "activeImg": "images/ships/Battleship.png", "destroyedImg": "images/ships/Battleship Destroyed.png"},
            {"shipId": "submarine", "activeImg": "images/ships/Submarine.png", "destroyedImg": "images/ships/Submarine Destroyed.png"},
            {"shipId": "cruiser", "activeImg": "images/ships/Cruiser.png", "destroyedImg": "images/ships/Cruiser Destroyed.png"},
            {"shipId": "destroyer", "activeImg": "images/ships/Destroyer.png", "destroyedImg": "images/ships/Destroyer Destroyed.png"}
        ];

        var shipImagePaths = [];
        for (var i in statusOfShips) {
            var shipState = statusOfShips[i];
            var shipImages = shipImageData.find(function(ship) {
                return (ship.shipId === shipState.ship);
            });
            var shipImage = shipState.status === "Active" ? shipImages.activeImg : shipImages.destroyedImg;
            shipImagePaths.push({"img": shipImage})
        }
        return shipImagePaths;
    };

    var source = new EventSource('/state');
    source.addEventListener('message', handleStateUpdate, false);

    $scope.shoot = function(x, y) {
        var shotData = {
            cell: {
                "x": x,
                "y": y
            }
        };
        $http.post("/shot/", shotData);
    };

    $scope.reset = function() {
        $http.post("/reset/", null);
    };
}

function convertBoardDataToHTMLTableViewModel(board) {
    return board[0].map(function(col, i) {
        return board.map(function(row) {
            var viewModelCellState = {
                displayClass: 'unknown'
            };

            var cellState = row[i].state;
            if (cellState === 'H') {
                viewModelCellState.displayClass = 'hit'
            } else if (cellState === 'M') {
                viewModelCellState.displayClass = 'miss'
            }

            return viewModelCellState;
        })
    });
}

app.controller("statCtrl", ["$scope","$http", boardCtrl]);
