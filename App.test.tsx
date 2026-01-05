import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import App from './App';

// Mock localStorage
const localStorageMock = (function() {
  let store: any = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location.reload
Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload: jest.fn() },
});

// Mock URL.createObjectURL and revokeObjectURL
window.URL.createObjectURL = jest.fn(() => 'mock-url');
window.URL.revokeObjectURL = jest.fn();

// Mock FileReader
class MockFileReader {
    onload: ((e: any) => void) | null = null;
    onerror: ((e: any) => void) | null = null;
    readAsText(file: File) {
        // We attach the content to the file object in the test setup
        const content = (file as any).content || JSON.stringify({ questions: [], weeklyGoal: 5 });
        setTimeout(() => {
            if (this.onload) {
                this.onload({ target: { result: content } });
            }
        }, 0);
    }
}
// @ts-ignore
window.FileReader = MockFileReader;

// Mock window.confirm
window.confirm = jest.fn(() => true);

// Mock GoogleGenAI
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockImplementation(() => Promise.resolve({ text: 'Mock AI Response' }))
    }
  }))
}));

// Mock the new Generator Modal to avoid complexity in App test
jest.mock('./components/AIQuestionGeneratorModal', () => {
    return function DummyGenerator({ isOpen }: { isOpen: boolean }) {
        return isOpen ? <div data-testid="ai-generator-modal">Generator Open</div> : null;
    };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders Dashboard by default and hides Todo-specific buttons', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // "Get More Questions" is strictly for Todo view
    expect(screen.queryByText('Get More Questions')).not.toBeInTheDocument();
    // "Add" button should also be hidden in dashboard view now
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  it('shows Add and AI buttons ONLY in To-Do view', () => {
      render(<App />);
      const todoNav = screen.getByText('To-Do List');
      fireEvent.click(todoNav);
      
      expect(screen.getByText('Get More Questions')).toBeInTheDocument();
      const addButtons = screen.getAllByText('Add');
      expect(addButtons.length).toBeGreaterThan(0);
  });

  it('cycles difficulty filter when header is clicked', () => {
      render(<App />);
      const difficultyHeader = screen.getByText('Difficulty').closest('th');
      expect(difficultyHeader).toBeInTheDocument();

      fireEvent.click(difficultyHeader!);
      expect(screen.getByText('Easy')).toBeInTheDocument();
      
      fireEvent.click(difficultyHeader!);
      expect(screen.getByText('Medium')).toBeInTheDocument();
      
      fireEvent.click(difficultyHeader!);
      expect(screen.getByText('Hard')).toBeInTheDocument();

      fireEvent.click(difficultyHeader!);
      expect(screen.queryByText('Hard')).not.toBeInTheDocument();
  });

  it('handles Export functionality using native API', async () => {
      render(<App />);
      const exportBtn = screen.getByTitle('Download backup');
      fireEvent.click(exportBtn);

      await waitFor(() => {
          expect(window.URL.createObjectURL).toHaveBeenCalled();
          expect(screen.getByText('Backup downloaded!')).toBeInTheDocument();
      });
  });

  it('handles Import functionality', async () => {
      render(<App />);
      
      // Mock Import Data
      const mockData = {
          questions: [
              {
                  id: 'imported-1',
                  title: 'Imported Problem',
                  difficulty: 'Hard',
                  status: 'Solved',
                  topics: [],
                  url: '', description: '', notes: '', hints: [], solutions: [], mistakes: '',
                  timeTaken: 100, lastAttempted: new Date().toISOString()
              }
          ],
          weeklyGoal: 10
      };

      const file = new File([''], 'backup.json', { type: 'application/json' });
      (file as any).content = JSON.stringify(mockData);

      const input = screen.getByTestId('import-input');
      
      await act(async () => {
          fireEvent.change(input, { target: { files: [file] } });
      });

      // Confirm dialog should be called
      expect(window.confirm).toHaveBeenCalled();

      // Check if data updated
      await waitFor(() => {
          expect(screen.getByText('Imported Problem')).toBeInTheDocument();
          // Check toast
          expect(screen.getByText(/Restored 1 questions successfully!/i)).toBeInTheDocument();
      });
  });
});