const RULES = {

  // Sprawdza czy komórka sąsiaduje z innym statkiem
  hasNeighbor(grid, row, col, shipId, isSingleMast) {
    const directions = [
      [-1,-1],[-1,0],[-1,1],
      [ 0,-1],        [ 0,1],
      [ 1,-1],[ 1,0],[ 1,1]
    ];

    for (const [dr, dc] of directions) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) continue;
      const cell = grid[r][c];
      if (cell.shipId === null || cell.shipId === shipId) continue;

      // Jednomasztowiec może dotykać rogami wielomasztowców
      if (isSingleMast && Math.abs(dr) === 1 && Math.abs(dc) === 1) continue;

      return true;
    }
    return false;
  },

  // Sprawdza czy pozycja statku jest legalna
  canPlace(grid, cells, shipId, isSingleMast) {
    for (const [row, col] of cells) {
      if (row < 0 || row >= grid.length || col < 0 || col >= grid.length) return false;
      if (grid[row][col].shipId !== null) return false;
      if (this.hasNeighbor(grid, row, col, shipId, isSingleMast)) return false;
    }
    return true;
  },

  // Zwraca wszystkie komórki które zajmie statek
  getShipCells(row, col, size, horizontal) {
    const cells = [];
    for (let i = 0; i < size; i++) {
      cells.push(horizontal ? [row, col + i] : [row + i, col]);
    }
    return cells;
  }

};
