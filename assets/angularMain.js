var app = angular.module('battleships', []);

function boardCtrl($scope) {

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
        });
    };

    var source = new EventSource('/state');
    source.addEventListener('message', handleStateUpdate, false);
}

function convertBoardDataToHTMLTableViewModel(board) {
    return board[0].map(function(col, i) {
        return board.map(function(row) {
            return row[i];
        })
    });
}

app.controller("statCtrl", ["$scope", boardCtrl]);
