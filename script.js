const adjacentCellsOffset = [
    [-1, -1],
    [0, -1],
    [+1, -1],
    [+1, 0],
    [+1, +1],
    [0, +1],
    [-1, +1],
    [-1, 0]
];

let max_x = 9;
let max_y = 9;
let max_mines = 10;
let minefield = []

document.addEventListener("DOMContentLoaded", () => {
    drawBoard();
});


function drawBoard() {
    const board = document.querySelector("#minesweeper-board");

    for (let y = 0; y < max_y; y++) {
        let row = document.createElement('div');
        row.id = `minesweeper_row_${y}`
        board.appendChild(row);
        for (let x = 0; x < max_x; x++) {
            let node = document.createElement("button");
            node.addEventListener('click', revealCell);
            node.addEventListener('contextmenu', toggleFlag)
            node.className = "cell";
            node.dataset.x = `${x}`;
            node.dataset.y = `${y}`;
            row.appendChild(node);
        }
    }
}

function explode(generateExtraMine) {
    let cells = document.querySelectorAll(".cell");
    let extraMineGenerated = false;

    cells.forEach((cell) => {
        let x = cell.dataset.x;
        let y = cell.dataset.y;

        // Remove event listeners
        cell.removeEventListener("click", revealCell);
        cell.removeEventListener("contextmenu", toggleFlag);

        // Show not flagged mines
        if (minefield[x][y].isMine && cell.tagName === "BUTTON") {
            let mineImage = document.createElement("img");
            mineImage.className = "cell";
            mineImage.setAttribute("src", "assets/mine.svg");
            cell.replaceWith(mineImage);
        }

        // Generate extra mine if needed
        if(minefield[x][y].isTrap && generateExtraMine && !extraMineGenerated ){
            let mineImage = document.createElement("img");
            mineImage.className = "cell";
            mineImage.setAttribute("src", "assets/mine.svg");
            cell.replaceWith(mineImage);
            extraMineGenerated = true;
        }
    });
}

function revealCell(element) {
    let x = Number(element.target?.dataset.x ?? element.dataset.x);
    let y = Number(element.target?.dataset.y ?? element.dataset.y);
    generateMinefield(max_x, max_y, x, y);

    let cell = minefield[x][y];

    let image = document.createElement("img");
    image.className = "cell";
    image.dataset.x = `${x}`;
    image.dataset.y = `${y}`
    if (cell.isMine || cell.isTrap) {
        image.setAttribute("src", "assets/mine.svg");
        explode(!cell.isTrap);
    } else {
        image.setAttribute("src", `assets/${cell.adjacentMines}.svg`);
        if (cell.adjacentMines === 0) {
            adjacentCellsOffset.forEach((adjacentMinesOffset) => {
                if ((x + adjacentMinesOffset[0] >= 0 && x + adjacentMinesOffset[0] < max_x) &&
                    (y + adjacentMinesOffset[1] >= 0 && y + adjacentMinesOffset[1] < max_y)) {
                    minefield[x + adjacentMinesOffset[0]][y + adjacentMinesOffset[1]].isHidden = false;
                    let element = document.querySelector(
                        `[data-x='${x + adjacentMinesOffset[0]}'][data-y='${y + adjacentMinesOffset[1]}']`
                    );
                    element.click();
                }
            })
        }
    }
    element.target.replaceWith(image);
    cell.isHidden = false;
}

function toggleFlag(element) {
    element.preventDefault();

    let x = element.target.dataset.x;
    let y = element.target.dataset.y;
    let cell = minefield[x][y];
    let node;

    if (cell.isHidden) {
        if (element.target.tagName === "BUTTON") {
            node = document.createElement("img");
            node.setAttribute("src", "assets/flag.svg");
        } else {
            node = document.createElement("button");
            node.addEventListener('click', revealCell);
        }
        node.className = "cell";
        node.addEventListener('contextmenu', toggleFlag)
        node.dataset.x = `${x}`;
        node.dataset.y = `${y}`
        element.target.replaceWith(node);
    }
}

function generateMinefield(max_x, max_y, x, y) {
    if (minefield.length !== 0) {
        return;
    }

    // Build an empty minefield
    for (let y = 0; y < max_y; y++) {
        let row = [];
        for (let x = 0; x < max_x; x++) {
            row.push({
                isMine: false,
                isHidden: true,
                adjacentMines: 0,
                isTrap: false
            });
        }
        minefield.push(row);
    }

    // Place a 50/50 guess and remove reserved + placed mines
    let minesPlaced = 0;
    minesPlaced += generate5050(x, y);

    // Populate the mines
    while (minesPlaced < max_mines) {
        let random_x = Math.floor(Math.random() * max_x);
        let random_y = Math.floor(Math.random() * max_y);

        if (!minefield[random_x][random_y].isMine &&
            !(random_x === x && random_y === y) &&
            !(minefield[random_x][random_y].isTrap)) {
            minefield[random_x][random_y].isMine = true;
            minesPlaced++;

            increaseAdjacentMinesCounter(random_x, random_y);
        }
    }
}

function increaseAdjacentMinesCounter(x, y) {
    adjacentCellsOffset.forEach((adjacentCellsOffset) => {
        if ((x + adjacentCellsOffset[0] >= 0 && x + adjacentCellsOffset[0] < max_x) &&
            (y + adjacentCellsOffset[1] >= 0 && y + adjacentCellsOffset[1] < max_y)) {
            minefield[x + adjacentCellsOffset[0]][y + adjacentCellsOffset[1]].adjacentMines++;
        }
    })
}

// TODO. Optimize this aberration of a function and also add implementation for missing corners
function generate5050(x, y) {
    // Force spawn corner
    let cornerPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    let max_x_position = max_x-1;
    let max_y_position = max_y-1;

    while (true) {
        let reservedCells = [];
        let rngCorner = Math.floor(Math.random() * cornerPositions.length);

        switch (cornerPositions[rngCorner]) {
            case 'top-left':
                reservedCells = [[0, 0], [1, 0], [2, 0], [2, 1]];
                if (reservedCells.some((cell) => cell[0] === x && cell[1] === y)) break;
                minefield[0][0].isTrap = true;
                minefield[1][0].isTrap = true;
                increaseAdjacentMinesCounter(1,0);

                minefield[2][0].isMine = true;
                increaseAdjacentMinesCounter(2,0);
                minefield[2][1].isMine = true;
                increaseAdjacentMinesCounter(2,1);
                return 3;
            case 'top-right':
                reservedCells = [[max_x_position, 0], [max_x_position-1, 0], [max_x_position-2, 0], [max_x_position-2, 1]];
                if (reservedCells.some((cell) => cell[0] === x && cell[1] === y)) break;
                minefield[max_x_position][0].isTrap = true;
                minefield[max_x_position-1][0].isTrap = true;
                increaseAdjacentMinesCounter(max_x_position-1,0);

                minefield[max_x_position-2][0].isMine = true;
                increaseAdjacentMinesCounter(max_x_position-2,0);
                minefield[max_x_position-2][1].isMine = true;
                increaseAdjacentMinesCounter(max_x_position-2,1);
                return 3;
            case 'bottom-left':
                break;
            case 'bottom-right':
                break;
        }
    }
}