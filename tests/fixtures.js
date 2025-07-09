// Test fixtures for Sudoku game testing

// Valid complete Sudoku solution
const validCompleteSudoku = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

// Invalid complete Sudoku (duplicate 5 in first row)
const invalidCompleteSudoku = [
  [5, 3, 4, 6, 7, 8, 9, 1, 5],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

// Partial Sudoku puzzle (0 represents empty cells)
const partialSudoku = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

// Empty 9x9 grid
const emptyGrid = Array(9).fill(null).map(() => Array(9).fill(0));

// Test cases for individual validation scenarios
const testCases = {
  // Valid moves
  validMoves: [
    { grid: partialSudoku, row: 0, col: 2, num: 4 },
    { grid: partialSudoku, row: 1, col: 1, num: 7 },
    { grid: partialSudoku, row: 2, col: 0, num: 1 }
  ],
  
  // Invalid moves (conflicts)
  invalidMoves: [
    { grid: partialSudoku, row: 0, col: 2, num: 5 }, // row conflict
    { grid: partialSudoku, row: 1, col: 1, num: 3 }, // column conflict
    { grid: partialSudoku, row: 0, col: 2, num: 9 }  // box conflict
  ],
  
  // Edge cases
  edgeCases: [
    { grid: partialSudoku, row: 0, col: 0, num: 1 }, // trying to place in filled cell
    { grid: emptyGrid, row: 0, col: 0, num: 1 },     // first move on empty grid
    { grid: validCompleteSudoku, row: 0, col: 0, num: 1 } // move on complete grid
  ]
};

// Sample game states for testing
const gameStates = {
  newGame: {
    grid: emptyGrid,
    solution: validCompleteSudoku,
    initialGrid: emptyGrid,
    mistakes: 0,
    isComplete: false,
    difficulty: 'medium'
  },
  
  nearComplete: {
    grid: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 0]  // Last cell empty
    ],
    solution: validCompleteSudoku,
    mistakes: 2,
    isComplete: false,
    difficulty: 'hard'
  }
};

module.exports = {
  validCompleteSudoku,
  invalidCompleteSudoku,
  partialSudoku,
  emptyGrid,
  testCases,
  gameStates
};