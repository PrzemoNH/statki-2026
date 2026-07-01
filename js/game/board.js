/**
 * BOARD.JS — Logika manipulacji planszą + RENDERING
 * Zarządza stanem pola: woda, statek, trafienie
 * NOWE: Renderowanie współrzędnych PRZYCZEPIONYCH do mapy
 */

const BOARD = {
  COORD_LETTERS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],

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
  },

  /**
   * ✨ NOWE: Generuje HTML współrzędnych przyczepionych do mapy
   * Zwraca obiekt { coordsYHtml, coordsXHtml }
   */
  renderCoordinatesHTML(boardSize) {
    let coordsYHtml = '<div class="coordinatesY">';
    let coordsXHtml = '<div class="coordinatesX">';
    
    for (let i = 0; i < boardSize; i++) {
      coordsYHtml += `<div class="coordinateY">${i + 1}</div>`;
      coordsXHtml += `<div class="coordinateX">${this.COORD_LETTERS[i]}</div>`;
    }
    
    coordsYHtml += '</div>';
    coordsXHtml += '</div>';
    
    return { coordsYHtml, coordsXHtml };
  },

  /**
   * ✨ NOWE: Generuje HTML mapy + współrzędne razem
   * Współrzędne są PRZYCZEPIĘTЕ do mapy i rosną razem!
   */
  renderBoardHTML(board, boardSize, isMyBoard = false, targetPlayerId = null, onClickCell = null) {
    const { coordsYHtml, coordsXHtml } = this.renderCoordinatesHTML(boardSize);
    
    let cellsHtml = '';
    for (let i = 0; i < board.length; i++) {
      const cell = board[i];
      const row = Math.floor(i / boardSize);
      const col = i % boardSize;
      
      let classStr = 'cell';
      
      if (isMyBoard) {
        if (cell.state === 'ship') classStr += ' ship';
        if (cell.hit && cell.state === 'ship') classStr += ' hit';
        if (cell.hit && cell.state === 'water') classStr += ' miss';
      } else {
        if (cell.hit && cell.state === 'ship') classStr += ' hit';
        else if (cell.hit && cell.state === 'water') classStr += ' miss';
        else if (!cell.hit && onClickCell) {
          classStr += ' clickable';
        }
      }
      
      const clickAttr = (!isMyBoard && !cell.hit && onClickCell) 
        ? `onclick="(${onClickCell.toString()})(${row}, ${col})"` 
        : '';
      
      cellsHtml += `<div class="${classStr}" ${clickAttr}></div>`;
    }
    
    // Struktura: współrzędne górne → współrzędne boczne + mapa
    const html = `
      <div class="boardWrapper">
        ${coordsXHtml}
        <div class="boardWithCoordinates">
          ${coordsYHtml}
          <div class="miniBoard" style="display: inline-grid; gap: 1px; grid-template-columns: repeat(${boardSize}, 16px);">
            ${cellsHtml}
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
};
