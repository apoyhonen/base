
import { randomIntBetween } from "@/util/MathUtil";
export { initGrid, resetGrid, addStarterPieces, placePiece, markPossibleMoves, togglePiece };

function initGrid(grid) {
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < 8; colIndex++) row.push(0);
        grid.push(row);
    }
}

function resetGrid(grid) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            grid[i][j] = 0;
        }
    }
}

function addStarterPieces(grid) {
    // starter pieces
    const firstVal = randomIntBetween(1, 2);
    const secondVal = firstVal === 1 ? 2 : 1;
    grid[3][3] = firstVal;
    grid[3][4] = secondVal;
    grid[4][3] = secondVal;
    grid[4][4] = firstVal;
}

function placePiece(grid, currentPlayerVal, colIndex, rowIndex) {
    const val = getValue(grid, colIndex, rowIndex);
    if (val > 0) {
        return false;
    } else {
        // TODO check if is possible move and only do/return true if yes
        console.log('placing piece: col ' + colIndex + ', row ' + rowIndex);
        grid[rowIndex][colIndex] = currentPlayerVal;
        return true;
    }
}

function togglePiece(grid, colIndex, rowIndex) {
    // TODO debug function
    const currValue = getValue(grid, colIndex, rowIndex);
    grid[rowIndex][colIndex] = currValue === 1 ? 2 : 1;
    console.log('aux-clicking piece: col ' + colIndex + ', row ' + rowIndex);
}

const possibleMoveVal = -1;
//const emptyCellVal = 0;

function markPossibleMoves(grid) {
    if (grid.length === 0) return;

    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        for (let colIndex = 0; colIndex < 8; colIndex++) {
            const val = getValue(grid, colIndex, rowIndex);
            if (val <= 0) {
                grid[rowIndex][colIndex] = possibleMoveVal;
                //game[row][col] = cellMovePossible(col, row) ? possibleMoveVal : emptyCellVal;
            }
        }
    }
}

function getValue(grid, colIndex, rowIndex) {
    return grid[rowIndex][colIndex];
}

/*
function cellMovePossible(colIndex, rowIndex) {
    return tryTopMove(colIndex, rowIndex)
        || tryTopRightMove(colIndex, rowIndex)
        || tryRightMove(colIndex, rowIndex)
        || tryBottomRightMove(colIndex, rowIndex)
        || tryBottomMove(colIndex, rowIndex)
        || tryBottomLeftMove(colIndex, rowIndex)
        || tryLeftMove(colIndex, rowIndex)
        || tryTopLeftMove(colIndex, rowIndex);
}

function isOpponentPiece(colIndex, rowIndex) {
    const val = getValue(colIndex, rowIndex);
    return isOwnValue(val) || val <= 0;
}

function isOpponentValue(val) {
    return val === (currentPlayer.value === 1 ? 2 : 1);
}

function isOwnValue(val) {
    return val === currentPlayer.value;
}

/*
function tryTopMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (rowIndex <= 0 || !isOpponentPiece(colIndex, --rowIndex)) return false;

    while (--rowIndex >= 0) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

function tryTopRightMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (colIndex >= 7 || rowIndex <= 0 || !isOpponentPiece(++colIndex, --rowIndex)) return false;

    while (++colIndex <= 7 && --rowIndex >= 0) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

function tryRightMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (colIndex >= 7 || !isOpponentPiece(++colIndex, rowIndex)) return false;

    while (++colIndex <= 7) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

function tryBottomRightMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (colIndex >= 7 || rowIndex >= 7 || !isOpponentPiece(++colIndex, ++rowIndex)) return false;

    while (++colIndex <= 7 && ++rowIndex <= 7) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

function tryBottomMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (rowIndex >= 7 || !isOpponentPiece(colIndex, ++rowIndex)) return false;

    while (++rowIndex <= 7) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

function tryBottomLeftMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (colIndex <= 0 || rowIndex >= 7 || !isOpponentPiece(--colIndex, ++rowIndex)) return false;

    while (--colIndex >= 0 && ++rowIndex <= 7) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

function tryLeftMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (colIndex <= 0 || !isOpponentPiece(--colIndex, rowIndex)) return false;

    while (--colIndex >= 0) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

function tryTopLeftMove(colIndex, rowIndex) {

    // if first piece is not opponent's
    if (colIndex <= 0 || rowIndex <= 0 || !isOpponentPiece(--colIndex, --rowIndex)) return false;

    while (--colIndex >= 0 && --rowIndex >= 0) {
        const val = getValue(colIndex, rowIndex);
        if (!isOpponentValue(val)) {
            if (isOwnValue(val)) {
                return true; // ends in own piece
            } else {
                break; // no piece
            }
        }
    }

    return false;
}

 */
