
import { randomIntBetween } from "@/util/MathUtil";
export { initGrid, resetGrid, emptyGrid, addStarterPieces, placePiece, markPossibleMoves, togglePiece };

// GRID MANIPULATION

function initGrid(grid, value) {
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < 8; colIndex++) row.push(value);
        grid.push(row);
    }
}

function resetGrid(grid, value) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            grid[i][j] = value;
        }
    }
}

function emptyGrid(grid) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const arr = grid[i][j];
            while (arr.length > 0) {
                grid[i][j] = arr.pop();
            }
        }
    }
}

// PLACING PIECES & CELL VALUES

function addStarterPieces(grid) {
    // starter pieces
    const firstVal = randomIntBetween(1, 2);
    const secondVal = firstVal === 1 ? 2 : 1;
    grid[3][3] = firstVal;
    grid[3][4] = secondVal;
    grid[4][3] = secondVal;
    grid[4][4] = firstVal;
}

function placePiece(grid, possibleMovesGrid, currentPlayerVal, colIndex, rowIndex) {
    const val = getValue(grid, colIndex, rowIndex);
    if (val > 0) {
        return false;
    } else {
        const possibleTurns = getPossibleMoves(possibleMovesGrid, colIndex, rowIndex);
        if (possibleTurns.length > 0) {
            console.log('placing piece: col ' + colIndex + ', row ' + rowIndex);
            grid[rowIndex][colIndex] = currentPlayerVal;
            possibleTurns.forEach(possibleTurn => grid[possibleTurn.row][possibleTurn.col] = currentPlayerVal);
            return true;
        } else {
            return false; // can't turn anything, can't place piece
        }
    }
}

function togglePiece(grid, colIndex, rowIndex) {
    // TODO debug function
    const currValue = getValue(grid, colIndex, rowIndex);
    grid[rowIndex][colIndex] = currValue === 1 ? 2 : 1;
    console.log('aux-clicking piece: col ' + colIndex + ', row ' + rowIndex);
}

function getPossibleMoves(possibleMovesGrid, colIndex, rowIndex) {
    return possibleMovesGrid[rowIndex][colIndex];
}

function getValue(grid, colIndex, rowIndex) {
    return grid[rowIndex][colIndex];
}

function isOpponentValue(val, currentPlayerVal) {
    return val === (currentPlayerVal === 1 ? 2 : 1);
}

function isOwnValue(val, currentPlayerVal) {
    return val === currentPlayerVal;
}

// POSSIBLE MOVES GATHERING

const possibleMoveVal = -1;
const emptyCellVal = 0;

function markPossibleMoves(grid, possibleMovesGrid, currentPlayerVal) {
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        for (let colIndex = 0; colIndex < 8; colIndex++) {
            const val = getValue(grid, colIndex, rowIndex);
            if (val <= 0) {
                const possibleMoves = gatherPossibleMoves(grid, colIndex, rowIndex, currentPlayerVal);
                possibleMovesGrid[rowIndex][colIndex] = possibleMoves;
                grid[rowIndex][colIndex] = possibleMoves.length > 0 ? possibleMoveVal : emptyCellVal;
            } else {
                possibleMovesGrid[rowIndex][colIndex] = [];
            }
        }
    }
}

function gatherPossibleMoves(grid, colIndex, rowIndex, currentPlayerVal) {
    const possibleMoves = [];
    possibleMoves.push(...tryTopMove(grid, colIndex, rowIndex, currentPlayerVal));
    possibleMoves.push(...tryTopRightMove(grid, colIndex, rowIndex, currentPlayerVal));
    possibleMoves.push(...tryRightMove(grid, colIndex, rowIndex, currentPlayerVal));
    possibleMoves.push(...tryBottomRightMove(grid, colIndex, rowIndex, currentPlayerVal));
    possibleMoves.push(...tryBottomMove(grid, colIndex, rowIndex, currentPlayerVal));
    possibleMoves.push(...tryBottomLeftMove(grid, colIndex, rowIndex, currentPlayerVal));
    possibleMoves.push(...tryLeftMove(grid, colIndex, rowIndex, currentPlayerVal));
    possibleMoves.push(...tryTopLeftMove(grid, colIndex, rowIndex, currentPlayerVal));

    return possibleMoves;
}

function tryTopMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (rowIndex > 0) {
        rowIndex--;
        while (rowIndex >= 0) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            rowIndex--;
        }
    }

    return [];
}

function tryTopRightMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (colIndex < 7 && rowIndex > 0) {
        colIndex++;
        rowIndex--;
        while (colIndex <= 7 && rowIndex >= 0) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            colIndex++;
            rowIndex--;
        }
    }

    return [];
}

function tryRightMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (colIndex < 7) {
        colIndex++;
        while (colIndex <= 7) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            colIndex++;
        }
    }

    return [];
}

function tryBottomRightMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (colIndex < 7 && rowIndex < 7) {
        colIndex++;
        rowIndex++;
        while (colIndex <= 7 && rowIndex <= 7) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            colIndex++;
            rowIndex++;
        }
    }

    return [];
}

function tryBottomMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (rowIndex < 7) {
        rowIndex++;
        while (rowIndex <= 7) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            rowIndex++;
        }
    }

    return [];
}

function tryBottomLeftMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (colIndex > 0 && rowIndex < 7) {
        colIndex--;
        rowIndex++;
        while (colIndex >= 0 && rowIndex <= 7) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            colIndex--;
            rowIndex++;
        }
    }

    return [];
}

function tryLeftMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (colIndex > 0) {
        colIndex--;
        while (colIndex >= 0) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            colIndex--;
        }
    }

    return [];
}

function tryTopLeftMove(grid, colIndex, rowIndex, currentPlayerVal) {
    const opponentPieces= [];
    // if first piece is not opponent's
    if (colIndex > 0 && rowIndex > 0) {
        colIndex--;
        rowIndex--;
        while (colIndex >= 0 && rowIndex >= 0) {
            const val = getValue(grid, colIndex, rowIndex);
            if (isOpponentValue(val, currentPlayerVal)) {
                opponentPieces.push({ col: colIndex, row: rowIndex });
            } else if (isOwnValue(val, currentPlayerVal)) {
                if (isOwnValue(val, currentPlayerVal)) {
                    return opponentPieces; // ends in own piece, return gathered opponent pieces
                }
            } else {
                return [];
            }

            colIndex--;
            rowIndex--;
        }
    }

    return [];
}
