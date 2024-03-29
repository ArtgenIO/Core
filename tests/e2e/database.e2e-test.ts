import { IKernel, Kernel } from '@hisorange/kernel';
import cloneDeep from 'lodash.clonedeep';
import { APIModule } from '../../src/api/api.module';
import { DatabaseConnectionService } from '../../src/api/services/database-connection.service';
import { FieldType } from '../../src/api/types/field-type.enum';
import { ISchema } from '../../src/models/schema.interface';

describe('Database E2E', () => {
  let kernel: IKernel;

  beforeAll(async () => {
    kernel = new Kernel();
    kernel.register([APIModule]);

    await kernel.boostrap();
  });

  afterAll(async () => {
    await kernel.stop();
  });

  test.each([
    'simple',
    'enums',
    'commons',
    'texts',
    'textsxl',
    'textsxl2',
    'textsxl3',
    'ints',
  ])('should synchornize the [%s] test schema', async (ref: string) => {
    // Prepare deps
    const connections = await kernel.get(DatabaseConnectionService);
    const connection = connections.findOne('main');
    // Load the test schema
    const subject: ISchema = (await import(`../schemas/${ref}.schema.json`))
      .default;

    // Remove artifacts from previous test if any
    await connection.synchornizer.deleteTable(ref);

    // Run the synchronization
    await connection.associate([subject]);

    // Reset the sync, so we can fail if there is a diff in revert
    connection.associations.get(ref).inSync = false;

    // Resync, should nothing happen
    const changes = await connection.synchornizer.sync();

    expect(changes).toBe(0);
    expect(connection.getModel(ref)).toBeTruthy();
    expect(connection.getSchema(ref).reference).toBe(ref);

    // Add a new int field
    const mod1 = cloneDeep(subject);
    mod1.fields.push({
      title: 'Extra Int',
      reference: 'xtraInt',
      columnName: 'xtra_int',
      defaultValue: 5,
      type: FieldType.INTEGER,
      meta: {},
      args: {},
      tags: [],
    });

    const mod1Changes = await connection.associate([mod1]);
    expect(mod1Changes).toBeGreaterThanOrEqual(1);

    // Add a new text field
    const mod2 = cloneDeep(mod1);
    mod2.fields.push({
      title: 'Extra Text',
      reference: 'xtraTxt',
      columnName: 'xtra_txt',
      defaultValue: 'Haps',
      type: FieldType.TEXT,
      meta: {},
      args: {},
      tags: [],
    });

    const mod2Changes = await connection.associate([mod2]);
    expect(mod2Changes).toBeGreaterThanOrEqual(1);

    // Remove the extra int
    const mod3 = cloneDeep(mod2);
    mod3.fields.splice(mod3.fields.length - 2, 1);

    const mod3Changes = await connection.associate([mod3]);
    expect(mod3Changes).toBeGreaterThanOrEqual(1);

    // Replace the int to text
    const mod4 = cloneDeep(mod3);
    mod4.fields.find(f => f.reference == 'xtraTxt').type = FieldType.STRING;
    mod4.fields.find(f => f.reference == 'xtraTxt').args.length = 52;

    const mod4Changes = await connection.associate([mod4]);
    expect(mod4Changes).toBeGreaterThanOrEqual(1);

    // Clean up
    await connection.synchornizer.deleteTable(ref).catch(e => {});
  });
});
