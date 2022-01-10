import { getErrorMessage } from '..';
import { Exception } from '../../exceptions/exception';

describe('Extract Error', () => {
  test('should extract from the Error class', () => {
    const e = new Error('abc');

    expect(getErrorMessage(e)).toBe('abc');
  });

  test('should extract from the Exception class', () => {
    const e = new Exception('abc', {});

    expect(getErrorMessage(e)).toBe('abc');
  });

  test('should extract from string throw', () => {
    try {
      throw 'abc';
    } catch (e) {
      expect(getErrorMessage(e)).toBe('abc');
    }
  });

  test('should extract from Error throw', () => {
    try {
      throw new Error('abc');
    } catch (e) {
      expect(getErrorMessage(e)).toBe('abc');
    }
  });
});
