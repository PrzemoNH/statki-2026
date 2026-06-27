const BOARD = {

  create(size) {
    const grid = [];
    for (let row = 0; row < size; row++) {
      grid[row] = [];
      for (let col = 0; col < size; col++) {
        grid[row][col] = {
          row,
          col,
          state: 'empty',   // empty | ship | hit | miss | sunk
          shipId: null
        };
      }
    }
    return grid;
  },

  getSize(playerCount) {
    const sizes = { 2: 10, 3: 13, 4: 15 };
    return sizes[playerCount] || 10;
  },

  isValidCell(grid, row, col) {
    const size = grid.length;
    return row >= 0 && row < size && col >= 0 && col < size;
  },

  getCell(grid, row, col) {
    if (!this.isValidCell(grid, row, col)) return null;
    return grid[row][col];
  },

  setState(grid, row, col, state) {
    if (!this.isValidCell(grid, row, col)) return false;
    grid[row][col].state = state;
    return true;
  }

};
