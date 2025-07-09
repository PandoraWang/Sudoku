const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <div id="status-message"></div>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;

// Override the navigator with our mock
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  clipboard: {
    writeText: jest.fn()
  }
};

global.navigator = mockNavigator;
global.window.navigator = mockNavigator;
dom.window.navigator = mockNavigator;

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock timers
global.setInterval = jest.fn();
global.clearInterval = jest.fn();
global.setTimeout = jest.fn();
global.clearTimeout = jest.fn();

// Mock document.execCommand
global.document.execCommand = jest.fn().mockReturnValue(true);

// Load utils.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const utilsPath = path.join(__dirname, '../js/utils.js');
const utilsCode = fs.readFileSync(utilsPath, 'utf8');

// Replace navigator references in utils.js with our mock, but only for clipboard
const modifiedUtilsCode = utilsCode.replace(/navigator\.clipboard/g, 'mockNavigator.clipboard');

// Execute utils.js directly with eval to ensure document access
eval(modifiedUtilsCode);

// Make utility functions available globally
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

describe('Utility Functions Tests', () => {

  describe('shuffleArray', () => {
    test('should return array with same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = global.shuffleArray(original);
      expect(shuffled.length).toBe(original.length);
    });

    test('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = global.shuffleArray(original);
      
      original.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    test('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      global.shuffleArray(original);
      
      expect(original).toEqual(originalCopy);
    });

    test('should handle empty array', () => {
      const shuffled = global.shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    test('should handle single element array', () => {
      const shuffled = global.shuffleArray([42]);
      expect(shuffled).toEqual([42]);
    });
  });

  describe('deepCopy', () => {
    test('should copy primitive values', () => {
      expect(global.deepCopy(42)).toBe(42);
      expect(global.deepCopy('hello')).toBe('hello');
      expect(global.deepCopy(true)).toBe(true);
      expect(global.deepCopy(null)).toBe(null);
    });

    test('should copy arrays', () => {
      const original = [1, 2, [3, 4]];
      const copied = global.deepCopy(original);
      
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
      const copied = global.deepCopy(original);
      
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.b).not.toBe(original.b);
      expect(copied.d).not.toBe(original.d);
    });

    test('should copy Date objects', () => {
      const original = new Date('2023-01-01');
      const copied = global.deepCopy(original);
      
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.getTime()).toBe(original.getTime());
    });
  });

  describe('formatTime', () => {
    test('should format seconds correctly', () => {
      expect(global.formatTime(0)).toBe('00:00');
      expect(global.formatTime(30)).toBe('00:30');
      expect(global.formatTime(59)).toBe('00:59');
    });

    test('should format minutes correctly', () => {
      expect(global.formatTime(60)).toBe('01:00');
      expect(global.formatTime(90)).toBe('01:30');
      expect(global.formatTime(3661)).toBe('61:01');
    });

    test('should pad single digits with zeros', () => {
      expect(global.formatTime(5)).toBe('00:05');
      expect(global.formatTime(65)).toBe('01:05');
    });
  });

  describe('showMessage', () => {
    test('should update status message element', () => {
      // Create the status message element manually
      const statusElement = document.createElement('div');
      statusElement.id = 'status-message';
      document.body.appendChild(statusElement);
      
      // Debug the DOM setup
      console.log('Element found after creation:', !!document.getElementById('status-message'));
      
      global.showMessage('Test message', 'info');
      
      const element = document.getElementById('status-message');
      expect(element.textContent).toBe('Test message');
      expect(element.className).toBe('info');
    });

    test('should clear message after duration', () => {
      jest.useFakeTimers();
      
      // Create the status message element manually
      const statusElement = document.createElement('div');
      statusElement.id = 'status-message';
      document.body.appendChild(statusElement);
      
      global.showMessage('Test message', 'info', 100);
      
      const element = document.getElementById('status-message');
      expect(element.textContent).toBe('Test message');
      expect(element.className).toBe('info');
      
      jest.advanceTimersByTime(100);
      
      expect(element.textContent).toBe('');
      expect(element.className).toBe('');
      
      jest.useRealTimers();
    });
  });

  describe('getCellIndex', () => {
    test('should calculate correct index for grid position', () => {
      expect(global.getCellIndex(0, 0)).toBe(0);
      expect(global.getCellIndex(0, 8)).toBe(8);
      expect(global.getCellIndex(1, 0)).toBe(9);
      expect(global.getCellIndex(8, 8)).toBe(80);
    });
  });

  describe('getRowCol', () => {
    test('should return correct row and column for index', () => {
      expect(global.getRowCol(0)).toEqual({ row: 0, col: 0 });
      expect(global.getRowCol(8)).toEqual({ row: 0, col: 8 });
      expect(global.getRowCol(9)).toEqual({ row: 1, col: 0 });
      expect(global.getRowCol(80)).toEqual({ row: 8, col: 8 });
    });
  });

  describe('isValidSudokuInput', () => {
    test('should return true for valid numbers', () => {
      for (let i = 1; i <= 9; i++) {
        expect(global.isValidSudokuInput(i.toString())).toBe(true);
      }
    });

    test('should return false for invalid inputs', () => {
      expect(global.isValidSudokuInput('0')).toBe(false);
      expect(global.isValidSudokuInput('10')).toBe(false);
      expect(global.isValidSudokuInput('a')).toBe(false);
      expect(global.isValidSudokuInput('')).toBe(false);
      expect(global.isValidSudokuInput('-1')).toBe(false);
    });
  });

  describe('getBoxIndex', () => {
    test('should return correct box index for positions', () => {
      expect(global.getBoxIndex(0, 0)).toBe(0);
      expect(global.getBoxIndex(0, 3)).toBe(1);
      expect(global.getBoxIndex(0, 6)).toBe(2);
      expect(global.getBoxIndex(3, 0)).toBe(3);
      expect(global.getBoxIndex(3, 3)).toBe(4);
      expect(global.getBoxIndex(3, 6)).toBe(5);
      expect(global.getBoxIndex(6, 0)).toBe(6);
      expect(global.getBoxIndex(6, 3)).toBe(7);
      expect(global.getBoxIndex(6, 6)).toBe(8);
    });
  });

  describe('getCellsInBox', () => {
    test('should return all cells in top-left box', () => {
      const cells = global.getCellsInBox(0, 0);
      expect(cells).toHaveLength(9);
      
      const expected = [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
        { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
        { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }
      ];
      
      expect(cells).toEqual(expected);
    });

    test('should return all cells in bottom-right box', () => {
      const cells = global.getCellsInBox(2, 2);
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
      const cells = global.getCellsInRow(0);
      expect(cells).toHaveLength(9);
      
      for (let col = 0; col < 9; col++) {
        expect(cells[col]).toEqual({ row: 0, col });
      }
    });
  });

  describe('getCellsInColumn', () => {
    test('should return all cells in a column', () => {
      const cells = global.getCellsInColumn(0);
      expect(cells).toHaveLength(9);
      
      for (let row = 0; row < 9; row++) {
        expect(cells[row]).toEqual({ row, col: 0 });
      }
    });
  });

  describe('getRelatedCells', () => {
    test('should return cells in same row, column, and box', () => {
      const relatedCells = global.getRelatedCells(1, 1);
      
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
      
      expect(global.isMobileDevice()).toBe(true);
      
      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });

    test('should return false for desktop user agents', () => {
      expect(global.isMobileDevice()).toBe(false);
    });
  });

  describe('supportsLocalStorage', () => {
    test('should return true when localStorage is available', () => {
      expect(global.supportsLocalStorage()).toBe(true);
    });
  });

  describe('generateRandomSeed', () => {
    test('should generate random seed within range', () => {
      const seed = global.generateRandomSeed();
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(1000000);
      expect(Number.isInteger(seed)).toBe(true);
    });
  });

  describe('createSeededRandom', () => {
    test('should create deterministic random function', () => {
      const random1 = global.createSeededRandom(12345);
      const random2 = global.createSeededRandom(12345);
      
      // Same seed should produce same sequence
      expect(random1()).toBe(random2());
      expect(random1()).toBe(random2());
    });

    test('should return values between 0 and 1', () => {
      const random = global.createSeededRandom(12345);
      
      for (let i = 0; i < 10; i++) {
        const value = random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('copyToClipboard', () => {
    test('should use navigator.clipboard when available', async () => {
      // Debug: check what copyToClipboard sees
      console.log('Before copyToClipboard call:');
      console.log('navigator:', navigator);
      console.log('navigator.clipboard:', navigator.clipboard);
      console.log('navigator.clipboard && navigator.clipboard.writeText:', navigator.clipboard && navigator.clipboard.writeText);
      
      await global.copyToClipboard('test text');
      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    test('should fallback to execCommand when clipboard API not available', async () => {
      const originalClipboard = mockNavigator.clipboard;
      delete mockNavigator.clipboard;
      
      // Mock document.createElement and execCommand
      const mockTextArea = {
        value: '',
        select: jest.fn(),
        style: {}
      };
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn(() => mockTextArea);
      document.execCommand = jest.fn();
      
      const originalAppendChild = document.body.appendChild;
      const originalRemoveChild = document.body.removeChild;
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      
      await global.copyToClipboard('test text');
      
      expect(mockTextArea.value).toBe('test text');
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      
      // Restore mocks
      mockNavigator.clipboard = originalClipboard;
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
    });

    test('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = global.debounce(mockFn, 1000);
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = global.debounce(mockFn, 1000);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
    });

    test('should limit function execution frequency', () => {
      const mockFn = jest.fn();
      const throttledFn = global.throttle(mockFn, 1000);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(1000);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});