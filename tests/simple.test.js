// Simple tests to verify the testing infrastructure works
const { validCompleteSudoku, partialSudoku } = require('./fixtures.js');

describe('Testing Infrastructure', () => {
  test('should have valid test fixtures', () => {
    expect(validCompleteSudoku).toBeDefined();
    expect(validCompleteSudoku.length).toBe(9);
    expect(validCompleteSudoku[0].length).toBe(9);
    
    expect(partialSudoku).toBeDefined();
    expect(partialSudoku.length).toBe(9);
    expect(partialSudoku[0].length).toBe(9);
  });

  test('should have valid complete sudoku', () => {
    // Check that each row has numbers 1-9
    for (let row = 0; row < 9; row++) {
      const rowSet = new Set(validCompleteSudoku[row]);
      expect(rowSet.size).toBe(9);
      for (let num = 1; num <= 9; num++) {
        expect(rowSet.has(num)).toBe(true);
      }
    }
  });

  test('should have partial sudoku with empty cells', () => {
    let emptyCells = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (partialSudoku[row][col] === 0) {
          emptyCells++;
        }
      }
    }
    expect(emptyCells).toBeGreaterThan(0);
  });
});

describe('Basic JavaScript Features', () => {
  test('should support basic array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    expect(shuffled.length).toBe(arr.length);
  });

  test('should support basic math operations', () => {
    expect(Math.floor(4.7)).toBe(4);
    expect(Math.max(1, 2, 3)).toBe(3);
    expect(Math.min(1, 2, 3)).toBe(1);
  });
});

describe('Mock Functions', () => {
  test('should support jest mocks', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});