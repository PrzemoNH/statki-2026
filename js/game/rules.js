/**
 * RULES.JS — Zasady gry i walidacja
 */

const RULES = {
  /**
   * Flota dla różnych rozmiarów planszy
   */
  FLEETS: {
    10: [
      { size: 4, count: 1 }, // 1x czteromasztowiec
      { size: 3, count: 2 }, // 2x trzymasztowiec
      { size: 2, count: 3 }, // 3x dwumasztowiec
      { size: 1, count: 4 }  // 4x jednomasztowiec
    ],
    13: [
      { size: 5, count: 1 }, // 1x pięciomasztowiec
      { size: 4, count: 1 }, // 1x czteromasztowiec
      { size: 3, count: 2 }, // 2x trzymasztowiec
      { size: 2, count: 3 }, // 3x dwumasztowiec
      { size: 1, count: 4 }  // 4x jednomasztowiec
    ],
    15: [
      { size: 5, count: 1 }, // 1x pięciomasztowiec
      { size: 4, count: 2 }, // 2x czteromasztowiec
      { size: 3, count: 2 }, // 2x trzymasztowiec
      { size: 2, count: 3 }, // 3x dwumasztowiec
      { size: 1, count: 4 }  // 4x jednomasztowiec
    ]
  },

  /**
   * Pobiera flotę dla danego rozmiaru
   */
  getFleet(boardSize) {
    return this.FLEETS[boardSize] || this.FLEETS[10];
  },

  /**
   * Liczy całkowitą liczbę statków
   */
  getTotalShipCount(boardSize) {
    return this.getFleet(boardSize).reduce((sum, ship) => sum + ship.count, 0);
  },

  /**
   * Sprawdza, czy statek można umieścić bez kolizji
   */
  canPlaceShip(board, size, row, col, length, isHorizontal, ignoredShipId = null) {
    // Sprawdzenie granic
    if (isHorizontal) {
      if (col + length > size) return false;
    } else {
      if (row + length > size) return false;
    }

    // Sprawdzenie pól zajętych przez statek
    const shipCells = [];
    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      const cell = BOARD.getCell(board, size, r, c);
      if (!cell) return false;
      if (cell.state === 'ship' && cell.shipId !== ignoredShipId) return false;
      shipCells.push({ r, c });
    }

    // Sprawdzenie otoczenia (nie mogą dotykać nawet rogami, z wyjątkiem jednomasztowców)
    if (length > 1) {
      for (const { r, c } of shipCells) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            const neighbor = BOARD.getCell(board, size, nr, nc);
            if (neighbor?.state === 'ship' && neighbor.shipId !== ignoredShipId) {
              return false;
            }
          }
        }
      }
    } else {
      // Dla jednomasztowców - mogą dotykać tylko rogami
      const diagonals = [
        { r: row - 1, c: col - 1 }, { r: row - 1, c: col + 1 },
        { r: row + 1, c: col - 1 }, { r: row + 1, c: col + 1 }
      ];
      for (const { r, c } of diagonals) {
        const neighbor = BOARD.getCell(board, size, r, c);
        if (neighbor?.state === 'ship' && neighbor.shipId !== ignoredShipId) {
          // Sprawdź, czy to wielomasztowiec
          const adjacentCells = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (Math.abs(dr) + Math.abs(dc) === 1) { // Sąsiedztwo ortogonalne
                const adj = BOARD.getCell(board, size, r + dr, c + dc);
                if (adj?.shipId === neighbor.shipId) adjacentCells.push(adj);
              }
            }
          }
          if (adjacentCells.length > 0) return false; // To wielomasztowiec, nie można
        }
      }
    }

    return true;
  },

  /**
   * Umieszcza statek na planszy
   */
  placeShip(board, size, row, col, length, isHorizontal, shipId, owner) {
    if (!this.canPlaceShip(board, size, row, col, length, isHorizontal)) return false;

    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      BOARD.setCell(board, size, r, c, {
        state: 'ship',
        owner,
        shipId,
        hit: false
      });
    }
    return true;
  },

  /**
   * Sprawdza trafienie
   */
  shoot(board, size, row, col) {
    const cell = BOARD.getCell(board, size, row, col);
    if (!cell) return { hit: false, result: 'out_of_bounds' };
    if (cell.hit) return { hit: false, result: 'already_hit' };

    cell.hit = true;

    if (cell.state === 'ship') {
      const isSunk = BOARD.isShipSunk(board, size, cell.shipId);
      return {
        hit: true,
        result: isSunk ? 'sunk' : 'hit',
        owner: cell.owner,
        shipId: cell.shipId
      };
    }

    return { hit: false, result: 'miss' };
  }
};