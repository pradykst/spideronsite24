document.addEventListener('DOMContentLoaded', () => {
    const chessboard = document.getElementById('chessboard');
    const initialBoard = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];

    let selectedPiece = null;
    let selectedPosition = null;
    let currentPlayer = 'white';

    function renderBoard() {
        chessboard.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
                square.textContent = initialBoard[row][col];
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', onSquareClick);
                chessboard.appendChild(square);
            }
        }
        document.getElementById('current-player').textContent = `Current Player: ${currentPlayer} Selected Piece: ${selectedPiece}`;
    }

    function onSquareClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const piece = initialBoard[row][col];

        if (selectedPiece) {
            if (isValidMove(selectedPiece, selectedPosition, { row, col })) {
                initialBoard[row][col] = selectedPiece;
                initialBoard[selectedPosition.row][selectedPosition.col] = '';
                selectedPiece = null;
                selectedPosition = null;
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                renderBoard();
            } else {
                alert('Invalid move by the selected piece:'+selectedPiece);
            }
        } else if (piece && isCurrentPlayerPiece(piece)) {
            selectedPiece = piece;
            selectedPosition = { row, col };
        }
        document.getElementById('current-player').textContent = `Current Player: ${currentPlayer} Selected Piece: ${selectedPiece}`;
    }

    function isValidMoveOld(piece, from, to) {
        if (piece === '♙') {
            return isValidPawnMove(from, to, 'white');
        } else if (piece === '♟') {
            return isValidPawnMove(from, to, 'black');
        }
        return false;
    }

    function isValidMove(piece, from, to) {
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);
    
        switch (piece) {
            case '♟': // Pawn
                return isValidPawnMove(from, to, 'black');
            case '♙': // Pawn
                return isValidPawnMove(from, to, 'white');
            case '♜': // Rook
            case '♖': // Rook
                return (rowDiff === 0 || colDiff === 0) && isPathClear(from, to);
            case '♞': // Knight
            case '♘': // Knight
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
            case '♝': // Bishop
            case '♗': // Bishop
                return rowDiff === colDiff && isPathClear(from, to);
            case '♛': // Queen
            case '♕': // Queen
                return (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) && isPathClear(from, to);
            case '♚': // King
            case '♔': // King
                return rowDiff <= 1 && colDiff <= 1;
            default:
                return false;
        }
    }    

    function isValidPawnMove(from, to, color) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        if (from.col === to.col) {
            if (to.row === from.row + direction && initialBoard[to.row][to.col] === '') {
                return true;
            }
            if (from.row === startRow && to.row === from.row + 2 * direction && initialBoard[to.row][to.col] === '' && initialBoard[from.row + direction][to.col] === '') {
                return true;
            }
        }
        return false;
    }

    // function isValidPawnMove(piece, from, to, rowDiff, colDiff) {
    //     const direction = piece.startsWith('w') ? -1 : 1;
    //     const startRow = piece.startsWith('w') ? 6 : 1;
    
    //     if (colDiff === 0) {
    //         if (rowDiff === 1 && to.row - from.row === direction && !initialBoard[to.row][to.col]) {
    //             return true;
    //         }
    //         if (rowDiff === 2 && from.row === startRow && to.row - from.row === 2 * direction && !initialBoard[to.row][to.col] && !initialBoard[from.row + direction][from.col]) {
    //             return true;
    //         }
    //     } else if (colDiff === 1 && rowDiff === 1 && to.row - from.row === direction && initialBoard[to.row][to.col] && !isCurrentPlayerPiece(initialBoard[to.row][to.col])) {
    //         return true;
    //     }
    //     return false;
    // }    

    function isCurrentPlayerPiece(piece) {
        return (currentPlayer === 'white' && piece === piece.toUpperCase()) || 
               (currentPlayer === 'black' && piece === piece.toLowerCase());
    }

    function isPathClear(from, to) {
        const rowStep = Math.sign(to.row - from.row);
        const colStep = Math.sign(to.col - from.col);
        let currentRow = from.row + rowStep;
        let currentCol = from.col + colStep;
    
        while (currentRow !== to.row || currentCol !== to.col) {
            if (initialBoard[currentRow][currentCol]) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        return true;
    }

    renderBoard();
});