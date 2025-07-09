# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a vanilla JavaScript project with no build system or package manager.

**To run the application:**
```bash
open index.html
```

**To test changes:**
Open `index.html` in a web browser and interact with the game interface.

## Architecture Overview

### Core Classes

**SudokuGame (`js/sudoku.js`)**: Contains all game logic and state management
- Puzzle generation using backtracking algorithm
- Sudoku validation (row, column, 3x3 box constraints)
- Game state (grid, solution, timer, mistakes)
- Data persistence via localStorage
- Difficulty levels (easy: 35 cells removed, medium: 45, hard: 55)

**SudokuUI (`js/ui.js`)**: Handles DOM manipulation and user interactions
- Grid rendering and cell selection
- Event handling (mouse clicks, keyboard input)
- UI state management (selected cell, visual feedback)
- Game controls (new game, reset, hints, clear)

**Utils (`js/utils.js`)**: Shared helper functions
- Array shuffling, deep copying, time formatting
- Grid coordinate utilities
- DOM animation helpers

### Data Flow

1. **User Input** → `SudokuUI` event handlers
2. **UI Methods** → `SudokuGame` methods for game logic
3. **Game Logic** → Updates internal state
4. **State Changes** → `SudokuUI.updateDisplay()` refreshes DOM

### Key Implementation Details

**Grid Coordinate System**: 
- 0-8 for both rows and columns
- Grid stored as `Array(9).fill(null).map(() => Array(9).fill(0))`
- Empty cells represented as `0`, filled cells as `1-9`

**Validation Logic**: 
- **Critical**: Always validate moves BEFORE placing numbers in grid
- `isValidMove()` checks current grid state for conflicts
- Recent bug fix: validation must happen before `grid[row][col] = num`

**Direct Number Input**:
- Keyboard input (1-9) directly places numbers in selected cells
- No dependency on number pad selection
- Number pad is hidden via CSS (`display: none`)

**State Persistence**:
- Game state auto-saved to localStorage on every move
- Timer state persists across browser sessions
- `loadGame()` restores previous session on startup

**Puzzle Generation**:
- Start with complete valid Sudoku grid
- Remove cells based on difficulty level
- Ensure unique solution using backtracking solver
- `hasUniqueSolution()` validates puzzle quality

## Important Notes

- No framework dependencies - pure vanilla JavaScript
- Files loaded via script tags in order: utils.js → sudoku.js → ui.js
- All styling in single `styles.css` file with CSS animations
- Responsive design works on desktop and mobile
- Timer runs via `setInterval`, cleared on game completion
- localStorage key: `'sudoku-game'` for save/load functionality