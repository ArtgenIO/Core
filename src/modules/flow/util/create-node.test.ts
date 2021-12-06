import { kebabCase } from 'lodash';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';
import { CustomNode } from '../interface/custom-node';
import { createNode } from './create-node';

describe('Workflow Node Creator', () => {
  test('should create a node from a lambda meta', () => {
    const meta: ILambdaMeta = {
      type: 'test.node',
      description: 'test',
      handles: [],
      config: null,
      icon: null,
    };

    const node = createNode(meta, []);

    expect(node).toBeTruthy();
    expect(typeof node).toBe('object');
    expect(node).toHaveProperty('id');
    expect(node).toHaveProperty('type');
    expect(node).toHaveProperty('data');
    expect(node).toHaveProperty('position');
    expect(node).toHaveProperty('position.x');
    expect(node).toHaveProperty('position.y');

    expect(node.id).toBe('test.node.1');
    expect(node.type).toBe(kebabCase(meta.type));
    expect(node.data.config).toBe(null);

    expect(node.position.x).toBe(0);
    expect(node.position.y).toBe(0);
  });

  test('should use the smallest available ID', () => {
    const meta: ILambdaMeta = {
      type: 'test.node',
      description: 'test',
      handles: [],
      config: null,
      icon: null,
    };

    const node = createNode(meta, [
      { id: 'test.node.1' } as CustomNode,
      { id: 'test.node.2' } as CustomNode,
      { id: 'test.node.4' } as CustomNode,
    ]);

    expect(node.id).toBe('test.node.3');
  });

  test('should create a config with default values', () => {
    const meta: ILambdaMeta = {
      type: 'test.node',
      description: 'test',
      handles: [],
      config: {
        type: 'object',
        properties: {
          alpha: {
            enum: ['a', 'b', 'c'],
            default: 'b',
          },
        },
      },
      icon: null,
    };

    const node = createNode(meta, []);

    expect(node).toHaveProperty('data.config');
    expect(node).toHaveProperty('data.config.alpha');
    expect((node.data.config as { alpha: string }).alpha).toBe('b');
  });
});
