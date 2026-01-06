import { TestCase, TestResult } from '../types';

export const executeCode = (code: string, testCases: TestCase[]): TestResult[] => {
  if (!code.trim()) {
    return [];
  }

  if (!testCases || testCases.length === 0) {
    return [{
      passed: false,
      input: '-',
      error: 'No test cases defined.'
    }];
  }

  // 1. Extract function name to call
  const functionMatch = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  const constMatch = code.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function|\(.*\)\s*=>)/);
  
  const funcName = functionMatch ? functionMatch[1] : constMatch ? constMatch[1] : null;

  if (!funcName) {
    return testCases.map(tc => ({
      passed: false,
      input: tc.input,
      error: "Could not identify function name. Please use 'function name() {}' or 'const name = () => {}' syntax."
    }));
  }

  try {
    // 2. Create the function within a new scope
    const wrappedCode = `
      ${code}
      return ${funcName};
    `;
    
    // eslint-disable-next-line no-new-func
    const userFn = new Function(wrappedCode)();

    if (typeof userFn !== 'function') {
        throw new Error(`${funcName} is not a function.`);
    }

    // 3. Run each test case
    return testCases.map(tc => {
      try {
        let args;
        try {
            args = JSON.parse(tc.input);
        } catch (e) {
             return {
                passed: false,
                input: tc.input,
                error: "Input must be valid JSON array of arguments (e.g. [[1,2], 3])"
             };
        }

        // Heuristic: Handle common user mistake of not wrapping single array argument in outer array
        if (Array.isArray(args) && userFn.length === 1 && args.length !== 1) {
             args = [args];
        } else if (!Array.isArray(args)) {
            // If user provided a primitive (e.g. 5), wrap it in args array -> [5]
            args = [args];
        }

        let expected;
        try {
            expected = JSON.parse(tc.expected);
        } catch (e) {
             return {
                passed: false,
                input: tc.input,
                error: "Expected output must be valid JSON"
             };
        }
        
        // Execute
        const result = userFn(...args);
        
        // Compare
        const resultStr = JSON.stringify(result);
        const expectedStr = JSON.stringify(expected);
        const passed = resultStr === expectedStr;

        return {
          passed,
          input: tc.input,
          expected: expectedStr,
          actual: resultStr !== undefined ? resultStr : "undefined",
        };

      } catch (err: any) {
        return {
          passed: false,
          input: tc.input,
          error: err.message || "Runtime Error"
        };
      }
    });

  } catch (err: any) {
    return testCases.map(tc => ({
      passed: false,
      input: tc.input,
      error: "Syntax/Compilation Error: " + err.message
    }));
  }
};