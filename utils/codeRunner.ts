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
  // Regex looks for "function name(" or "const name =" or "let name ="
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
    // We append a return statement to get the function object out of the string
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
        // Parse input: assume input is a JSON string representing the arguments array
        // e.g. "[[2,7], 9]" -> args = [[2,7], 9]
        let args;
        try {
            args = JSON.parse(tc.input);
            if (!Array.isArray(args)) {
                // If user didn't provide array wrapper, wrap it? 
                // Strict mode: assume inputs are array of args
                // Fallback: if it's not array, wrap it
                args = [args];
            }
        } catch (e) {
            // Fallback for simple inputs that aren't valid JSON (like raw strings without quotes)
            // This is risky, but user might type: 5 instead of [5]
            // We'll treat it as string if parsing fails, but really we want JSON.
             return {
                passed: false,
                input: tc.input,
                error: "Input must be valid JSON array of arguments (e.g. [[1,2], 3])"
             };
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
        // We use JSON.stringify for deep comparison of arrays/objects
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