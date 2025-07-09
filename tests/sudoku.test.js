const { JSDOM } = require('jsdom');
const { 
  validCompleteSudoku, 
  invalidCompleteSudoku, 
  partialSudoku, 
  emptyGrid,
  testCases,
  gameStates
} = require('./fixtures.js');

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Import the SudokuGame class
// Note: We need to load the JS files in the correct order
const fs = require('fs');
const path = require('path');

// Load utils.js first
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
eval(utilsCode);

// Load sudoku.js
const sudokuCode = fs.readFileSync(path.join(__dirname, '../js/sudoku.js'), 'utf8');
eval(sudokuCode);

describe('SudokuGame', () => {
  let game;

  beforeEach(() => {
    game = new SudokuGame();
  });

  describe('Constructor', () => {
    test('should initialize with correct default values', () => {
      expect(game.grid).toEqual(emptyGrid);
      expect(game.solution).toEqual(emptyGrid);
      expect(game.initialGrid).toEqual(emptyGrid);
      expect(game.mistakes).toBe(0);
      expect(game.isComplete).toBe(false);
      expect(game.difficulty).toBe('medium');
    });
  });

  describe('isValidMove', () => {
    beforeEach(() => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
    });

    test('should return true for valid moves', () => {
      testCases.validMoves.forEach(({ row, col, num }) => {
        expect(game.isValidMove(row, col, num)).toBe(true);
      });
    });

    test('should return false for invalid moves', () => {
      testCases.invalidMoves.forEach(({ row, col, num }) => {
        expect(game.isValidMove(row, col, num)).toBe(false);
      });
    });

    test('should handle row conflicts', () => {
      // First row already has 5, so placing 5 in empty cell should be invalid
      expect(game.isValidMove(0, 2, 5)).toBe(false);
    });

    test('should handle column conflicts', () => {
      // First column already has 5, so placing 5 in empty cell should be invalid
      expect(game.isValidMove(2, 0, 5)).toBe(false);
    });

    test('should handle box conflicts', () => {
      // Top-left box already has 5, so placing 5 in empty cell should be invalid
      expect(game.isValidMove(0, 2, 5)).toBe(false);
    });
  });

  describe('isValidSolution', () => {
    test('should return true for valid complete solution', () => {
      game.grid = JSON.parse(JSON.stringify(validCompleteSudoku));
      expect(game.isValidSolution()).toBe(true);
    });

    test('should return false for invalid complete solution', () => {
      game.grid = JSON.parse(JSON.stringify(invalidCompleteSudoku));
      expect(game.isValidSolution()).toBe(false);
    });

    test('should return false for incomplete solution', () => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      expect(game.isValidSolution()).toBe(false);
    });
  });

  describe('isValidGroup', () => {
    test('should return true for valid group with all numbers 1-9', () => {
      const validGroup = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(game.isValidGroup(validGroup)).toBe(true);
    });

    test('should return false for group with duplicates', () => {
      const invalidGroup = [1, 2, 3, 4, 5, 6, 7, 8, 1];
      expect(game.isValidGroup(invalidGroup)).toBe(false);
    });

    test('should return false for incomplete group', () => {
      const incompleteGroup = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      expect(game.isValidGroup(incompleteGroup)).toBe(false);
    });
  });

  describe('makeMove', () => {
    beforeEach(() => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      game.initialGrid = JSON.parse(JSON.stringify(partialSudoku));
    });

    test('should place valid number and return true', () => {
      const result = game.makeMove(0, 2, 4);
      expect(result).toBe(true);
      expect(game.grid[0][2]).toBe(4);
      expect(game.mistakes).toBe(0);
    });

    test('should reject invalid move and increment mistakes', () => {
      const result = game.makeMove(0, 2, 5); // 5 already in row
      expect(result).toBe(false);
      expect(game.grid[0][2]).toBe(0); // Should remain unchanged
      expect(game.mistakes).toBe(1);
    });

    test('should reject move on pre-filled cell', () => {
      const result = game.makeMove(0, 0, 1); // Cell already has 5
      expect(result).toBe(false);
      expect(game.grid[0][0]).toBe(5); // Should remain unchanged
    });

    test('should allow clearing a cell (placing 0)', () => {
      game.grid[0][2] = 4; // Place a number first
      const result = game.makeMove(0, 2, 0);
      expect(result).toBe(true);
      expect(game.grid[0][2]).toBe(0);
    });
  });

  describe('checkWin', () => {
    test('should return false for incomplete grid', () => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      expect(game.checkWin()).toBe(false);
      expect(game.isComplete).toBe(false);
    });

    test('should return true for valid complete grid', () => {
      game.grid = JSON.parse(JSON.stringify(validCompleteSudoku));
      expect(game.checkWin()).toBe(true);
      expect(game.isComplete).toBe(true);
    });

    test('should return false for invalid complete grid', () => {
      game.grid = JSON.parse(JSON.stringify(invalidCompleteSudoku));
      expect(game.checkWin()).toBe(false);
      expect(game.isComplete).toBe(false);
    });
  });

  describe('generateCompleteSudoku', () => {
    test('should generate a valid complete Sudoku', () => {
      const generatedGrid = game.generateCompleteSudoku();
      
      // Check that all cells are filled
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(generatedGrid[row][col]).toBeGreaterThan(0);
          expect(generatedGrid[row][col]).toBeLessThan(10);
        }
      }
      
      // Check that it's a valid solution
      game.grid = generatedGrid;
      expect(game.isValidSolution()).toBe(true);
    });
  });

  describe('generatePuzzle', () => {
    test('should generate puzzle with correct difficulty', () => {
      game.generatePuzzle('easy');
      expect(game.difficulty).toBe('easy');
      
      // Count empty cells
      let emptyCells = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (game.grid[row][col] === 0) emptyCells++;
        }
      }
      
      // Easy should have around 35 empty cells (allowing some variance)
      expect(emptyCells).toBeGreaterThan(30);
      expect(emptyCells).toBeLessThan(40);
    });

    test('should generate solvable puzzle', () => {
      game.generatePuzzle('medium');
      
      // The puzzle should have a solution
      expect(game.solution).toBeDefined();
      
      // The solution should be valid
      const tempGrid = game.grid;
      game.grid = game.solution;
      expect(game.isValidSolution()).toBe(true);
      game.grid = tempGrid;
    });
  });

  describe('getHint', () => {
    beforeEach(() => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      game.solution = JSON.parse(JSON.stringify(validCompleteSudoku));
    });

    test('should return valid hint for incomplete puzzle', () => {
      const hint = game.getHint();
      
      expect(hint).toBeDefined();
      expect(hint.row).toBeGreaterThanOrEqual(0);
      expect(hint.row).toBeLessThan(9);
      expect(hint.col).toBeGreaterThanOrEqual(0);
      expect(hint.col).toBeLessThan(9);
      expect(hint.value).toBeGreaterThan(0);
      expect(hint.value).toBeLessThan(10);
      
      // The hint should be for an empty cell
      expect(game.grid[hint.row][hint.col]).toBe(0);
      
      // The hint value should match the solution
      expect(hint.value).toBe(game.solution[hint.row][hint.col]);
    });

    test('should return null for complete puzzle', () => {
      game.grid = JSON.parse(JSON.stringify(validCompleteSudoku));
      game.isComplete = true;
      
      const hint = game.getHint();
      expect(hint).toBeNull();
    });
  });

  describe('resetGame', () => {
    test('should reset game state to initial', () => {
      // Set up a game in progress
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      game.initialGrid = JSON.parse(JSON.stringify(partialSudoku));
      game.mistakes = 5;
      game.isComplete = true;
      
      // Make some moves
      game.grid[0][2] = 4;
      game.grid[1][1] = 7;
      
      // Reset the game
      game.resetGame();
      
      // Check that state is reset
      expect(game.grid).toEqual(game.initialGrid);
      expect(game.mistakes).toBe(0);
      expect(game.isComplete).toBe(false);
    });
  });
});