
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';
import AIQuestionGeneratorModal from './AIQuestionGeneratorModal';
import * as geminiService from '../services/geminiService';

// Mock the service
jest.mock('../services/geminiService', () => ({
    generatePracticeQuestions: jest.fn()
}));

describe('AIQuestionGeneratorModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        onImport: jest.fn(),
        showToast: jest.fn(),
        apiKey: 'test-api-key'
    };

    it('renders with correct title', () => {
        render(<AIQuestionGeneratorModal {...mockProps} />);
        expect(screen.getByText('AI Question Curator')).toBeInTheDocument();
    });

    it('allows typing custom request', () => {
        render(<AIQuestionGeneratorModal {...mockProps} />);
        const input = screen.getByPlaceholderText(/e.g. 'Blind 75/i);
        fireEvent.change(input, { target: { value: 'Dynamic Programming questions' } });
        expect(input).toHaveValue('Dynamic Programming questions');
    });

    it('shows loading state and calls API with correct custom prompt', async () => {
        render(<AIQuestionGeneratorModal {...mockProps} />);
        
        // Input custom prompt
        const input = screen.getByPlaceholderText(/e.g. 'Blind 75/i);
        fireEvent.change(input, { target: { value: 'Google Interview' } });

        // Mock API response
        (geminiService.generatePracticeQuestions as unknown as jest.Mock<(...args: any[]) => Promise<any>>).mockResolvedValue([
            { title: 'Q1', description: 'Desc 1', difficulty: 'Hard', topics: ['Graph'], url: '' }
        ]);

        // Click generate
        const btn = screen.getByText('Find Questions');
        fireEvent.click(btn);

        // Check loading
        expect(screen.getByText('Curating your practice set...')).toBeInTheDocument();

        // Check API call arguments
        await waitFor(() => {
            expect(geminiService.generatePracticeQuestions).toHaveBeenCalledWith(
                3, // default count
                'Medium', // default difficulty
                ['Random'], // default topic
                'Google Interview', // custom prompt
                'test-api-key'
            );
        });
    });

    it('handles import selection correctly', async () => {
        // Setup preview state
        (geminiService.generatePracticeQuestions as unknown as jest.Mock<(...args: any[]) => Promise<any>>).mockResolvedValue([
            { title: 'Problem A', description: 'Desc A', difficulty: 'Easy', topics: [], url: '' },
            { title: 'Problem B', description: 'Desc B', difficulty: 'Medium', topics: [], url: '' }
        ]);

        render(<AIQuestionGeneratorModal {...mockProps} />);
        fireEvent.click(screen.getByText('Find Questions'));

        await waitFor(() => expect(screen.getByText('Problem A')).toBeInTheDocument());

        // Default all selected (2)
        expect(screen.getByText('Import 2 Questions')).toBeInTheDocument();

        // Deselect one by clicking the card (first card)
        const cardA = screen.getByText('Problem A').closest('div')?.parentElement;
        if(cardA) fireEvent.click(cardA);

        expect(screen.getByText('Import 1 Questions')).toBeInTheDocument();

        // Click Import
        fireEvent.click(screen.getByText(/Import 1 Questions/));
        
        expect(mockProps.onImport).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ title: 'Problem B' })
        ]));
        // Should NOT contain Problem A
        expect(mockProps.onImport).not.toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ title: 'Problem A' })
        ]));
    });

    it('generates fallback URL on import if missing', async () => {
        (geminiService.generatePracticeQuestions as unknown as jest.Mock<(...args: any[]) => Promise<any>>).mockResolvedValue([
            { title: 'Two Sum', description: 'Find two numbers...', difficulty: 'Easy', topics: [], url: '' } // Empty URL
        ]);

        render(<AIQuestionGeneratorModal {...mockProps} />);
        fireEvent.click(screen.getByText('Find Questions'));
        await waitFor(() => screen.getByText('Two Sum'));
        fireEvent.click(screen.getByText('Import 1 Questions'));

        expect(mockProps.onImport).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ 
                title: 'Two Sum',
                url: expect.stringContaining('google.com/search?q=Two%20Sum%20leetcode')
            })
        ]));
    });

    it('formats description with newlines during import if missing', async () => {
        // Simulate bad AI response missing newlines
        const badDescription = "Some intro### Problem: The problem text.* Constraint 1";
        
        (geminiService.generatePracticeQuestions as unknown as jest.Mock<(...args: any[]) => Promise<any>>).mockResolvedValue([
            { title: 'Bad Format Q', description: badDescription, difficulty: 'Easy', topics: [], url: '' }
        ]);

        render(<AIQuestionGeneratorModal {...mockProps} />);
        fireEvent.click(screen.getByText('Find Questions'));
        await waitFor(() => screen.getByText('Bad Format Q'));
        fireEvent.click(screen.getByText('Import 1 Questions'));

        expect(mockProps.onImport).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ 
                title: 'Bad Format Q',
                // Expect inserted newlines
                description: expect.stringContaining('\n\n###') 
            })
        ]));
        expect(mockProps.onImport).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ 
                description: expect.stringContaining('\n* ') 
            })
        ]));
    });
});
