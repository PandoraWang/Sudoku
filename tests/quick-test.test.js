// Quick test to check if we can load the classes
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

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

try {
  // Load utils.js
  const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
  console.log('Utils code loaded, length:', utilsCode.length);
  eval(utilsCode);
  console.log('Utils evaluated successfully');
  
  // Test if a util function exists
  if (typeof shuffleArray !== 'undefined') {
    console.log('shuffleArray function found');
  } else {
    console.log('shuffleArray function NOT found');
  }
  
  // Load sudoku.js
  const sudokuCode = fs.readFileSync(path.join(__dirname, '../js/sudoku.js'), 'utf8');
  console.log('Sudoku code loaded, length:', sudokuCode.length);
  console.log('First 200 chars:', sudokuCode.substring(0, 200));
  console.log('Last 200 chars:', sudokuCode.substring(sudokuCode.length - 200));
  
  try {
    eval(sudokuCode);
    console.log('Sudoku evaluated successfully');
  } catch (evalError) {
    console.error('Error evaluating sudoku.js:', evalError);
  }
  
  // Test if SudokuGame class exists
  console.log('Global object keys:', Object.keys(global));
  console.log('Window object keys:', Object.keys(window));
  
  if (typeof SudokuGame !== 'undefined') {
    console.log('SudokuGame class found');
    const game = new SudokuGame();
    console.log('SudokuGame instance created:', game.difficulty);
  } else {
    console.log('SudokuGame class NOT found');
    console.log('typeof SudokuGame:', typeof SudokuGame);
  }
  
  // Try to access it from window
  if (typeof window.SudokuGame !== 'undefined') {
    console.log('SudokuGame found on window');
  } else {
    console.log('SudokuGame NOT found on window');
  }
  
} catch (error) {
  console.error('Error loading classes:', error);
}

test('dummy test', () => {
  expect(true).toBe(true);
});