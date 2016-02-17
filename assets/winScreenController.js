var app = angular.module('winScreenModule', []);

function winScreenController($scope) {
    var winImage = "/images/win.gif";
    var loseImage = "/images/lose.gif";

    var winURL = window.location.href;

    if (winURL.indexOf("player") != -1) {
        $scope.winningPlayer = "Player has Won!!!";
        $scope.resultImage = winImage;
    } else if (winURL.indexOf("computer") != -1) {
        $scope.winningPlayer = "Computer has won?!?!";
        $scope.resultImage = loseImage;
    } else {
        $scope.winningPlayer = "Did you cheat to get to the win screen?!";
    }

}

app.controller('winController', ['$scope', winScreenController]);