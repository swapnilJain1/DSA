import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';
import CodeEditor from './CodeEditor';

jest.mock('prismjs', () => ({
  highlight: jest.fn((code) => code),
  languages: {
    javascript: {},
    python: {},
    java: {}
  }
}));

describe('CodeEditor', () => {
    const mockOnChange = jest.fn();

    it('renders editor with code', () => {
        render(<CodeEditor code="const x = 1;" onChange={mockOnChange} />);
        expect(screen.getByRole('textbox')).toHaveValue('const x = 1;');
    });

    it('auto-closes brackets', () => {
        render(<CodeEditor code="" onChange={mockOnChange} />);
        const textarea = screen.getByRole('textbox');
        
        fireEvent.keyDown(textarea, { key: '(' });
        // onChange should be called with "()"
        expect(mockOnChange).toHaveBeenCalledWith('()');
    });

    it('auto-closes curly braces', () => {
        render(<CodeEditor code="" onChange={mockOnChange} />);
        const textarea = screen.getByRole('textbox');
        
        fireEvent.keyDown(textarea, { key: '{' });
        expect(mockOnChange).toHaveBeenCalledWith('{}');
    });
});