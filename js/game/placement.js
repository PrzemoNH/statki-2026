const PLACEMENT = {

  // Definicja floty dla każdego rozmiaru planszy
  getFleet(boardSize) {
    if (boardSize === 10) return [
      { id: 'ship1', size: 4, count: 1 },
      { id: 'ship2', size: 3, count: 2 },
      { id: 'ship3', size: 2, count: 3 },
      { id: 'ship4', size: 1, count: 4 }
    ];
    if (boardSize === 13) return [
      { id: 'ship1', size: 5, count: 1 },
      { id: 'ship2', size: 4, count: 1 },
      { id: 'ship3', size: 3, count: 2 },
      { id: 'ship4', size: 2, count: 3 },
      { id: 'ship5', size: 1, count: 4 }
    ];
    if (boardSize === 15) return [
      { id: 'ship1', size: 5, count: 1 },
      { id: 'ship2', size: 4, count: 2 },
      { id: 'ship3', size: 3, count: 2 },
      { id: 'ship4', size: 2, count: 4 },
      { id: 'ship5', size: 1, count: 4 }
    ];
    return [];
  },

  // Losuje pozycję dla statku i umieszcza go na planszy
  placeShip(grid, shipUid, size, isSingleMast) {
    const boardSize = grid.length;
    const maxAttempts = 200;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * (horizontal ? boardSize : boardSize - size + 1));
      const col = Math.floor(Math.random() * (horizontal ? boardSize - size + 1 : boardSize));

      const cells = RULES.getShipCells(row, col, size, horizontal);

      if (RULES.canPlace(grid, cells, shipUid, isSingleMast)) {
        for (const [r, c] of cells) {
          grid[r][c].state = 'ship';
          grid[r][c].shipId = shipUid;
        }
        return { shipUid, size, cells, horizontal };
      }
    }
    return null;
  },

  // Generuje pełną flotę na planszy
  generate(boardSize) {
    const grid = BOARD.create(boardSize);
    const fleet = this.getFleet(boardSize);
    const ships = [];
    let shipCounter = 0;

    for (const type of fleet) {
      for (let i = 0; i < type.count; i++) {
        shipCounter++;
        const shipUid = 'S' + shipCounter;
        const isSingleMast = type.size === 1;
        const result = this.placeShip(grid, shipUid, type.size, isSingleMast);

        if (!result) {
          console.warn('Nie udało się umieścić statku — restart generatora');
          return this.generate(boardSize); // restart jeśli nie ma miejsca
        }

        ships.push({ ...result, type: type.id });
      }
    }

    return { grid, ships };
  }

};
