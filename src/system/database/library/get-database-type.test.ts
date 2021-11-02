import { getDatabaseTypeFromUrl } from './get-database-type';

describe('ConnectionService', () => {
  describe('Database Type Parser', () => {
    test('should be able to find mongodb type', async () => {
      expect(getDatabaseTypeFromUrl('mongodb://localhost:5432')).toBe(
        'mongodb',
      );
      expect(getDatabaseTypeFromUrl('mongodb+srv://localhost:5432')).toBe(
        'mongodb',
      );
    });

    test('should be able to find mysql type', async () => {
      expect(getDatabaseTypeFromUrl('mysql://localhost:555')).toBe('mysql');
      expect(getDatabaseTypeFromUrl('mariadb://localhost:5555')).toBe('mysql');
    });

    test('should be able to find postgres type', async () => {
      expect(getDatabaseTypeFromUrl('postgres://localhost:555')).toBe(
        'postgres',
      );
      expect(getDatabaseTypeFromUrl('postgresql://localhost:5555')).toBe(
        'postgres',
      );
    });

    test('should fail on unknow type', async () => {
      expect(() => getDatabaseTypeFromUrl('wash://localhost:555')).toThrow();
      expect(() => getDatabaseTypeFromUrl('NOTAURL')).toThrow();
    });
  });
});
