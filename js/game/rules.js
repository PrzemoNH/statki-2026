const RULES = {
  FLEETS: {
    10: [
      { size: 4, count: 1 },
      { size: 3, count: 2 },
      { size: 2, count: 3 },
      { size: 1, count: 4 }
    ],
    13: [
      { size: 5, count: 1 },
      { size: 4, count: 1 },
      { size: 3, count: 2 },
      { size: 2, count: 3 },
      { size: 1, count: 4 }
    ],
    15: [
      { size: 5, count: 1 },
      { size: 4, count: 2 },
      { size: 3, count: 2 },
      { size: 2, count: 3 },
      { size: 1, count: 4 }
    ]
  },

  getFleet(boardSize) {
    return this.FLEETS[boardSize] || this.FLEETS[10];
  },

  getTotalShipCount(boardSize) {
    return this.getFleet(boardSize).reduce((sum, ship) => sum + ship.count, 0);
  },

  getTotalShipCells(boardSize) {
    return this.getFleet(boardSize).reduce((sum, ship) => sum + (ship.size * ship.count), 0);
  },

  isSingleMastCell(board, boardSize, r, c) {
    const cell = BOARD.getCell(board, boardSize, r, c);
    if (!cell || cell.state !== 'ship') return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (Math.abs(dr) + Math.abs(dc) !== 1) continue;
        const neighbor = BOARD.getCell(board, boardSize, r + dr, c + dc);
        if (neighbor?.shipId === cell.shipId) return false;
      }
    }
    return true;
  },

  canPlaceShip(board, boardSize, row, col, length, isHorizontal) {
    if (isHorizontal && col + length > boardSize) return false;
    if (!isHorizontal && row + length > boardSize) return false;

    const isSingleMast = length === 1;

    const shipCells = [];
    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      const cell = BOARD.getCell(board, boardSize, r, c);
      if (!cell) return false;
      if (cell.state === 'ship') return false;
      shipCells.push({ r, c });
    }

    for (const { r, c } of shipCells) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;

          const nr = r + dr;
          const nc = c + dc;
          const neighbor = BOARD.getCell(board, boardSize, nr, nc);
          if (!neighbor || neighbor.state !== 'ship') continue;

          const isDiagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;

          if (!isDiagonal) return false;

          if (!isSingleMast && isDiagonal) {
            const neighborIsSingle = this.isSingleMastCell(board, boardSize, nr, nc);
            if (!neighborIsSingle) return false;
          }
        }
      }
    }

    return true;
  },

  placeShip(board, boardSize, row, col, length, isHorizontal, shipId, owner) {
    if (!this.canPlaceShip(board, boardSize, row, col, length, isHorizontal)) return false;
    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      BOARD.setCell(board, boardSize, r, c, { state: 'ship', owner, shipId, hit: false });
    }
    return true;
  },

  shoot(board, boardSize, row, col) {
    const cell = BOARD.getCell(board, boardSize, row, col);
    if (!cell) return { hit: false, result: 'out_of_bounds' };
    if (cell.hit) return { hit: false, result: 'already_hit' };
    cell.hit = true;
    if (cell.state === 'ship') {
      const isSunk = BOARD.isShipSunk(board, boardSize, cell.shipId);
      return { hit: true, result: isSunk ? 'sunk' : 'hit', owner: cell.owner, shipId: cell.shipId };
    }
    return { hit: false, result: 'miss' };
  }
};
