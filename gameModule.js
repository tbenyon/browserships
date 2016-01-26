exports.setBlankGrid = function(board) {
        for (x = 0; x < 10; x++) {
            board[x] = [];
            for (y = 0; y < 10; y++) {
                board[x][y] = {
                    state: "O"
                }
            }
        }
    //return board;
    };

exports.checkIfShip = function(x, y, allShipsCoords) {
    for (boat in allShipsCoords) {
        for (segment in allShipsCoords[boat]) {
            if (allShipsCoords[boat][segment]["x"] === x && allShipsCoords[boat][segment]["y"] === y) {
                allShipsCoords[boat][segment]["state"] = "inactive";
                return true;
            }
        }
    }
};