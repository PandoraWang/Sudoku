const { JSDOM } = require('jsdom');
const { validCompleteSudoku, partialSudoku, emptyGrid, testCases } = require('./fixtures.js');

// Set up DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <div id="timer">00:00</div>
  <div id="mistakes">0</div>
  <div id="status-message"></div>
  <div id="difficulty">
    <option value="easy">Easy</option>
    <option value="medium">Medium</option>
    <option value="hard">Hard</option>
  </div>
  <div id="sudoku-grid"></div>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = mockLocalStorage;

// Mock timers
global.setInterval = jest.fn();
global.clearInterval = jest.fn();
global.setTimeout = jest.fn();
global.clearTimeout = jest.fn();

// Load and execute JavaScript files in order
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load utils.js first
const utilsPath = path.join(__dirname, '../js/utils.js');
const utilsCode = fs.readFileSync(utilsPath, 'utf8');

// Execute utils.js in global context
eval(utilsCode);

// Make sure utility functions are available globally
global.shuffleArray = shuffleArray;
global.deepCopy = deepCopy;
global.formatTime = formatTime;
global.showMessage = showMessage;
global.debounce = debounce;
global.throttle = throttle;
global.getCellIndex = getCellIndex;
global.getRowCol = getRowCol;
global.isValidSudokuInput = isValidSudokuInput;
global.getBoxIndex = getBoxIndex;
global.getCellsInBox = getCellsInBox;
global.getCellsInRow = getCellsInRow;
global.getCellsInColumn = getCellsInColumn;
global.getRelatedCells = getRelatedCells;
global.animateElement = animateElement;
global.isMobileDevice = isMobileDevice;
global.supportsLocalStorage = supportsLocalStorage;
global.copyToClipboard = copyToClipboard;
global.generateRandomSeed = generateRandomSeed;
global.createSeededRandom = createSeededRandom;

// Now execute sudoku.js
const sudokuPath = path.join(__dirname, '../js/sudoku.js');
const sudokuCode = fs.readFileSync(sudokuPath, 'utf8');

// Make sure localStorage mock is available globally
global.localStorage = mockLocalStorage;

// Execute sudoku.js in global context - try different approach
try {
  // Use Function constructor but with localStorage in context
  const executeInGlobal = new Function('localStorage', `
    ${sudokuCode}
    return SudokuGame;
  `);
  
  global.SudokuGame = executeInGlobal(mockLocalStorage);
  console.log('SudokuGame loaded via Function constructor:', typeof global.SudokuGame);
} catch (error) {
  console.error('Error with Function constructor:', error);
  
  // Fallback to eval
  try {
    eval(sudokuCode);
    global.SudokuGame = SudokuGame;
    console.log('SudokuGame loaded via eval:', typeof global.SudokuGame);
  } catch (evalError) {
    console.error('Error with eval:', evalError);
  }
}

describe('SudokuGame Class Tests', () => {
  let game;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
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
      expect(game.selectedCell).toBeNull();
      expect(game.startTime).toBeNull();
      expect(game.timerInterval).toBeNull();
    });
  });

  describe('isValidMove', () => {
    beforeEach(() => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
    });

    test('should return true for valid moves', () => {
      expect(game.isValidMove(0, 2, 4)).toBe(true);
    });

    test('should return false for row conflicts', () => {
      expect(game.isValidMove(0, 2, 5)).toBe(false);
    });

    test('should return false for column conflicts', () => {
      expect(game.isValidMove(2, 0, 5)).toBe(false);
    });

    test('should return false for box conflicts', () => {
      expect(game.isValidMove(0, 2, 9)).toBe(false);
    });
  });

  describe('isValidPlacement', () => {
    test('should validate placement correctly', () => {
      const grid = JSON.parse(JSON.stringify(partialSudoku));
      expect(game.isValidPlacement(grid, 0, 2, 4)).toBe(true);
      expect(game.isValidPlacement(grid, 0, 2, 5)).toBe(false);
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
      const result = game.makeMove(0, 2, 5);
      expect(result).toBe(false);
      expect(game.mistakes).toBe(1);
    });

    test('should reject move on pre-filled cell', () => {
      const result = game.makeMove(0, 0, 1);
      expect(result).toBe(false);
      expect(game.grid[0][0]).toBe(5);
    });

    test('should allow clearing a cell', () => {
      game.grid[0][2] = 4;
      const result = game.makeMove(0, 2, 0);
      expect(result).toBe(true);
      expect(game.grid[0][2]).toBe(0);
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

  describe('isValidGroup', () => {
    test('should return true for valid group', () => {
      const validGroup = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(game.isValidGroup(validGroup)).toBe(true);
    });

    test('should return false for invalid group', () => {
      const invalidGroup = [1, 2, 3, 4, 5, 6, 7, 8, 1];
      expect(game.isValidGroup(invalidGroup)).toBe(false);
    });

    test('should return false for incomplete group', () => {
      const incompleteGroup = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      expect(game.isValidGroup(incompleteGroup)).toBe(false);
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

  describe('generateCompleteSudoku', () => {
    test('should generate a valid complete sudoku', () => {
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
      
      // Easy should have around 35 empty cells
      expect(emptyCells).toBeGreaterThan(30);
      expect(emptyCells).toBeLessThan(45);
    });

    test('should generate medium difficulty puzzle', () => {
      game.generatePuzzle('medium');
      expect(game.difficulty).toBe('medium');
      
      let emptyCells = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (game.grid[row][col] === 0) emptyCells++;
        }
      }
      
      expect(emptyCells).toBeGreaterThan(40);
      expect(emptyCells).toBeLessThan(50);
    });

    test('should generate hard difficulty puzzle', () => {
      game.generatePuzzle('hard');
      expect(game.difficulty).toBe('hard');
      
      let emptyCells = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (game.grid[row][col] === 0) emptyCells++;
        }
      }
      
      expect(emptyCells).toBeGreaterThan(50);
      expect(emptyCells).toBeLessThan(60);
    });
  });

  describe('getHint', () => {
    beforeEach(() => {
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      game.solution = JSON.parse(JSON.stringify(validCompleteSudoku));
      game.isComplete = false;
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
      game.grid = JSON.parse(JSON.stringify(partialSudoku));
      game.initialGrid = JSON.parse(JSON.stringify(partialSudoku));
      game.mistakes = 5;
      game.isComplete = true;
      
      game.grid[0][2] = 4;
      
      game.resetGame();
      
      expect(game.grid).toEqual(game.initialGrid);
      expect(game.mistakes).toBe(0);
      expect(game.isComplete).toBe(false);
      expect(game.selectedCell).toBeNull();
    });
  });

  describe('Timer methods', () => {
    test('should start timer', () => {
      game.startTimer();
      expect(game.startTime).toBeDefined();
      expect(global.setInterval).toHaveBeenCalled();
    });

    test('should stop timer', () => {
      game.timerInterval = 'mock-interval';
      game.stopTimer();
      expect(global.clearInterval).toHaveBeenCalledWith('mock-interval');
      expect(game.timerInterval).toBeNull();
    });

    test('should get elapsed time', () => {
      const mockTime = Date.now();
      game.startTime = mockTime - 5000; // 5 seconds ago
      
      const elapsed = game.getElapsedTime();
      expect(elapsed).toBeGreaterThan(4);
      expect(elapsed).toBeLessThan(6);
    });
  });

  describe('LocalStorage methods', () => {
    test('should save game state', () => {
      game.grid = partialSudoku;
      game.saveGame();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sudoku-game',
        expect.stringContaining('"grid"')
      );
    });

    test('should load game state', () => {
      const gameState = {
        grid: partialSudoku,
        solution: validCompleteSudoku,
        initialGrid: partialSudoku,
        mistakes: 2,
        difficulty: 'hard',
        isComplete: false,
        startTime: Date.now()
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(gameState));
      
      const result = game.loadGame();
      expect(result).toBe(true);
      expect(game.grid).toEqual(partialSudoku);
      expect(game.mistakes).toBe(2);
      expect(game.difficulty).toBe('hard');
    });

    test('should return false when no saved game', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = game.loadGame();
      expect(result).toBe(false);
    });

    test('should clear saved game', () => {
      game.clearSave();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sudoku-game');
    });
  });
});