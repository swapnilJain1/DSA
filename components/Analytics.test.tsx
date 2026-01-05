import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';
import Analytics from './Analytics';
import { Question } from '../types';

// Mock Recharts because it uses HTML Canvas which is hard to test in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
}));

const mockQuestions: Question[] = [
    {
        id: '1',
        title: 'Easy Problem',
        difficulty: 'Easy',
        status: 'Solved',
        timeTaken: 300, // 5 mins (Elite for Easy)
        lastAttempted: new Date().toISOString(),
        topics: ['Array'],
        url: '', description: '', notes: '', hints: [], solutions: [], mistakes: ''
    },
    {
        id: '2',
        title: 'Hard Problem',
        difficulty: 'Hard',
        status: 'Solved',
        timeTaken: 5000, // Long time
        lastAttempted: new Date().toISOString(),
        topics: ['DP'],
        url: '', description: '', notes: '', hints: [], solutions: [], mistakes: ''
    },
    {
        id: '3',
        title: 'Unsolved Problem',
        difficulty: 'Medium',
        status: 'Todo',
        timeTaken: 0,
        lastAttempted: null,
        topics: ['Graph'],
        url: '', description: '', notes: '', hints: [], solutions: [], mistakes: ''
    }
];

describe('Analytics Component', () => {
    it('calculates total time correctly', () => {
        render(<Analytics questions={mockQuestions} />);
        // 300 + 5000 = 5300 seconds ~= 1.5 hours
        expect(screen.getByText('1.5h')).toBeInTheDocument();
    });

    it('displays completion rate correctly', () => {
        render(<Analytics questions={mockQuestions} />);
        // 2 solved out of 3 total = 67%
        expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('identifies Strong Areas correctly', () => {
        render(<Analytics questions={mockQuestions} />);
        // 'Array' topic was solved efficiently (Easy in 300s = Elite)
        // 'DP' was solved but slowly.
        // So 'Array' should be in strong areas.
        expect(screen.getByText('Array')).toBeInTheDocument();
    });

    it('renders all charts', () => {
        render(<Analytics questions={mockQuestions} />);
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
});