# Sudoku Game

A fully functional, interactive Sudoku game built with HTML, CSS, and JavaScript. Features multiple difficulty levels, hints, timer, and responsive design.

## Features

### 🎮 Core Gameplay
- **Interactive 9x9 Grid**: Click cells to select and input numbers
- **Number Pad**: Click numbers 1-9 to fill cells
- **Keyboard Support**: Use number keys, arrow keys, and shortcuts
- **Real-time Validation**: Instant feedback on invalid moves
- **Visual Feedback**: Highlighted conflicts and completed regions

### 🎯 Difficulty Levels
- **Easy**: 35 cells removed, great for beginners
- **Medium**: 45 cells removed, balanced challenge
- **Hard**: 55 cells removed, for experienced players

### 🛠️ Game Controls
- **New Game**: Generate a fresh puzzle
- **Reset**: Return to the initial puzzle state
- **Hint**: Get help with a random empty cell
- **Clear Cell**: Remove number from selected cell

### 📊 Game Stats
- **Timer**: Track your solving time
- **Mistake Counter**: Monitor incorrect moves
- **Auto-save**: Progress is saved automatically

### 🎨 User Experience
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Polished visual effects
- **Local Storage**: Game state persists between sessions
- **Intuitive Interface**: Clean, modern design

## How to Play

### Basic Rules
1. Fill the 9×9 grid with numbers 1-9
2. Each row must contain all numbers 1-9 exactly once
3. Each column must contain all numbers 1-9 exactly once
4. Each 3×3 box must contain all numbers 1-9 exactly once

### Controls
- **Mouse**: Click cells to select, click number pad to input
- **Keyboard**: 
  - Numbers 1-9: Input numbers
  - Arrow keys: Navigate between cells
  - Delete/Backspace: Clear selected cell
  - Escape: Deselect current cell

### Getting Started
1. Open `index.html` in your web browser
2. Select your preferred difficulty level
3. Click "New Game" to generate a puzzle
4. Click on empty cells and use the number pad or keyboard to fill them
5. Use "Hint" if you get stuck
6. Complete the puzzle to win!

## File Structure

```
sudoku/
├── index.html          # Main HTML file
├── styles.css          # All styling and animations
├── js/
│   ├── sudoku.js       # Core game logic and puzzle generation
│   ├── ui.js           # User interface handling
│   └── utils.js        # Helper functions
└── README.md           # This file
```

## Technical Details

### Game Logic
- **Puzzle Generation**: Creates valid, solvable puzzles
- **Backtracking Algorithm**: Ensures unique solutions
- **Validation Engine**: Real-time constraint checking
- **Difficulty Scaling**: Adjusts cell removal based on level

### User Interface
- **Event Handling**: Mouse and keyboard interactions
- **State Management**: Track selected cells and numbers
- **Visual Feedback**: Highlights, animations, and status messages
- **Responsive Layout**: Adapts to different screen sizes

### Data Persistence
- **Local Storage**: Saves game state automatically
- **Session Recovery**: Resume games after browser restart
- **Progress Tracking**: Maintains timer and mistake count

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Installation

No installation required! Simply:

1. Download all files
2. Open `index.html` in your web browser
3. Start playing!

## Customization

You can easily customize the game by modifying:

- **Difficulty levels** in `js/sudoku.js`
- **Styling and colors** in `styles.css`
- **UI elements** in `index.html`
- **Game mechanics** in `js/sudoku.js`

## Contributing

Feel free to enhance the game with:
- Additional themes
- More difficulty levels
- Sound effects
- Multiplayer features
- Statistics tracking
- Puzzle importing/exporting

## License

This project is open source and available under the MIT License.

---

**Enjoy playing Sudoku!** 🎉