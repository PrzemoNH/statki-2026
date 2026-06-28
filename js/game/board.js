/**
 * BOARD.JS — Logika manipulacji planszą
 * Zarządza stanem pola: woda, statek, trafienie
 */

const BOARD = {
  /**
   * Tworzy pustą planszę
   */
  create(size) {
    const board = [];
    for (let i = 0; i < size * size; i++) {
      board.push({
        state: 'water',  // 'water' | 'ship'
        owner: null,     // ID gracza
        shipId: null,    // ID statku
        hit: false       // Czy pole zostało trafione
      });
    }
    return board;
  },

  /**
   * Pobiera pole na planszy
   */
  getCell(board, size, row, col) {
    if (row < 0 || row >= size || col < 0 || col >= size) return null;
    return board[row * size + col];
  },

  /**
   * Ustawia pole na planszy
   */
  setCell(board, size, row, col, data) {
    if (row < 0 || row >= size || col < 0 || col >= size) return false;
    board[row * size + col] = { ...board[row * size + col], ...data };
    return true;
  },

  /**
   * Pobiera statek z planszy
   */
  getShip(board, size, shipId) {
    const cells = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i].shipId === shipId) {
        const row = Math.floor(i / size);
        const col = i % size;
        cells.push({ row, col, ...board[i] });
      }
    }
    return cells;
  },

  /**
   * Sprawdza, czy wszystkie pola statku zostały trafione
   */
  isShipSunk(board, size, shipId) {
    const cells = this.getShip(board, size, shipId);
    return cells.length > 0 && cells.every(c => c.hit);
  },

  /**
   * Tworzy linijkę HTML do debugowania
   */
  toDebugString(board, size) {
    let str = '\n';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = this.getCell(board, size, r, c);
        if (cell.state === 'ship') str += '🚢';
        else if (cell.hit) str += '❌';
        else str += '·';
      }
      str += '\n';
    }
    return str;
  }
};