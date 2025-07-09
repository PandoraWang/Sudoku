const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Load utils.js
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
eval(utilsCode);

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

    test('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      
      expect(original).toEqual(originalCopy);
    });

    test('should handle empty array', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    test('should handle single element array', () => {
      const shuffled = shuffleArray([42]);
      expect(shuffled).toEqual([42]);
    });
  });

  describe('deepCopy', () => {
    test('should copy primitive values', () => {
      expect(deepCopy(42)).toBe(42);
      expect(deepCopy('hello')).toBe('hello');
      expect(deepCopy(true)).toBe(true);
      expect(deepCopy(null)).toBe(null);
    });

    test('should copy arrays', () => {
      const original = [1, 2, [3, 4]];
      const copied = deepCopy(original);
      
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied[2]).not.toBe(original[2]);
    });

    test('should copy objects', () => {
      const original = {
        a: 1,
        b: { c: 2 },
        d: [3, 4]
      };
      const copied = deepCopy(original);
      
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.b).not.toBe(original.b);
      expect(copied.d).not.toBe(original.d);
    });

    test('should copy Date objects', () => {
      const original = new Date('2023-01-01');
      const copied = deepCopy(original);
      
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.getTime()).toBe(original.getTime());
    });
  });

  describe('formatTime', () => {
    test('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(59)).toBe('00:59');
    });

    test('should format minutes correctly', () => {
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('61:01');
    });

    test('should pad single digits with zeros', () => {
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(65)).toBe('01:05');
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

  describe('getRowCol', () => {
    test('should return correct row and column for index', () => {
      expect(getRowCol(0)).toEqual({ row: 0, col: 0 });
      expect(getRowCol(8)).toEqual({ row: 0, col: 8 });
      expect(getRowCol(9)).toEqual({ row: 1, col: 0 });
      expect(getRowCol(80)).toEqual({ row: 8, col: 8 });
    });
  });

  describe('isValidSudokuInput', () => {
    test('should return true for valid numbers', () => {
      for (let i = 1; i <= 9; i++) {
        expect(isValidSudokuInput(i.toString())).toBe(true);
      }
    });

    test('should return false for invalid inputs', () => {
      expect(isValidSudokuInput('0')).toBe(false);
      expect(isValidSudokuInput('10')).toBe(false);
      expect(isValidSudokuInput('a')).toBe(false);
      expect(isValidSudokuInput('')).toBe(false);
      expect(isValidSudokuInput('-1')).toBe(false);
    });
  });

  describe('getBoxIndex', () => {
    test('should return correct box index for positions', () => {
      expect(getBoxIndex(0, 0)).toBe(0);
      expect(getBoxIndex(0, 3)).toBe(1);
      expect(getBoxIndex(0, 6)).toBe(2);
      expect(getBoxIndex(3, 0)).toBe(3);
      expect(getBoxIndex(3, 3)).toBe(4);
      expect(getBoxIndex(3, 6)).toBe(5);
      expect(getBoxIndex(6, 0)).toBe(6);
      expect(getBoxIndex(6, 3)).toBe(7);
      expect(getBoxIndex(6, 6)).toBe(8);
    });
  });

  describe('getCellsInBox', () => {
    test('should return all cells in top-left box', () => {
      const cells = getCellsInBox(0, 0);
      expect(cells).toHaveLength(9);
      
      const expected = [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
        { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
        { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }
      ];
      
      expect(cells).toEqual(expected);
    });

    test('should return all cells in bottom-right box', () => {
      const cells = getCellsInBox(2, 2);
      expect(cells).toHaveLength(9);
      
      const expected = [
        { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 },
        { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 },
        { row: 8, col: 6 }, { row: 8, col: 7 }, { row: 8, col: 8 }
      ];
      
      expect(cells).toEqual(expected);
    });
  });

  describe('getCellsInRow', () => {
    test('should return all cells in a row', () => {
      const cells = getCellsInRow(0);
      expect(cells).toHaveLength(9);
      
      for (let col = 0; col < 9; col++) {
        expect(cells[col]).toEqual({ row: 0, col });
      }
    });
  });

  describe('getCellsInColumn', () => {
    test('should return all cells in a column', () => {
      const cells = getCellsInColumn(0);
      expect(cells).toHaveLength(9);
      
      for (let row = 0; row < 9; row++) {
        expect(cells[row]).toEqual({ row, col: 0 });
      }
    });
  });

  describe('getRelatedCells', () => {
    test('should return cells in same row, column, and box', () => {
      const relatedCells = getRelatedCells(1, 1);
      
      // Should have 20 related cells (8 in row + 8 in column + 4 remaining in box)
      expect(relatedCells).toHaveLength(20);
      
      // Should not include the cell itself
      expect(relatedCells).not.toContainEqual({ row: 1, col: 1 });
      
      // Should include cells from the same row
      expect(relatedCells).toContainEqual({ row: 1, col: 0 });
      expect(relatedCells).toContainEqual({ row: 1, col: 8 });
      
      // Should include cells from the same column
      expect(relatedCells).toContainEqual({ row: 0, col: 1 });
      expect(relatedCells).toContainEqual({ row: 8, col: 1 });
      
      // Should include cells from the same box
      expect(relatedCells).toContainEqual({ row: 0, col: 0 });
      expect(relatedCells).toContainEqual({ row: 2, col: 2 });
    });
  });

  describe('isMobileDevice', () => {
    test('should detect mobile user agents', () => {
      const originalUserAgent = navigator.userAgent;
      
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });
      
      expect(isMobileDevice()).toBe(true);
      
      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });

  describe('supportsLocalStorage', () => {
    test('should return true when localStorage is available', () => {
      expect(supportsLocalStorage()).toBe(true);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    test('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    test('should limit function execution frequency', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 1000);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(1000);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });
});