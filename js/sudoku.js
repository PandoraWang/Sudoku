class SudokuGame {
    constructor() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.initialGrid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.mistakes = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isComplete = false;
        this.difficulty = 'medium';
    }

    isValidMove(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (this.grid[row][i] === num || this.grid[i][col] === num) {
                return false;
            }
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (this.grid[i][j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    solveSudoku(grid = this.grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValidPlacement(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValidPlacement(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num || grid[i][col] === num) {
                return false;
            }
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    generateCompleteSudoku() {
        const grid = Array(9).fill(null).map(() => Array(9).fill(0));
        
        const fillGrid = (grid) => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) {
                        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                        
                        for (let num of numbers) {
                            if (this.isValidPlacement(grid, row, col, num)) {
                                grid[row][col] = num;
                                
                                if (fillGrid(grid)) {
                                    return true;
                                }
                                
                                grid[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };

        fillGrid(grid);
        return grid;
    }

    generatePuzzle(difficulty = 'medium') {
        this.difficulty = difficulty;
        const completeGrid = this.generateCompleteSudoku();
        
        this.solution = completeGrid.map(row => [...row]);
        
        const puzzle = completeGrid.map(row => [...row]);
        
        const difficultySettings = {
            easy: { cellsToRemove: 35, maxIterations: 1000 },
            medium: { cellsToRemove: 45, maxIterations: 1500 },
            hard: { cellsToRemove: 55, maxIterations: 2000 }
        };

        const settings = difficultySettings[difficulty];
        let cellsRemoved = 0;
        let iterations = 0;

        while (cellsRemoved < settings.cellsToRemove && iterations < settings.maxIterations) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (puzzle[row][col] !== 0) {
                const backup = puzzle[row][col];
                puzzle[row][col] = 0;
                
                const testGrid = puzzle.map(row => [...row]);
                if (this.hasUniqueSolution(testGrid)) {
                    cellsRemoved++;
                } else {
                    puzzle[row][col] = backup;
                }
            }
            iterations++;
        }

        this.grid = puzzle.map(row => [...row]);
        this.initialGrid = puzzle.map(row => [...row]);
        this.resetGame();
    }

    hasUniqueSolution(grid) {
        let solutionCount = 0;
        
        const solve = (grid) => {
            if (solutionCount > 1) return false;
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (this.isValidPlacement(grid, row, col, num)) {
                                grid[row][col] = num;
                                
                                if (solve(grid)) {
                                    grid[row][col] = 0;
                                    return false;
                                }
                                
                                grid[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            
            solutionCount++;
            return solutionCount <= 1;
        };

        solve(grid.map(row => [...row]));
        return solutionCount === 1;
    }

    makeMove(row, col, num) {
        if (this.initialGrid[row][col] !== 0) {
            return false;
        }

        const previousValue = this.grid[row][col];
        this.grid[row][col] = num;

        if (num !== 0 && !this.isValidMove(row, col, num)) {
            this.mistakes++;
            return false;
        }

        if (this.isComplete) {
            this.checkWin();
        }

        return true;
    }

    getHint() {
        if (this.isComplete) return null;

        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length === 0) return null;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        return {
            row: randomCell.row,
            col: randomCell.col,
            value: this.solution[randomCell.row][randomCell.col]
        };
    }

    checkWin() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    this.isComplete = false;
                    return false;
                }
            }
        }

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!this.isValidMove(row, col, this.grid[row][col])) {
                    this.isComplete = false;
                    return false;
                }
            }
        }

        this.isComplete = true;
        this.stopTimer();
        return true;
    }

    resetGame() {
        this.grid = this.initialGrid.map(row => [...row]);
        this.selectedCell = null;
        this.mistakes = 0;
        this.isComplete = false;
        this.startTimer();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        if (this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = timeString;
            }
        }
    }

    getElapsedTime() {
        if (this.startTime) {
            return Math.floor((Date.now() - this.startTime) / 1000);
        }
        return 0;
    }

    saveGame() {
        const gameState = {
            grid: this.grid,
            solution: this.solution,
            initialGrid: this.initialGrid,
            mistakes: this.mistakes,
            startTime: this.startTime,
            difficulty: this.difficulty,
            isComplete: this.isComplete
        };
        
        localStorage.setItem('sudoku-game', JSON.stringify(gameState));
    }

    loadGame() {
        const savedGame = localStorage.getItem('sudoku-game');
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            
            this.grid = gameState.grid;
            this.solution = gameState.solution;
            this.initialGrid = gameState.initialGrid;
            this.mistakes = gameState.mistakes;
            this.startTime = gameState.startTime;
            this.difficulty = gameState.difficulty;
            this.isComplete = gameState.isComplete;
            
            if (!this.isComplete) {
                this.startTimer();
            }
            
            return true;
        }
        return false;
    }

    clearSave() {
        localStorage.removeItem('sudoku-game');
    }
}