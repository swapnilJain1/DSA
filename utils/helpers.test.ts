import { describe, it, expect } from '@jest/globals';
import { formatTime, formatTimerDisplay, formatTimeAgo, calculateEfficiency, getDifficultyColor } from './helpers';

describe('Helper Functions', () => {
  describe('formatTime', () => {
    it('formats seconds into readable string', () => {
      expect(formatTime(0)).toBe('0s');
      expect(formatTime(30)).toBe('0m 30s');
      expect(formatTime(60)).toBe('1m 0s');
      expect(formatTime(3600)).toBe('1h 0m');
      expect(formatTime(3665)).toBe('1h 1m');
    });
  });

  describe('formatTimerDisplay', () => {
    it('formats seconds into timer display', () => {
      expect(formatTimerDisplay(0)).toBe('00:00');
      expect(formatTimerDisplay(65)).toBe('01:05');
      expect(formatTimerDisplay(3665)).toBe('1:01:05');
    });
  });

  describe('getDifficultyColor', () => {
    it('returns correct color classes for difficulty', () => {
      expect(getDifficultyColor('Easy')).toContain('emerald');
      expect(getDifficultyColor('Medium')).toContain('amber');
      expect(getDifficultyColor('Hard')).toContain('rose');
    });
  });

  describe('calculateEfficiency', () => {
    it('calculates efficiency grade correctly', () => {
      const easyStd = 900;
      expect(calculateEfficiency('Easy', easyStd / 1.5)?.grade).toBe('Elite');
      expect(calculateEfficiency('Easy', easyStd / 1.0)?.grade).toBe('High');
      expect(calculateEfficiency('Easy', easyStd / 0.5)?.grade).toBe('Avg'); // Slower than standard
    });

    it('returns null if time is 0', () => {
      expect(calculateEfficiency('Easy', 0)).toBeNull();
    });
  });
});