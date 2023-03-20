import { updateNodeConfig } from '../../src/pages/admin/library/update-node-config';

describe('Update Node Config', () => {
  test('should do nothing when there is no schema', () => {
    const config = updateNodeConfig('x', null);

    expect(config).toBe('x');
  });

  test('should use the default when nothing is defined', () => {
    const config = updateNodeConfig(undefined, {
      type: 'string',
      default: 'test',
    });

    expect(config).toBe('test');
  });

  test('should replace the false with the default string', () => {
    const config = updateNodeConfig(false, {
      type: 'string',
      default: 'test',
    });

    expect(config).toBe('test');
  });

  test('should keep the false when the schema is a boolean', () => {
    const config = updateNodeConfig(false, {
      type: 'boolean',
      default: true,
    });

    expect(config).toBe(false);
  });

  test('should update the null when the schema is a boolean', () => {
    const config = updateNodeConfig(null, {
      type: 'boolean',
      default: true,
    });

    expect(config).toBe(true);
  });

  test('should update the undefined when the schema is a boolean', () => {
    const config = updateNodeConfig(undefined, {
      type: 'boolean',
      default: false,
    });

    expect(config).toBe(false);
  });

  test('should use the default when the schema type differs even if falsy', () => {
    const config = updateNodeConfig(null, {
      type: 'boolean',
      default: false,
    });

    expect(config).toBe(false);
  });

  test('should create a new object default', () => {
    const config = updateNodeConfig(null, {
      type: 'object',
      properties: {
        alpha: {
          type: 'string',
          default: 'x',
        },
      },
    }) as any;

    expect(config).toStrictEqual({
      alpha: 'x',
    });
  });

  test('should replace bad config type with the new object', () => {
    const config = updateNodeConfig('someoldstring', {
      type: 'object',
      properties: {
        alpha: {
          type: 'string',
          default: 'x',
        },
      },
    }) as any;

    expect(config).toStrictEqual({
      alpha: 'x',
    });
  });

  test('should merge with the new config and keep the old values too', () => {
    const config = updateNodeConfig(
      { beta: 'z' },
      {
        type: 'object',
        properties: {
          alpha: {
            type: 'string',
            default: 'x',
          },
        },
      },
    ) as any;

    expect(config).toStrictEqual({
      beta: 'z',
      alpha: 'x',
    });
  });

  test('should not overide the old config', () => {
    const config = updateNodeConfig(
      { alpha: 'z' },
      {
        type: 'object',
        properties: {
          alpha: {
            type: 'string',
            default: 'x',
          },
        },
      },
    ) as any;

    expect(config).toStrictEqual({
      alpha: 'z',
    });
  });

  test('should leave the old config when it would overwrite with the new ove', () => {
    const config = updateNodeConfig(
      {
        alpha: {
          had: 'this',
        },
      },
      {
        type: 'object',
        properties: {
          alpha: {
            type: 'string',
            default: 'x',
          },
        },
      },
    ) as any;

    expect(config).toStrictEqual({
      alpha: {
        had: 'this',
      },
    });
  });
});
