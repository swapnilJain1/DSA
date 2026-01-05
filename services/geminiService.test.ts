import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generatePracticeQuestions, generateTestCases } from './geminiService';

// Mock @google/genai
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: mockGenerateContent
        }
    })),
    Type: {
        ARRAY: 'ARRAY',
        OBJECT: 'OBJECT',
        STRING: 'STRING'
    }
}));

describe('geminiService', () => {
    beforeEach(() => {
        mockGenerateContent.mockClear();
    });

    it('generatePracticeQuestions requests testCases in prompt', async () => {
        // Mock successful JSON response
        (mockGenerateContent as unknown as jest.Mock<(...args: any[]) => Promise<any>>).mockResolvedValue({
            text: JSON.stringify([{ title: 'Test Q', description: 'Desc', difficulty: 'Easy', topics: [], url: '', testCases: [] }])
        });

        await generatePracticeQuestions(5, 'Hard', ['Arrays'], 'Custom', 'fake-key');

        const callArgs = (mockGenerateContent as unknown as jest.Mock).mock.calls[0][0] as any;
        expect(callArgs.contents).toContain('testCases');
        expect(callArgs.config.responseSchema.items.properties).toHaveProperty('testCases');
    });

    it('generateTestCases returns parsed array', async () => {
        (mockGenerateContent as unknown as jest.Mock<(...args: any[]) => Promise<any>>).mockResolvedValue({
            text: JSON.stringify([{ input: '[1]', expected: '1' }])
        });

        const res = await generateTestCases('Title', 'Desc', 'key');
        expect(res).toHaveLength(1);
        expect(res[0].input).toBe('[1]');
    });
});