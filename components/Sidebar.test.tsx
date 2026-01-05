import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  const mockProps = {
    currentView: 'dashboard',
    onChangeView: jest.fn(),
    isOpen: true,
    setIsOpen: jest.fn(),
    totalCount: 10,
    todoCount: 5
  };

  it('renders navigation items', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('To-Do List')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('displays badges correctly', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('10')).toBeInTheDocument(); // Total count badge
    expect(screen.getByText('5')).toBeInTheDocument(); // Todo count badge
  });

  it('calls onChangeView when item clicked', () => {
    render(<Sidebar {...mockProps} />);
    fireEvent.click(screen.getByText('To-Do List'));
    expect(mockProps.onChangeView).toHaveBeenCalledWith('todo');
  });
});