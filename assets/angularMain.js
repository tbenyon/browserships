var app = angular.module('battleships', []);

var shipImageData = [
    {"shipId": "aircraftCarrier", "activeImg": "/images/ships/AircraftCarrier.png", "destroyedImg": "/images/ships/AircraftCarrier Destroyed.png"},
    {"shipId": "battleship", "activeImg": "/images/ships/Battleship.png", "destroyedImg": "/images/ships/Battleship Destroyed.png"},
    {"shipId": "submarine", "activeImg": "/images/ships/Submarine.png", "destroyedImg": "/images/ships/Submarine Destroyed.png"},
    {"shipId": "cruiser", "activeImg": "/images/ships/Cruiser.png", "destroyedImg": "/images/ships/Cruiser Destroyed.png"},
    {"shipId": "destroyer", "activeImg": "/images/ships/Destroyer.png", "destroyedImg": "/images/ships/Destroyer Destroyed.png"}
];

var preloadImages = function() {

    preloadImage("/images/hit.png");
    preloadImage("/images/miss.png");

    for (var i in shipImageData) {
        preloadImage(shipImageData[i].activeImg)
    }

    for (var i in shipImageData) {
        preloadImage(shipImageData[i].destroyedImg)
    }

    function preloadImage(url)
    {
        var img=new Image();
        img.src=url;
    }
};

function boardCtrl($scope, $http) {
    $scope.playerShotData = [];
    $scope.playerShipPositions = {};
    $scope.playerShipStatus = [];
    $scope.computerShotData = [];
    $scope.computerShipStatus = [];

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
            var winner = messageData.winner;
            if (winner === 'player' || winner === 'computer') {
                window.location = window.location.pathname + '/gameComplete/' + winner;
                $http.post(window.location.pathname + "/reset/", null)
            }

            var playerBoardData = messageData.playerShotData;
            $scope.playerShotData = convertBoardDataToHTMLTableViewModel(playerBoardData);
            var playerShipPositions = messageData.playerShipPositions;
            $scope.playerShipStatus = generateShipImages(messageData.playerShipStatus);
            var computerShotData = messageData.computerShotData;
            $scope.computerBoardData = convertBoardDataToHTMLTableViewModel(computerShotData);
            addShipPositionsToBoardData($scope.computerBoardData, playerShipPositions);
            $scope.computerShipStatus = generateShipImages(messageData.computerShipStatus);
        });
    };

    var generateShipImages = function(statusOfShips) {

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

    var source = new EventSource(window.location.pathname + '/state');
    source.addEventListener('message', handleStateUpdate, false);

    $scope.shoot = function(x, y) {
        var shotData = {
            cell: {
                "x": x,
                "y": y
            }
        };
        $http.post(window.location.pathname + "/shot/", shotData);
    };

    $scope.reset = function() {
        $http.post(window.location.pathname + "/reset/", null);
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
                viewModelCellState.displayClass = '/images/hit.png'
            } else if (cellState === 'M') {
                viewModelCellState.displayClass = '/images/miss.png'
            }

            return viewModelCellState;
        })
    });
}

function addShipPositionsToBoardData(board, shipPositions) {
    var i;
    var x;
    var y;
        for (var ship in shipPositions) {
        i = 0;
        for (var segment in shipPositions[ship]) {
            i ++;
            var segmentObj = shipPositions[ship][segment];
            x = segmentObj.x;
            y = segmentObj.y;
            board[y][x].shipImage = "/images/ships/" + ship + i + ".png";
            if (shipPositions[ship][segment].horizontal === true) {
                board[y][x]['class'] = 'scaleImage';
            } else {
                board[y][x]['class'] = 'rotateImage';
            }

        }
    }
};
app.controller("statCtrl", ["$scope","$http", boardCtrl]);

preloadImages(shipImageData);
