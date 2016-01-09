var app = angular.module('battleships', []);

function boardCtrl($scope, $http) {

    $scope.statusOfShips = {};
    $scope.shipNames = ["Aircraft Carrier", "Battleship", "Submarine", "Cruiser", "Destroyer"];
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
            var boardData = JSON.parse(msg.data).board;
            $scope.board = convertBoardDataToHTMLTableViewModel(boardData);

            $scope.statusOfShips = JSON.parse(msg.data).shipStatus;
        });
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
