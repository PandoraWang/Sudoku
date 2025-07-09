// Jest setup file for DOM testing
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.confirm and window.alert
global.confirm = jest.fn(() => true);
global.alert = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  if (localStorage.getItem && localStorage.getItem.mockReturnValue) {
    localStorage.getItem.mockReturnValue(null);
  }
});