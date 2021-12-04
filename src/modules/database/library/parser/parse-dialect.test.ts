import { parseDialect } from './parse-dialect';

describe('Dialect Parser', () => {
  test('should be able to find mysql type', async () => {
    expect(parseDialect('mysql://localhost:555')).toBe('mysql');
  });
  test('should be able to find mariadb type', async () => {
    expect(parseDialect('mariadb://localhost:5555')).toBe('mariadb');
  });

  test('should be able to find postgres type', async () => {
    expect(parseDialect('postgres://localhost:555')).toBe('postgres');
    expect(parseDialect('postgresql://localhost:5555')).toBe('postgres');
  });

  test('should be able to match the ephemeral memory database', async () => {
    expect(parseDialect('sqlite::memory:')).toBe('sqlite');
  });

  test('should be to find postgres type', async () => {
    expect(parseDialect('sqlite:./test.db')).toBe('sqlite');
  });

  test('should fail on unknow type', async () => {
    expect(() => parseDialect('wash://localhost:555')).toThrow();
    expect(() => parseDialect('NOTADSN')).toThrow();
  });
});
