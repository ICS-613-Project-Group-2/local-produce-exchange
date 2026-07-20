import { describe, it, expect } from 'vitest';
import { displayName } from '@/data/utils';

describe('displayName', () => {                                    // Test Suite

  it('must abbreviate a standard two-part name', () => {            // Test Case
    const result = displayName('Oliver Lee');

    expect(result).toBe('Oliver L.');
  });

  it('must abbreviate a name with a hyphenated first name', () => {
    const result = displayName('Kayla-Marie Torres');

    expect(result).toBe('Kayla-Marie T.');
  });

  it('must return the name unchanged when there is only one part', () => {
    const result = displayName('Cher');

    expect(result).toBe('Cher');
  });

  it('must use the last part as the initial when there are more than two parts', () => {
    const result = displayName('Mary Jane Watson');

    expect(result).toBe('Mary W.');
  });

  it('must handle extra leading/trailing whitespace', () => {
    const result = displayName('  Lily Chen  ');

    expect(result).toBe('Lily C.');
  });

  it('must return an empty string unchanged', () => {
    const result = displayName('');

    expect(result).toBe('');
  });
});