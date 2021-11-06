import { createLogger } from 'winston';
import { SchemaModule } from '../../../content/schema/schema.module';
import { EventModule } from '../../event/event.module';
import { IKernel, Kernel } from '../../kernel';
import { DatabaseModule } from '../database.module';
import { DatabaseService } from './database.service';

describe(DatabaseService.name, () => {
  let app: IKernel;

  beforeEach(() => {
    Kernel.prototype['createLogger'] = createLogger;
    app = new Kernel();
    app.bootstrap([DatabaseModule, SchemaModule, EventModule]);
  });

  describe('Database Type Parser', () => {
    test('should be able to find mysql type', async () => {
      const svc = await app.context.get<DatabaseService>(DatabaseService.name);

      expect(svc.getTypeFromDSN('mysql://localhost:555')).toBe('mysql');
      expect(svc.getTypeFromDSN('mariadb://localhost:5555')).toBe('mysql');
    });

    test('should be able to find postgres type', async () => {
      const svc = await app.context.get<DatabaseService>(DatabaseService.name);

      expect(svc.getTypeFromDSN('postgres://localhost:555')).toBe('postgres');
      expect(svc.getTypeFromDSN('postgresql://localhost:5555')).toBe(
        'postgres',
      );
    });

    test('should be able to match the ephemeral memory database', async () => {
      const svc = await app.context.get<DatabaseService>(DatabaseService.name);

      expect(svc.getTypeFromDSN('sqlite::memory:')).toBe('sqlite');
    });

    test('should fail on unknow type', async () => {
      const svc = await app.context.get<DatabaseService>(DatabaseService.name);

      expect(() => svc.getTypeFromDSN('wash://localhost:555')).toThrow();
      expect(() => svc.getTypeFromDSN('NOTADSN')).toThrow();
    });
  });
});
