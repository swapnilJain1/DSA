import { describe, it, expect } from '@jest/globals';
import { executeCode } from './codeRunner';
import { TestCase } from '../types';

describe('codeRunner Utility', () => {
    const testCases: TestCase[] = [
        { input: '[1, 2]', expected: '3' },
        { input: '[5, 5]', expected: '10' }
    ];

    it('executes valid function correctly', () => {
        const code = `
            function add(a, b) {
                return a + b;
            }
        `;
        const results = executeCode(code, testCases);
        expect(results).toHaveLength(2);
        expect(results[0].passed).toBe(true);
        expect(results[0].actual).toBe('3');
        expect(results[1].passed).toBe(true);
    });

    it('handles arrow functions stored in variables', () => {
        const code = `
            const add = (a, b) => a + b;
        `;
        const results = executeCode(code, testCases);
        expect(results[0].passed).toBe(true);
    });

    it('reports failure when actual != expected', () => {
        const code = `function add(a, b) { return 0; }`; // Wrong logic
        const results = executeCode(code, testCases);
        expect(results[0].passed).toBe(false);
        expect(results[0].actual).toBe('0');
    });

    it('catches syntax errors gracefully', () => {
        const code = `function broken( { return `; // Syntax error
        const results = executeCode(code, testCases);
        expect(results[0].passed).toBe(false);
        expect(results[0].error).toContain('Syntax');
    });

    it('handles missing test cases gracefully', () => {
        const results = executeCode('function f(){}', []);
        expect(results[0].passed).toBe(false);
        expect(results[0].error).toContain('No test cases');
    });

    it('handles complex object inputs', () => {
        const objectTC: TestCase[] = [
            { input: '[[1,2], [3,4]]', expected: '[1,2,3,4]' }
        ];
        const code = `function merge(a, b) { return [...a, ...b]; }`;
        const results = executeCode(code, objectTC);
        expect(results[0].passed).toBe(true);
    });
});