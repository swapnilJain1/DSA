import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';
import SettingsModal from './SettingsModal';

describe('SettingsModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        showToast: jest.fn(),
        apiKey: '',
        onSave: jest.fn()
    };

    it('renders input field', () => {
        render(<SettingsModal {...mockProps} />);
        expect(screen.getByPlaceholderText('Paste your API key here...')).toBeInTheDocument();
    });

    it('masks input by default', () => {
        render(<SettingsModal {...mockProps} apiKey="secret-key" />);
        const input = screen.getByDisplayValue('secret-key');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('validates empty input on save', () => {
        render(<SettingsModal {...mockProps} />);
        fireEvent.click(screen.getByText('Save Key'));
        expect(mockProps.showToast).toHaveBeenCalledWith(expect.stringContaining('valid API Key'), 'error', null);
        expect(mockProps.onSave).not.toHaveBeenCalled();
    });

    it('saves valid key', () => {
        render(<SettingsModal {...mockProps} />);
        const input = screen.getByPlaceholderText('Paste your API key here...');
        fireEvent.change(input, { target: { value: 'new-key-123' } });
        fireEvent.click(screen.getByText('Save Key'));
        expect(mockProps.onSave).toHaveBeenCalledWith('new-key-123');
        expect(mockProps.onClose).toHaveBeenCalled();
    });
});