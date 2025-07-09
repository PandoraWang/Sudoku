const { JSDOM } = require('jsdom');
const { validCompleteSudoku, partialSudoku, emptyGrid } = require('./fixtures.js');

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Simple localStorage mock
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = mockLocalStorage;

// Load the JavaScript files
const fs = require('fs');
const path = require('path');

// Load utils.js
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
eval(utilsCode);

// Load sudoku.js
const sudokuCode = fs.readFileSync(path.join(__dirname, '../js/sudoku.js'), 'utf8');
eval(sudokuCode);

// Check if SudokuGame is defined
if (typeof SudokuGame === 'undefined') {
  console.error('SudokuGame class not found after eval');
}

describe('Basic Sudoku Tests', () => {
  let game;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    game = new SudokuGame();
  });

  describe('SudokuGame Constructor', () => {
    test('should initialize with correct default values', () => {
      expect(game.grid).toEqual(emptyGrid);
      expect(game.mistakes).toBe(0);
      expect(game.isComplete).toBe(false);
      expect(game.difficulty).toBe('medium');
    });
  });

  describe('isValidMove', () => {
    beforeEach(() => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
    });

    test('should return true for valid move', () => {
      // Cell [0,2] is empty, placing 4 should be valid
      expect(game.isValidMove(0, 2, 4)).toBe(true);
    });

    test('should return false for row conflict', () => {
      // First row already has 5, so placing 5 should be invalid
      expect(game.isValidMove(0, 2, 5)).toBe(false);
    });

    test('should return false for column conflict', () => {
      // First column already has 5, so placing 5 should be invalid
      expect(game.isValidMove(2, 0, 5)).toBe(false);
    });
  });

  describe('isValidSolution', () => {
    test('should return true for valid complete solution', () => {
      game.grid = JSON.parse(JSON.stringify(validCompleteSudoku));
      expect(game.isValidSolution()).toBe(true);
    });

    test('should return false for incomplete solution', () => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      expect(game.isValidSolution()).toBe(false);
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
      expect(game.mistakes).toBe(1);
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
  });
});

describe('Utility Functions', () => {
  describe('shuffleArray', () => {
    test('should return array with same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled.length).toBe(original.length);
    });

    test('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      original.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });
  });

  describe('formatTime', () => {
    test('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
    });
  });

  describe('getCellIndex', () => {
    test('should calculate correct index for grid position', () => {
      expect(getCellIndex(0, 0)).toBe(0);
      expect(getCellIndex(0, 8)).toBe(8);
      expect(getCellIndex(1, 0)).toBe(9);
      expect(getCellIndex(8, 8)).toBe(80);
    });
  });
});