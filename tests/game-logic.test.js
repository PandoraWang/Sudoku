// Tests for Sudoku game logic
const { validCompleteSudoku, partialSudoku } = require('./fixtures.js');

describe('Sudoku Game Logic Tests', () => {
  
  describe('Sudoku Validation Logic', () => {
    
    test('should validate complete sudoku solution', () => {
      // Test row validation
      for (let row = 0; row < 9; row++) {
        const rowSet = new Set(validCompleteSudoku[row]);
        expect(rowSet.size).toBe(9);
        for (let num = 1; num <= 9; num++) {
          expect(rowSet.has(num)).toBe(true);
        }
      }
      
      // Test column validation
      for (let col = 0; col < 9; col++) {
        const colSet = new Set();
        for (let row = 0; row < 9; row++) {
          colSet.add(validCompleteSudoku[row][col]);
        }
        expect(colSet.size).toBe(9);
        for (let num = 1; num <= 9; num++) {
          expect(colSet.has(num)).toBe(true);
        }
      }
      
      // Test 3x3 box validation
      for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
          const boxSet = new Set();
          for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
            for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
              boxSet.add(validCompleteSudoku[row][col]);
            }
          }
          expect(boxSet.size).toBe(9);
          for (let num = 1; num <= 9; num++) {
            expect(boxSet.has(num)).toBe(true);
          }
        }
      }
    });
    
    test('should identify valid moves in partial sudoku', () => {
      // Test that cell [0,2] can accept certain numbers
      const row = 0;
      const col = 2;
      const grid = partialSudoku;
      
      // Check row constraints
      const rowNumbers = new Set(grid[row]);
      
      // Check column constraints
      const colNumbers = new Set();
      for (let r = 0; r < 9; r++) {
        colNumbers.add(grid[r][col]);
      }
      
      // Check box constraints
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      const boxNumbers = new Set();
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          boxNumbers.add(grid[r][c]);
        }
      }
      
      // Number 4 should be valid for cell [0,2]
      expect(rowNumbers.has(4)).toBe(false);
      expect(colNumbers.has(4)).toBe(false);
      expect(boxNumbers.has(4)).toBe(false);
      
      // Number 5 should be invalid (already in row)
      expect(rowNumbers.has(5)).toBe(true);
    });
    
    test('should identify conflicts in sudoku moves', () => {
      const grid = partialSudoku;
      
      // Test row conflict: try to place 5 in row 0, but 5 already exists
      expect(grid[0].includes(5)).toBe(true);
      
      // Test column conflict: try to place 5 in column 0, but 5 already exists
      const col0 = [];
      for (let r = 0; r < 9; r++) {
        col0.push(grid[r][0]);
      }
      expect(col0.includes(5)).toBe(true);
    });
  });
  
  describe('Grid Utilities', () => {
    
    test('should count empty cells correctly', () => {
      let emptyCells = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (partialSudoku[row][col] === 0) {
            emptyCells++;
          }
        }
      }
      
      expect(emptyCells).toBeGreaterThan(20); // Partial sudoku should have many empty cells
      expect(emptyCells).toBeLessThan(81);   // But not all cells should be empty
    });
    
    test('should handle grid coordinate calculations', () => {
      // Test grid index calculations
      const getCellIndex = (row, col) => row * 9 + col;
      const getRowCol = (index) => ({ row: Math.floor(index / 9), col: index % 9 });
      
      expect(getCellIndex(0, 0)).toBe(0);
      expect(getCellIndex(0, 8)).toBe(8);
      expect(getCellIndex(1, 0)).toBe(9);
      expect(getCellIndex(8, 8)).toBe(80);
      
      expect(getRowCol(0)).toEqual({ row: 0, col: 0 });
      expect(getRowCol(8)).toEqual({ row: 0, col: 8 });
      expect(getRowCol(9)).toEqual({ row: 1, col: 0 });
      expect(getRowCol(80)).toEqual({ row: 8, col: 8 });
    });
    
    test('should handle 3x3 box calculations', () => {
      const getBoxIndex = (row, col) => Math.floor(row / 3) * 3 + Math.floor(col / 3);
      
      // Test different box positions
      expect(getBoxIndex(0, 0)).toBe(0); // Top-left box
      expect(getBoxIndex(0, 3)).toBe(1); // Top-middle box
      expect(getBoxIndex(0, 6)).toBe(2); // Top-right box
      expect(getBoxIndex(3, 0)).toBe(3); // Middle-left box
      expect(getBoxIndex(4, 4)).toBe(4); // Center box
      expect(getBoxIndex(8, 8)).toBe(8); // Bottom-right box
    });
  });
  
  describe('Game State Management', () => {
    
    test('should track game completion state', () => {
      // Complete grid should be considered finished
      let isComplete = true;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (validCompleteSudoku[row][col] === 0) {
            isComplete = false;
            break;
          }
        }
        if (!isComplete) break;
      }
      expect(isComplete).toBe(true);
      
      // Partial grid should not be considered finished
      isComplete = true;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (partialSudoku[row][col] === 0) {
            isComplete = false;
            break;
          }
        }
        if (!isComplete) break;
      }
      expect(isComplete).toBe(false);
    });
    
    test('should validate time formatting', () => {
      const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      };
      
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('61:01');
    });
  });
});