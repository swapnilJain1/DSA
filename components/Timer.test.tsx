import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import Timer from './Timer';

describe('Timer Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders initial time correctly', () => {
        render(<Timer isOpen={true} onClose={() => {}} initialTime={65} />);
        expect(screen.getByText('01:05')).toBeInTheDocument();
    });

    it('starts and pauses the timer', () => {
        render(<Timer isOpen={true} onClose={() => {}} />);
        const timeDisplay = screen.getByText('00:00');
        const container = timeDisplay.closest('div')?.parentElement;
        if (container) fireEvent.mouseEnter(container);

        const startButton = screen.getByText('START');
        fireEvent.click(startButton);
        
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(screen.getByText('00:02')).toBeInTheDocument();
    });

    it('handles external time adjustment while running', () => {
        const { rerender } = render(<Timer isOpen={true} onClose={() => {}} initialTime={0} />);
        
        // Start timer
        const timeDisplay = screen.getByText('00:00');
        const container = timeDisplay.closest('div')?.parentElement;
        if (container) fireEvent.mouseEnter(container);
        fireEvent.click(screen.getByText('START'));

        // Advance 2s
        act(() => { jest.advanceTimersByTime(2000); });
        expect(screen.getByText('00:02')).toBeInTheDocument();

        // Simulate external update (+60s)
        rerender(<Timer isOpen={true} onClose={() => {}} initialTime={0} timeAdjustment={{ value: 60, id: '1' }} />);

        // Should jump
        // Wait for potential timeout/state update cycle
        // Since setSeconds inside useEffect is async-ish in test env, we just check next render
        expect(screen.getByText('01:02')).toBeInTheDocument(); 
    });
});