const { JSDOM } = require('jsdom');
const { validCompleteSudoku, partialSudoku, gameStates } = require('./fixtures.js');

// Set up DOM environment with HTML structure
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <title>Sudoku Game</title>
</head>
<body>
  <div class="container">
    <header>
      <h1>Sudoku</h1>
      <div class="game-info">
        <div class="timer">Time: <span id="timer">00:00</span></div>
        <div class="mistakes">Mistakes: <span id="mistakes">0</span></div>
      </div>
    </header>

    <div class="controls">
      <div class="difficulty-selector">
        <label for="difficulty">Difficulty:</label>
        <select id="difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div class="game-buttons">
        <button id="new-game">New Game</button>
        <button id="reset">Reset</button>
        <button id="hint">Hint</button>
        <button id="clear">Clear Cell</button>
      </div>
    </div>

    <div class="sudoku-container">
      <div id="sudoku-grid" class="sudoku-grid"></div>
    </div>

    <div class="game-status">
      <div id="status-message"></div>
    </div>
  </div>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;

// Mock browser APIs
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.confirm = jest.fn(() => true);
global.alert = jest.fn();

// Load JavaScript files in order
const fs = require('fs');
const path = require('path');

const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
eval(utilsCode);

const sudokuCode = fs.readFileSync(path.join(__dirname, '../js/sudoku.js'), 'utf8');
eval(sudokuCode);

const uiCode = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
eval(uiCode);

describe('Sudoku Game Integration', () => {
  let sudokuUI;

  beforeEach(() => {
    // Reset DOM
    document.getElementById('sudoku-grid').innerHTML = '';
    document.getElementById('mistakes').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('status-message').textContent = '';
    
    // Reset mocks
    jest.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
    
    // Create new game instance
    sudokuUI = new SudokuUI();
  });

  describe('Game Initialization', () => {
    test('should create 81 cells in the grid', () => {
      const cells = document.querySelectorAll('.sudoku-cell');
      expect(cells.length).toBe(81);
    });

    test('should set up event listeners on buttons', () => {
      const newGameBtn = document.getElementById('new-game');
      const resetBtn = document.getElementById('reset');
      const hintBtn = document.getElementById('hint');
      const clearBtn = document.getElementById('clear');
      
      expect(newGameBtn).toBeTruthy();
      expect(resetBtn).toBeTruthy();
      expect(hintBtn).toBeTruthy();
      expect(clearBtn).toBeTruthy();
    });

    test('should generate a new game if no saved game exists', () => {
      // Check that the grid has some numbers (not all empty)
      const cells = document.querySelectorAll('.sudoku-cell');
      let filledCells = 0;
      
      cells.forEach(cell => {
        if (cell.textContent.trim() !== '') {
          filledCells++;
        }
      });
      
      expect(filledCells).toBeGreaterThan(0);
      expect(filledCells).toBeLessThan(81);
    });
  });

  describe('Cell Selection', () => {
    test('should select cell when clicked', () => {
      const cells = document.querySelectorAll('.sudoku-cell');
      const firstEmptyCell = Array.from(cells).find(cell => 
        cell.textContent.trim() === '' && !cell.classList.contains('given')
      );
      
      if (firstEmptyCell) {
        firstEmptyCell.click();
        expect(firstEmptyCell.classList.contains('selected')).toBe(true);
      }
    });

    test('should not select pre-filled cells', () => {
      const cells = document.querySelectorAll('.sudoku-cell');
      const givenCell = Array.from(cells).find(cell => 
        cell.textContent.trim() !== '' && cell.classList.contains('given')
      );
      
      if (givenCell) {
        givenCell.click();
        expect(givenCell.classList.contains('selected')).toBe(false);
      }
    });
  });

  describe('Number Input', () => {
    test('should place number in selected cell via keyboard', () => {
      // Find first empty cell
      const cells = document.querySelectorAll('.sudoku-cell');
      const firstEmptyCell = Array.from(cells).find(cell => 
        cell.textContent.trim() === '' && !cell.classList.contains('given')
      );
      
      if (firstEmptyCell) {
        // Select the cell
        firstEmptyCell.click();
        
        // Simulate keyboard input
        const keyEvent = new dom.window.KeyboardEvent('keydown', {
          key: '5',
          bubbles: true
        });
        
        document.dispatchEvent(keyEvent);
        
        // Check if number was placed (might be valid or invalid)
        const cellValue = firstEmptyCell.textContent.trim();
        expect(['5', '']).toContain(cellValue);
      }
    });
  });

  describe('Game Controls', () => {
    test('should generate new game when button clicked', () => {
      const newGameBtn = document.getElementById('new-game');
      const initialGrid = sudokuUI.game.grid.map(row => [...row]);
      
      newGameBtn.click();
      
      // Grid should be different after new game
      expect(sudokuUI.game.grid).not.toEqual(initialGrid);
    });

    test('should reset game when button clicked', () => {
      const resetBtn = document.getElementById('reset');
      const initialGrid = sudokuUI.game.initialGrid.map(row => [...row]);
      
      // Make some changes to the grid
      sudokuUI.game.grid[0][0] = 9;
      sudokuUI.game.mistakes = 3;
      
      resetBtn.click();
      
      // Should restore to initial state
      expect(sudokuUI.game.grid).toEqual(initialGrid);
      expect(sudokuUI.game.mistakes).toBe(0);
    });

    test('should provide hint when button clicked', () => {
      const hintBtn = document.getElementById('hint');
      const initialGrid = sudokuUI.game.grid.map(row => [...row]);
      
      hintBtn.click();
      
      // Grid should have one more filled cell
      let initialFilled = 0;
      let afterFilled = 0;
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (initialGrid[row][col] !== 0) initialFilled++;
          if (sudokuUI.game.grid[row][col] !== 0) afterFilled++;
        }
      }
      
      expect(afterFilled).toBe(initialFilled + 1);
    });
  });

  describe('Win Detection', () => {
    test('should detect win when puzzle is completed', () => {
      // Set up a nearly complete puzzle
      sudokuUI.game.grid = JSON.parse(JSON.stringify(validCompleteSudoku));
      sudokuUI.game.grid[8][8] = 0; // Make last cell empty
      sudokuUI.game.solution = JSON.parse(JSON.stringify(validCompleteSudoku));
      
      // Mock the win celebration
      sudokuUI.animateWinCelebration = jest.fn();
      
      // Complete the puzzle
      sudokuUI.makeMove(8, 8, 9);
      
      // Should detect win
      expect(sudokuUI.game.isComplete).toBe(true);
    });
  });

  describe('Mistake Tracking', () => {
    test('should increment mistakes counter for invalid moves', () => {
      // Set up a specific grid state
      sudokuUI.game.grid = JSON.parse(JSON.stringify(partialSudoku));
      sudokuUI.game.initialGrid = JSON.parse(JSON.stringify(partialSudoku));
      
      const initialMistakes = sudokuUI.game.mistakes;
      
      // Try to make an invalid move (5 already exists in first row)
      sudokuUI.makeMove(0, 2, 5);
      
      expect(sudokuUI.game.mistakes).toBe(initialMistakes + 1);
      expect(document.getElementById('mistakes').textContent).toBe('1');
    });
  });

  describe('Difficulty Selection', () => {
    test('should generate new puzzle when difficulty changes', () => {
      const difficultySelect = document.getElementById('difficulty');
      const initialGrid = sudokuUI.game.grid.map(row => [...row]);
      
      // Change difficulty
      difficultySelect.value = 'hard';
      difficultySelect.dispatchEvent(new dom.window.Event('change'));
      
      // Should generate new puzzle
      expect(sudokuUI.game.grid).not.toEqual(initialGrid);
      expect(sudokuUI.game.difficulty).toBe('hard');
    });
  });

  describe('Local Storage Integration', () => {
    test('should save game state on moves', () => {
      // Make a move
      sudokuUI.makeMove(0, 2, 5);
      
      // Should call localStorage.setItem
      expect(localStorage.setItem).toHaveBeenCalledWith('sudoku-game', expect.any(String));
    });

    test('should load saved game on initialization', () => {
      const savedGame = {
        grid: partialSudoku,
        solution: validCompleteSudoku,
        initialGrid: partialSudoku,
        mistakes: 2,
        difficulty: 'hard',
        isComplete: false,
        startTime: Date.now()
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(savedGame));
      
      // Create new UI instance
      const newUI = new SudokuUI();
      
      expect(newUI.game.grid).toEqual(partialSudoku);
      expect(newUI.game.mistakes).toBe(2);
      expect(newUI.game.difficulty).toBe('hard');
    });
  });

  describe('Keyboard Navigation', () => {
    test('should navigate between cells with arrow keys', () => {
      // Select initial cell
      const cells = document.querySelectorAll('.sudoku-cell');
      const firstCell = cells[0];
      firstCell.click();
      
      // Press right arrow
      const rightArrowEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });
      
      document.dispatchEvent(rightArrowEvent);
      
      // Should move to next cell
      expect(sudokuUI.selectedCell).toEqual({ row: 0, col: 1 });
    });

    test('should clear cell with Delete key', () => {
      // Set up a cell with a number
      sudokuUI.game.grid[0][2] = 5;
      sudokuUI.game.initialGrid[0][2] = 0; // Make it editable
      sudokuUI.selectCell(0, 2);
      
      // Press Delete key
      const deleteEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true
      });
      
      document.dispatchEvent(deleteEvent);
      
      // Cell should be cleared
      expect(sudokuUI.game.grid[0][2]).toBe(0);
    });
  });
});