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
    let recursionDepth = 0;
    const MAX_RECURSION = 5;

    const tryGenerateBoard = () => {
      recursionDepth++;
      if (recursionDepth > MAX_RECURSION) {
        console.error('🔴 BŁĄD: Nie mogę wygenerować planszy po ' + MAX_RECURSION + ' próbach!');
        return false;
      }

      // Zresetuj plansze
      Object.keys(playerBoards).forEach(id => {
        playerBoards[id] = BOARD.create(boardSize);
        playerShips[id] = [];
      });

      shipIdCounter = 1;

      // Generuj dla każdego gracza
      for (const player of players) {
        // Flota jest posortowana: pierwszy wielomasztowce, potem jednomasztowce
        for (const { size, count } of fleet) {
          for (let i = 0; i < count; i++) {
            let placed = false;
            let maxAttempts = 500;

            while (!placed && maxAttempts > 0) {
              const isHorizontal = Math.random() > 0.5;
              const row = Math.floor(Math.random() * boardSize);
              const col = Math.floor(Math.random() * boardSize);

              // Sprawdź czy można umieścić na planszy tego gracza
              if (RULES.canPlaceShip(playerBoards[player.id], boardSize, row, col, size, isHorizontal)) {
                // Umieść na planszy gracza
                RULES.placeShip(playerBoards[player.id], boardSize, row, col, size, isHorizontal, shipIdCounter, player.id);
                
                // Dodaj do listy statków gracza
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
              console.warn(`⚠️ Próba ${recursionDepth}: Brak miejsca na statek (${size}) dla gracza ${player.name}. Restartuję...`);
              return false; // Sygnalizuj niepowodzenie
            }
          }
        }
      }

      return true; // Sukces
    };

    // Próbuj generować aż do MAX_RECURSION
    const success = tryGenerateBoard();

    if (!success) {
      console.error('❌ Nie udało się wygenerować planszy! Użyj domyślnego rozkładu.');
      return { sharedBoard: BOARD.create(boardSize), playerBoards, playerShips };
    }

    // Zbuduj wspólną planszę z wszystkich plansz graczy
    for (const playerId in playerBoards) {
      const board = playerBoards[playerId];
      for (let i = 0; i < board.length; i++) {
        if (board[i].state === 'ship') {
          sharedBoard[i] = { ...board[i] };
        }
      }
    }

    console.log('✅ Plansze wygenerowane pomyślnie!');
    for (const player of players) {
      const ships = playerShips[player.id];
      const shipCells = ships.reduce((sum, ship) => sum + ship.size, 0);
      console.log(`  👤 ${player.name}: ${ships.length} statków | Pola: ${shipCells}/${RULES.getTotalShipCells(boardSize)}`);
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
