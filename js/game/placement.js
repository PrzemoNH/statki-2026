/**
 * PLACEMENT.JS — Generowanie wspólnej planszy dla wszystkich graczy
 * Każdy gracz ma swoją mapę, ale wszystkie statki są na jednej wspólnej siatce
 * Statki różnych graczy nie mogą się nakładać na tych samych polach
 */

const PLACEMENT = {
  /**
   * Generuje wspólną planszę dla wszystkich graczy
   * Zwraca obiekt: { board: [...], playerBoards: {...}, ships: {...} }
   */
  generateSharedBoard(boardSize, players) {
    const sharedBoard = BOARD.create(boardSize);
    const playerBoards = {};
    const playerShips = {};

    // Inicjalizuj tablice dla każdego gracza
    players.forEach(player => {
      playerBoards[player.id] = BOARD.create(boardSize);
      playerShips[player.id] = [];
    });

    const fleet = RULES.getFleet(boardSize);
    let shipIdCounter = 1;

    // Dla każdego gracza umieść statki
    for (const player of players) {
      // Dla każdego typu statku w flocie
      for (const { size, count } of fleet) {
        for (let i = 0; i < count; i++) {
          let placed = false;
          let attempts = 0;

          // Spróbuj umieścić statek
          while (!placed && attempts < 100) {
            const isHorizontal = Math.random() > 0.5;
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);

            // Sprawdzenie - czy można umieścić na wspólnej planszy
            if (RULES.canPlaceShip(sharedBoard, boardSize, row, col, size, isHorizontal)) {
              // Umieść na wspólnej planszy
              RULES.placeShip(sharedBoard, boardSize, row, col, size, isHorizontal, shipIdCounter, player.id);

              // Umieść na planszy gracza
              RULES.placeShip(playerBoards[player.id], boardSize, row, col, size, isHorizontal, shipIdCounter, player.id);

              // Zapisz informacje o statku
              playerShips[player.id].push({
                id: shipIdCounter,
                size,
                row,
                col,
                isHorizontal,
                owner: player.id,
                cells: this.getShipCells(row, col, size, isHorizontal)
              });

              shipIdCounter++;
              placed = true;
            }
            attempts++;
          }

          if (!placed) {
            console.error(`❌ Nie udało się umieścić statku (rozmiar ${size}) dla gracza ${player.id}`);
          }
        }
      }
    }

    return {
      sharedBoard,
      playerBoards,
      playerShips
    };
  },

  /**
   * Generuje planszę dla pojedynczego gracza (STARY FORMAT - dla kompatybilności)
   */
  generate(boardSize) {
    const board = BOARD.create(boardSize);
    const fleet = RULES.getFleet(boardSize);
    const ships = [];
    let shipIdCounter = 1;

    for (const { size, count } of fleet) {
      for (let i = 0; i < count; i++) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
          const isHorizontal = Math.random() > 0.5;
          const row = Math.floor(Math.random() * boardSize);
          const col = Math.floor(Math.random() * boardSize);

          if (RULES.canPlaceShip(board, boardSize, row, col, size, isHorizontal)) {
            RULES.placeShip(board, boardSize, row, col, size, isHorizontal, shipIdCounter, 1);
            ships.push({
              id: shipIdCounter,
              size,
              row,
              col,
              isHorizontal,
              cells: this.getShipCells(row, col, size, isHorizontal)
            });
            shipIdCounter++;
            placed = true;
          }
          attempts++;
        }
      }
    }

    return { grid: board, ships };
  },

  /**
   * Zwraca koordynaty pól statku
   */
  getShipCells(row, col, size, isHorizontal) {
    const cells = [];
    for (let i = 0; i < size; i++) {
      cells.push({
        row: isHorizontal ? row : row + i,
        col: isHorizontal ? col + i : col
      });
    }
    return cells;
  },

  /**
   * Konwertuje planszę do formatu JSONB dla Supabase
   */
  serializeBoard(board) {
    return JSON.stringify(board);
  },

  /**
   * Deserializuje planszę z Supabase
   */
  deserializeBoard(boardJson) {
    if (!boardJson) return null;
    if (typeof boardJson === 'string') {
      return JSON.parse(boardJson);
    }
    return boardJson;
  }
};