import { Problem } from './types';

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    defaultCode: `function twoSum(nums, target) {
  // Write your solution here
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
    functionName: 'twoSum',
    examples: [
      { 
        id: 'ex1',
        inputText: 'nums = [2,7,11,15], target = 9', 
        outputText: '[0,1]',
        args: [[2,7,11,15], 9],
        expected: [0,1]
      },
      { 
        id: 'ex2',
        inputText: 'nums = [3,2,4], target = 6', 
        outputText: '[1,2]',
        args: [[3,2,4], 6],
        expected: [1,2]
      },
    ]
  },
  {
    id: '2',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.
    
*Note: For this runner, lists are represented as arrays.*`,
    defaultCode: `function reverseList(head) {
  let prev = null;
  let current = head;
  // Note: This environment treats 'head' as an array for simplicity in this demo
  return head.reverse(); 
}`,
    functionName: 'reverseList',
    examples: [
      { 
        id: 'ex1',
        inputText: 'head = [1,2,3,4,5]', 
        outputText: '[5,4,3,2,1]',
        args: [[1,2,3,4,5]],
        expected: [5,4,3,2,1]
      },
    ]
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'String',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    defaultCode: `function lengthOfLongestSubstring(s) {
  let max = 0;
  let current = '';
  // Implementation placeholder
  return s.length > 0 ? 1 : 0; 
}`,
    functionName: 'lengthOfLongestSubstring',
    examples: [
      { 
        id: 'ex1',
        inputText: 's = "abcabcbb"', 
        outputText: '3', 
        explanation: 'The answer is "abc", with the length of 3.',
        args: ["abcabcbb"],
        expected: 3
      },
    ]
  }
];

export const INITIAL_COMPLEXITY_DATA = [
  { n: 1, steps: 1 },
  { n: 5, steps: 5 },
  { n: 10, steps: 10 },
  { n: 20, steps: 20 },
  { n: 50, steps: 50 },
  { n: 100, steps: 100 },
];