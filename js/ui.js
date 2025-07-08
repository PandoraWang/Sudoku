class SudokuUI {
    constructor() {
        this.game = new SudokuGame();
        this.selectedCell = null;
        this.selectedNumber = null;
        this.init();
    }

    init() {
        this.createGrid();
        this.bindEvents();
        this.loadOrStartNewGame();
    }

    createGrid() {
        const gridContainer = document.getElementById('sudoku-grid');
        gridContainer.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.index = getCellIndex(row, col);
                
                cell.addEventListener('click', () => this.selectCell(row, col));
                
                gridContainer.appendChild(cell);
            }
        }
    }

    bindEvents() {
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('reset').addEventListener('click', () => this.resetGame());
        document.getElementById('hint').addEventListener('click', () => this.showHint());
        document.getElementById('clear').addEventListener('click', () => this.clearCell());
        document.getElementById('difficulty').addEventListener('change', (e) => this.changeDifficulty(e.target.value));

        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectNumber(parseInt(btn.dataset.number)));
        });

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        window.addEventListener('beforeunload', () => this.game.saveGame());
    }

    loadOrStartNewGame() {
        if (this.game.loadGame()) {
            this.updateDisplay();
            this.updateDifficultySelector();
            showMessage('Game loaded successfully!', 'success');
        } else {
            this.startNewGame();
        }
    }

    startNewGame() {
        const difficulty = document.getElementById('difficulty').value;
        showMessage('Generating new puzzle...', 'info');
        
        setTimeout(() => {
            this.game.generatePuzzle(difficulty);
            this.updateDisplay();
            showMessage(`New ${difficulty} puzzle generated!`, 'success');
        }, 100);
    }

    resetGame() {
        this.game.resetGame();
        this.updateDisplay();
        showMessage('Game reset!', 'info');
    }

    selectCell(row, col) {
        if (this.game.initialGrid[row][col] !== 0) {
            return;
        }

        this.selectedCell = { row, col };
        this.updateCellHighlights();
    }

    selectNumber(number) {
        this.selectedNumber = number;
        this.updateNumberPadHighlights();
        
        if (this.selectedCell) {
            this.makeMove(this.selectedCell.row, this.selectedCell.col, number);
        }
    }

    makeMove(row, col, number) {
        if (this.game.isComplete) {
            showMessage('Game is already complete!', 'info');
            return;
        }

        const wasValid = this.game.makeMove(row, col, number);
        
        if (!wasValid && number !== 0) {
            showMessage('Invalid move! Try again.', 'error');
            this.animateInvalidMove(row, col);
        }
        
        this.updateDisplay();
        this.game.saveGame();
        
        if (this.game.checkWin()) {
            this.handleGameWin();
        }
    }

    clearCell() {
        if (this.selectedCell) {
            const { row, col } = this.selectedCell;
            if (this.game.initialGrid[row][col] === 0) {
                this.game.grid[row][col] = 0;
                this.updateDisplay();
                this.game.saveGame();
            }
        } else {
            showMessage('Please select a cell first!', 'info');
        }
    }

    showHint() {
        if (this.game.isComplete) {
            showMessage('Game is already complete!', 'info');
            return;
        }

        const hint = this.game.getHint();
        if (hint) {
            this.game.grid[hint.row][hint.col] = hint.value;
            this.updateDisplay();
            this.game.saveGame();
            showMessage(`Hint: ${hint.value} placed at row ${hint.row + 1}, column ${hint.col + 1}`, 'success');
            
            if (this.game.checkWin()) {
                this.handleGameWin();
            }
        } else {
            showMessage('No hints available!', 'info');
        }
    }

    changeDifficulty(difficulty) {
        this.game.difficulty = difficulty;
        this.startNewGame();
    }

    updateDisplay() {
        this.updateGrid();
        this.updateGameInfo();
        this.updateCellHighlights();
    }

    updateGrid() {
        const cells = document.querySelectorAll('.sudoku-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.game.grid[row][col];
            
            cell.textContent = value === 0 ? '' : value;
            
            cell.classList.remove('given', 'conflict', 'completed');
            
            if (this.game.initialGrid[row][col] !== 0) {
                cell.classList.add('given');
            }
            
            if (value !== 0 && !this.game.isValidMove(row, col, value)) {
                cell.classList.add('conflict');
            }
            
            if (this.isRowCompleted(row) || this.isColumnCompleted(col) || this.isBoxCompleted(row, col)) {
                cell.classList.add('completed');
            }
        });
    }

    updateGameInfo() {
        const mistakesElement = document.getElementById('mistakes');
        if (mistakesElement) {
            mistakesElement.textContent = this.game.mistakes;
        }
    }

    updateCellHighlights() {
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        if (this.selectedCell) {
            const { row, col } = this.selectedCell;
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cellElement) {
                cellElement.classList.add('selected');
            }
        }
    }

    updateNumberPadHighlights() {
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        if (this.selectedNumber) {
            const numberBtn = document.querySelector(`[data-number="${this.selectedNumber}"]`);
            if (numberBtn) {
                numberBtn.classList.add('selected');
            }
        }
    }

    updateDifficultySelector() {
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.value = this.game.difficulty;
        }
    }

    isRowCompleted(row) {
        const rowValues = this.game.grid[row];
        const uniqueValues = new Set(rowValues.filter(val => val !== 0));
        return uniqueValues.size === 9;
    }

    isColumnCompleted(col) {
        const colValues = this.game.grid.map(row => row[col]);
        const uniqueValues = new Set(colValues.filter(val => val !== 0));
        return uniqueValues.size === 9;
    }

    isBoxCompleted(row, col) {
        const boxRow = Math.floor(row / 3);
        const boxCol = Math.floor(col / 3);
        const boxValues = [];
        
        for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
            for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
                boxValues.push(this.game.grid[r][c]);
            }
        }
        
        const uniqueValues = new Set(boxValues.filter(val => val !== 0));
        return uniqueValues.size === 9;
    }

    handleGameWin() {
        const elapsedTime = this.game.getElapsedTime();
        const timeString = formatTime(elapsedTime);
        
        showMessage(`Congratulations! You completed the puzzle in ${timeString} with ${this.game.mistakes} mistakes!`, 'success', 5000);
        
        this.game.clearSave();
        
        setTimeout(() => {
            const playAgain = confirm('Congratulations! Would you like to play another game?');
            if (playAgain) {
                this.startNewGame();
            }
        }, 2000);
    }

    animateInvalidMove(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                cell.style.animation = '';
            }, 500);
        }
    }

    handleKeyPress(event) {
        if (event.key >= '1' && event.key <= '9') {
            const number = parseInt(event.key);
            if (this.selectedCell) {
                this.makeMove(this.selectedCell.row, this.selectedCell.col, number);
            }
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
            this.clearCell();
        } else if (event.key === 'Escape') {
            this.selectedCell = null;
            this.selectedNumber = null;
            this.updateCellHighlights();
            this.updateNumberPadHighlights();
        }
        
        if (this.selectedCell) {
            const { row, col } = this.selectedCell;
            let newRow = row;
            let newCol = col;
            
            switch (event.key) {
                case 'ArrowUp':
                    newRow = Math.max(0, row - 1);
                    break;
                case 'ArrowDown':
                    newRow = Math.min(8, row + 1);
                    break;
                case 'ArrowLeft':
                    newCol = Math.max(0, col - 1);
                    break;
                case 'ArrowRight':
                    newCol = Math.min(8, col + 1);
                    break;
            }
            
            if (newRow !== row || newCol !== col) {
                this.selectCell(newRow, newCol);
                event.preventDefault();
            }
        }
    }
}

const sudokuUI = new SudokuUI();