function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepCopy(item));
    }
    
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepCopy(obj[key]);
        });
        return copy;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function showMessage(message, type = 'info', duration = 3000) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = type;
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = '';
        }, duration);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function getCellIndex(row, col) {
    return row * 9 + col;
}

function getRowCol(index) {
    return {
        row: Math.floor(index / 9),
        col: index % 9
    };
}

function isValidSudokuInput(input) {
    const num = parseInt(input);
    return !isNaN(num) && num >= 1 && num <= 9;
}

function getBoxIndex(row, col) {
    return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function getCellsInBox(boxRow, boxCol) {
    const cells = [];
    const startRow = boxRow * 3;
    const startCol = boxCol * 3;
    
    for (let row = startRow; row < startRow + 3; row++) {
        for (let col = startCol; col < startCol + 3; col++) {
            cells.push({ row, col });
        }
    }
    
    return cells;
}

function getCellsInRow(row) {
    const cells = [];
    for (let col = 0; col < 9; col++) {
        cells.push({ row, col });
    }
    return cells;
}

function getCellsInColumn(col) {
    const cells = [];
    for (let row = 0; row < 9; row++) {
        cells.push({ row, col });
    }
    return cells;
}

function getRelatedCells(row, col) {
    const related = new Set();
    
    getCellsInRow(row).forEach(cell => {
        if (!(cell.row === row && cell.col === col)) {
            related.add(`${cell.row}-${cell.col}`);
        }
    });
    
    getCellsInColumn(col).forEach(cell => {
        if (!(cell.row === row && cell.col === col)) {
            related.add(`${cell.row}-${cell.col}`);
        }
    });
    
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    getCellsInBox(boxRow, boxCol).forEach(cell => {
        if (!(cell.row === row && cell.col === col)) {
            related.add(`${cell.row}-${cell.col}`);
        }
    });
    
    return Array.from(related).map(key => {
        const [r, c] = key.split('-').map(Number);
        return { row: r, col: c };
    });
}

function generateRandomSeed() {
    return Math.floor(Math.random() * 1000000);
}

function createSeededRandom(seed) {
    let current = seed;
    return function() {
        current = (current * 1103515245 + 12345) & 0x7fffffff;
        return current / 0x7fffffff;
    };
}

function animateElement(element, animation, duration = 300) {
    return new Promise((resolve) => {
        element.style.animation = `${animation} ${duration}ms ease`;
        
        const handleAnimationEnd = () => {
            element.style.animation = '';
            element.removeEventListener('animationend', handleAnimationEnd);
            resolve();
        };
        
        element.addEventListener('animationend', handleAnimationEnd);
    });
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function supportsLocalStorage() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, 'test');
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve();
    }
}