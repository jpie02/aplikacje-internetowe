const rows = 4, cols = 4;
let dragged = null; // przechowywanie obecnie przeciąganego elementu

let map = L.map('map').setView([53.430127, 14.564802], 18);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);

// tworzenie planszy puzzli z pustymi polami do ułożenia ich
function initPuzzleBoard() {
    const puzzleBoard = document.getElementById("puzzleBoard");
    const boardWidth = 600;
    const boardHeight = 300;
    puzzleBoard.style.width = boardWidth + "px";
    puzzleBoard.style.height = boardHeight + "px";
    puzzleBoard.style.gridTemplateColumns = `repeat(${cols}, ${boardWidth / cols}px)`;
    puzzleBoard.style.gridTemplateRows = `repeat(${rows}, ${boardHeight / rows}px)`;

    // generowanie boxa do układania puzzli z atrybutami ich pozycji
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const dropCell = document.createElement("div");
            dropCell.className = "dropCell";
            dropCell.dataset.x = x;
            dropCell.dataset.y = y;
            makeDroppable(dropCell);
            puzzleBoard.appendChild(dropCell);
        }
    }
}

initPuzzleBoard();

// pytanie o pozwolenie na wysyłanie powiadomień
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// przycisk do pobierania lokalizacji użytkownika
document.getElementById("getLocation").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 18);
    });
});

// przycisk zapisujący mapę jako canvas i generujący puzzle
document.getElementById("saveButton").addEventListener("click", () => {
    leafletImage(map, function(err, canvas) {
        if (err)
            return console.error(err);

        const puzzlePieces = document.getElementById("puzzlePieces");
        puzzlePieces.innerHTML = "";

        const pw = Math.floor(canvas.width / cols);
        const ph = Math.floor(canvas.height / rows);
        const pieces = [];

        // dzielenie canvasu mapy na 16 elementów
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const pieceCanvas = document.createElement("canvas");
                pieceCanvas.width = pw;
                pieceCanvas.height = ph;
                const ctx = pieceCanvas.getContext("2d");
                ctx.drawImage(canvas, x * pw, y * ph, pw, ph, 0, 0, pw, ph);

                const piece = document.createElement("div");
                piece.className = "piece";
                piece.style.width = pw + "px";
                piece.style.height = ph + "px";
                piece.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;
                piece.style.backgroundPosition = `${-x * pw}px ${-y * ph}px`;
                piece.draggable = true;
                piece.dataset.x = x;
                piece.dataset.y = y;

                // zapisywanie przeciąganego puzzla
                piece.addEventListener("dragstart", e => dragged = piece);
                pieces.push(piece);
            }
        }

        // losowo układa puzzle do ułożenia
        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(p => puzzlePieces.appendChild(p));
    });
});

// upuszczanie elementów na wskazany element HTML
function makeDroppable(el) {
    el.addEventListener("dragover", e => e.preventDefault());
    el.addEventListener("drop", function(e) {
        if (!dragged)
            return;

        dragged.parentNode.removeChild(dragged);

        // dodaje puzzel do nowego pola
        this.appendChild(dragged);

        // po kilku sekundach sprawdzanie, czy układanka jest skończona
        // żeby wyświetlona układanka była w całości
        requestAnimationFrame(() => checkWin());
    });
}

// upuszczanie puzzli z powrotem do boxa z elementami puzzli
const tray = document.getElementById("puzzlePieces");
makeDroppable(tray);

// sprawdzanie, czy wszystkie puzzle są na właściwych pozycjach
function checkWin() {
    const cells = document.querySelectorAll(".dropCell");
    for (let cell of cells) {
        // jeśli pole jest puste
        if (!cell.firstChild)
            return;
        const piece = cell.firstChild;

        // jeśli puzzel nie pasuje
        if (piece.dataset.x !== cell.dataset.x || piece.dataset.y !== cell.dataset.y)
            return;
    }

    // czekanie kilka sekund, aby cała układanka była wyświetlona z ostatnim puzzlem
    setTimeout(() => {
        if (Notification.permission === "granted") {
            new Notification("Puzzle ułożone!", { body: "Wspaniale!" });
        }
        alert("Puzzle ułożone!");
    }, 100);
}