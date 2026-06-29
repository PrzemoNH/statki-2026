const PLACEMENT = {
  generateSharedBoard(boardSize, players) {
    const sharedBoard = BOARD.create(boardSize);
    const playerBoards = {};
    const playerShips = {};

    players.forEach(player => {
      playerBoards[player.id] = BOARD.create(boardSize);
      playerShips[player.id] = [];
    });

    const fleet = RULES.getFleet(boardSize);
    let shipIdCounter = 1;

    for (const player of players) {
      for (const { size, count } of fleet) {
        for (let i = 0; i < count; i++) {
          let placed = false;
          let maxAttempts = 500;

          while (!placed && maxAttempts > 0) {
            const isHorizontal = Math.random() > 0.5;
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);

            // Sprawdź kolizje na WSPÓLNEJ planszy
            if (RULES.canPlaceShip(sharedBoard, boardSize, row, col, size, isHorizontal)) {
              // Umieść na wspólnej planszy
              RULES.placeShip(sharedBoard, boardSize, row, col, size, isHorizontal, shipIdCounter, player.id);
              // Umieść na planszy gracza
              RULES.placeShip(playerBoards[player.id], boardSize, row, col, size, isHorizontal, shipIdCounter, player.id);

              playerShips[player.id].push({
                id: shipIdCounter,
                size,
                row,
                col,
                isHorizontal,
                owner: player.id
              });

              shipIdCounter++;
              placed = true;
            }
            maxAttempts--;
          }

          if (!placed) {
            console.warn(`⚠️ Brak miejsca na statek (${size}). Restartuję...`);
            return this.generateSharedBoard(boardSize, players);
          }
        }
      }
    }

    console.log('✅ Plansze wygenerowane!');
    for (const player of players) {
      console.log(`  👤 ${player.name}: ${playerShips[player.id].length} statków`);
    }

    return { sharedBoard, playerBoards, playerShips };
  },

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

  serializeBoard(board) {
    return JSON.stringify(board);
  },

  deserializeBoard(boardJson) {
    if (!boardJson) return null;
    if (typeof boardJson === 'string') {
      return JSON.parse(boardJson);
    }
    return boardJson;
  }
};
