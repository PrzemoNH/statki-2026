/**
 * BOARD.JS — Logika manipulacji planszą + RENDERING
 * Zarządza stanem pola: woda, statek, trafienie
 * Renderowanie współrzędnych PRZYCZEPIONYCH do mapy (scrollują razem)
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
   * Generuje HTML mapy + współrzędne razem.
   * Współrzędne X są WEWNĄTRZ scrollowalnego kontenera razem z mapą — scrollują razem.
   * Na końcu dodany spacer, żeby ostatnia kolumna (np. J) miała odstęp od krawędzi
   * ekranu zamiast stykać się z nią przy pełnym doscrollowaniu.
   * Zamiast serializować funkcję do onclick, używamy data-atrybutów;
   * kliknięcia podpina wywołujący kod (player.js) przez addEventListener.
   */
  renderBoardHTML(board, boardSize, isMyBoard = false, targetPlayerId = null, onClickCell = null) {
    // Współrzędne Y (boczne — lewa kolumna). Pierwszy element to pusty spacer
    // wyrównujący z rzędem liter na górze.
    let coordsYHtml = '<div class="coordinatesY">';
    coordsYHtml += '<div class="coordinateY"> </div>';
    for (let i = 0; i < boardSize; i++) {
      coordsYHtml += `<div class="coordinateY">${i + 1}</div>`;
    }
    coordsYHtml += '</div>';

    // Współrzędne X (górne — nad mapą)
    let coordsXHtml = '<div class="coordinatesX">';
    for (let i = 0; i < boardSize; i++) {
      coordsXHtml += `<div class="coordinateX">${this.COORD_LETTERS[i]}</div>`;
    }
    coordsXHtml += '</div>';

    // Kratki
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
        else if (!cell.hit && onClickCell) classStr += ' clickable';
      }

      const dataAttrs = (!isMyBoard && !cell.hit && onClickCell)
        ? `data-row="${row}" data-col="${col}" data-target="${targetPlayerId}"`
        : '';

      cellsHtml += `<div class="${classStr}" ${dataAttrs}></div>`;
    }

    // Struktura: coordsY po lewej; po prawej: coordsX nad mapą + mapa,
    // oba wewnątrz .boardColumn, całość wewnątrz jednego scrollowalnego .boardWithCoordinates.
    // .rightSpacer to pusty pasek na końcu, żeby ostatnia kolumna miała oddech od krawędzi.
    const html = `
      <div class="boardWrapper">
        <div class="boardWithCoordinates">
          ${coordsYHtml}
          <div class="boardColumn">
            ${coordsXHtml}
            <div class="miniBoard" style="display:inline-grid; gap:1px; grid-template-columns:repeat(${boardSize}, 16px);">
              ${cellsHtml}
            </div>
          </div>
          <div class="rightSpacer"></div>
        </div>
      </div>
    `;

    return html;
  }
};
