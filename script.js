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
let max_mines = 15;
let minefield = []

document.addEventListener("DOMContentLoaded", () => {
    drawBoard();
    generateMinefield(max_x, max_y);
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

function explode(){
    let cells = document.querySelectorAll(".cell");
    let mineImage = document.createElement("img");
    mineImage.className = "cell";
    mineImage.setAttribute("src", "assets/mine.svg");

    cells.forEach((cell) => {
        let x = cell.dataset.x;
        let y = cell.dataset.y;

        // Remove event listeners
        cell.removeEventListener("click", revealCell);
        cell.removeEventListener("contextmenu", toggleFlag);

        // Show not flagged mines
        if(minefield[x][y].isMine && cell.tagName === "BUTTON"){
            let mineImage = document.createElement("img");
            mineImage.className = "cell";
            mineImage.setAttribute("src", "assets/mine.svg");
            cell.replaceWith(mineImage);
        }
    });
}

function revealCell(element) {
    let x = Number(element.target?.dataset.x ?? element.dataset.x);
    let y = Number(element.target?.dataset.y ?? element.dataset.y);
    let cell = minefield[x][y];

    let image = document.createElement("img");
    image.className = "cell";
    image.dataset.x = `${x}`;
    image.dataset.y = `${y}`
    if (cell.isMine) {
        image.setAttribute("src", "assets/mine.svg");
        explode();
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

function generateMinefield(max_x, max_y) {
    // Build an empty minefield
    for (let y = 0; y < max_y; y++) {
        let row = [];
        for (let x = 0; x < max_x; x++) {
            row.push({
                isMine: false,
                isHidden: true,
                adjacentMines: 0
            });
        }
        minefield.push(row);
    }

    // Populate the mines
    let minesPlaced = 0;

    while (minesPlaced < max_mines) {
        let random_x = Math.floor(Math.random() * max_x);
        let random_y = Math.floor(Math.random() * max_y);

        if (!minefield[random_x][random_y].isMine) {
            minefield[random_x][random_y].isMine = true;
            minesPlaced++;

            // Increase adjacent mines counter
            adjacentCellsOffset.forEach((adjacentCellsOffset) => {
                if ((random_x + adjacentCellsOffset[0] >= 0 && random_x + adjacentCellsOffset[0] < max_x) &&
                    (random_y + adjacentCellsOffset[1] >= 0 && random_y + adjacentCellsOffset[1] < max_y)) {
                    minefield[random_x + adjacentCellsOffset[0]][random_y + adjacentCellsOffset[1]].adjacentMines++;
                }
            })
        }
    }
}