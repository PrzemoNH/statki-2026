/**
 * SHOOTER.JS — System strzelania i aktualizacji planszy
 * Obsługuje: HIT, MISS, SUNK, turn management
 */

const SHOOTER = {
  /**
   * Strzelanie do pola na planszy wroga
   */
  shoot(enemyBoard, boardSize, row, col) {
    return RULES.shoot(enemyBoard, boardSize, row, col);
  },

  /**
   * Przetwarza wynik strzału i zwraca UI info
   */
  processShot(result) {
    if (result.result === 'already_hit') {
      return { type: 'already_hit', message: '❌ Już strzelałeś tu!', color: '#ffaa00' };
    }
    if (result.result === 'out_of_bounds') {
      return { type: 'out_of_bounds', message: '❌ Poza planszą!', color: '#ff4d4d' };
    }
    if (result.result === 'sunk') {
      return { type: 'sunk', message: '⚓ ZATOPIONY!', color: '#00ff99', points: 100 };
    }
    if (result.result === 'hit') {
      return { type: 'hit', message: '🎯 TRAFIENIE!', color: '#00ff99', points: 10 };
    }
    if (result.result === 'miss') {
      return { type: 'miss', message: '💧 PUDŁO!', color: '#4488ff', points: 0 };
    }
    return { type: 'unknown', message: '?', color: '#fff' };
  },

  /**
   * Sprawdza czy gracze wygrali/przegrali
   */
  checkGameEnd(myBoard, enemyBoard, boardSize) {
    const myShips = this.countSunkShips(myBoard, boardSize);
    const enemyShips = this.countSunkShips(enemyBoard, boardSize);
    
    const totalShips = RULES.getTotalShipCount(boardSize);
    
    return {
      myShipsLeft: totalShips - myShips,
      enemyShipsLeft: totalShips - enemyShips,
      gameOver: myShips === totalShips || enemyShips === totalShips,
      winner: myShips === totalShips ? 'enemy' : (enemyShips === totalShips ? 'me' : null)
    };
  },

  /**
   * Liczy zatopione statki
   */
  countSunkShips(board, boardSize) {
    const shipIds = new Set();
    let sunkCount = 0;

    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const cell = BOARD.getCell(board, boardSize, r, c);
        if (cell.state === 'ship' && cell.shipId && !shipIds.has(cell.shipId)) {
          shipIds.add(cell.shipId);
          if (BOARD.isShipSunk(board, boardSize, cell.shipId)) {
            sunkCount++;
          }
        }
      }
    }
    return sunkCount;
  },

  /**
   * Liczy trafienia gracza
   */
  countHits(board, boardSize) {
    let hits = 0;
    for (let i = 0; i < board.length; i++) {
      if (board[i].hit && board[i].state === 'ship') hits++;
    }
    return hits;
  },

  /**
   * Liczy pudła
   */
  countMisses(board, boardSize) {
    let misses = 0;
    for (let i = 0; i < board.length; i++) {
      if (board[i].hit && board[i].state === 'water') misses++;
    }
    return misses;
  }
};