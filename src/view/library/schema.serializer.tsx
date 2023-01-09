import cloneDeep from 'lodash.clonedeep';
import { Edge, isNode, Node } from 'reactflow';
import { ISchema } from '../../models/schema.interface';
import { Elements } from '../../types/elements.interface';

/**
 * Responsible to serialize between schema list state and node/edge elements state.
 */
export class SchemaSerializer {
  static toElements(schemas: ISchema[]): Elements<{ schema: ISchema }> {
    const elements: Elements = [];

    for (const s of schemas) {
      const schema = cloneDeep(s);

      if (schema?.meta) {
        schema.meta = {};
      }

      if (!schema.meta?.artboard?.position) {
        if (!schema.meta?.artboard) {
          schema.meta = {
            ...schema.meta,
            artboard: {
              position: { x: 0, y: 0 },
            },
          };
        }

        schema.meta.artboard.position = {
          x: 0,
          y: 0,
        };
      }

      const nodeID: string = schema.reference;
      const node: Node = {
        id: nodeID,
        type: 'schema',
        position: schema.meta.artboard.position,
        data: {
          schema,
        },
      };

      elements.push(node);

      for (const relation of schema.relations) {
        if (relation.kind.match('belong')) {
          let sourceHandle: string = `sh-${relation.localField}`;
          let targetHandle: string = `th-${relation.remoteField}`;

          const edge: Edge = {
            id: `${nodeID}.relation.${relation.name}`,
            type: 'smoothstep',
            source: nodeID,
            target: relation.target,
            sourceHandle,
            targetHandle,
            data: {
              relation,
            },

            animated: !!relation.kind.match('one'),
          };

          elements.push(edge);
        }
      }
    }

    return elements;
  }

  static fromElements(elements: Elements<{ schema: ISchema }>): ISchema[] {
    const schemas: ISchema[] = [];

    for (const element of elements) {
      if (isNode(element)) {
        const schema = element.data.schema;

        if (!schema.meta?.artboard?.position) {
          if (!schema.meta?.artboard) {
            schema.meta = {
              ...schema.meta,
              artboard: {
                position: { x: 0, y: 0 },
              },
            };
          }

          schema.meta.artboard = { position: { x: 0, y: 0 } };
        }

        // Keep the position meta.
        schema.meta.artboard.position = element.position;

        schemas.push(schema);
      }
    }

    return schemas;
  }
}
