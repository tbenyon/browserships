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