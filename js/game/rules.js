/**
 * RULES.JS — Zasady gry i walidacja
 * 
 * Logika sąsiedztwa statków:
 * - Jednomasztowiec (A): może dotykać rogami WSZYSTKIEGO (A i B), nie może dotykać bokami
 * - Wielomasztowiec (B): nie może dotykać bokami, po przekątnej tylko jeśli sąsiad to A
 */

const RULES = {
  /**
   * Flota dla różnych rozmiarów planszy (posortowana od największych)
   */
  FLEETS: {
    10: [
      { size: 3, count: 1 }, // 1x trzymasztowiec (3 pola)
      { size: 2, count: 2 }, // 2x dwumasztowce (4 pola)
      { size: 1, count: 3 }  // 3x jednomasztowce (3 pola) = 10 pół TOTAL
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
   * Liczy całkowitą liczbę pól zajętych przez statki
   */
  getTotalShipCells(boardSize) {
    return this.getFleet(boardSize).reduce((sum, ship) => sum + (ship.size * ship.count), 0);
  },

  /**
   * Sprawdza czy pole należy do jednomasztowca (A)
   */
  isSingleMastCell(board, boardSize, r, c) {
    const cell = BOARD.getCell(board, boardSize, r, c);
    if (!cell || cell.state !== 'ship') return false;
    
    // Sprawdź czy ma sąsiadów ortogonalnie (boki)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (Math.abs(dr) + Math.abs(dc) !== 1) continue; // Tylko boki (nie rogi)
        const neighbor = BOARD.getCell(board, boardSize, r + dr, c + dc);
        if (neighbor?.shipId === cell.shipId) return false; // Ma sąsiada o tym samym ID = wielomasztowiec
      }
    }
    return true; // Brak sąsiadów ortogonalnych = jednomasztowiec
  },

  /**
   * Sprawdza, czy statek można umieścić bez kolizji
   * 
   * Zasady:
   * - Jednomasztowiec (A): może dotykać rogami wszystkiego, nie może dotykać bokami
   * - Wielomasztowiec (B): nie może dotykać bokami, po przekątnej tylko A
   */
  canPlaceShip(board, boardSize, row, col, length, isHorizontal) {
    // Sprawdzenie granic
    if (isHorizontal && col + length > boardSize) return false;
    if (!isHorizontal && row + length > boardSize) return false;

    const isSingleMast = length === 1;

    // Sprawdzenie czy pola nie są zajęte
    const shipCells = [];
    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      const cell = BOARD.getCell(board, boardSize, r, c);
      if (!cell) return false;
      if (cell.state === 'ship') return false;
      shipCells.push({ r, c });
    }

    // Sprawdzenie sąsiedztwa
    for (const { r, c } of shipCells) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;

          const nr = r + dr;
          const nc = c + dc;
          const neighbor = BOARD.getCell(board, boardSize, nr, nc);

          if (!neighbor || neighbor.state !== 'ship') continue;

          const isDiagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;
          const neighborIsSingle = this.isSingleMastCell(board, boardSize, nr, nc);

          if (isSingleMast) {
            // A: może dotykać rogami wszystkiego (A i B)
            // A: nie może dotykać bokami niczego
            if (!isDiagonal) return false; // Dotyk bokiem? NIE
            // Dotyk rogiem? TAK, zawsze ok
          } else {
            // B: nie może dotykać bokami niczego
            if (!isDiagonal) return false; // Dotyk bokiem? NIE
            // B: po przekątnej — tylko jeśli sąsiad to A
            if (isDiagonal && !neighborIsSingle) return false; // Po rogiem z B? NIE
          }
        }
      }
    }

    return true;
  },

  /**
   * Umieszcza statek na planszy
   */
  placeShip(board, boardSize, row, col, length, isHorizontal, shipId, owner) {
    if (!this.canPlaceShip(board, boardSize, row, col, length, isHorizontal)) return false;

    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      BOARD.setCell(board, boardSize, r, c, {
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
  shoot(board, boardSize, row, col) {
    const cell = BOARD.getCell(board, boardSize, row, col);
    if (!cell) return { hit: false, result: 'out_of_bounds' };
    if (cell.hit) return { hit: false, result: 'already_hit' };

    cell.hit = true;

    if (cell.state === 'ship') {
      const isSunk = BOARD.isShipSunk(board, boardSize, cell.shipId);
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
