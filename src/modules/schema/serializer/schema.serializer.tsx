import { Edge, Elements, isNode, Node } from 'react-flow-renderer';
import { ISchema } from '../interface';
import { RelationKind } from '../interface/relation.interface';

let offsetX = 0;

/**
 * Responsible to serialize between schema list state and node/edge elements state.
 */
export class CollectionSerializer {
  static toElements(schemas: ISchema[]): Elements {
    const elements: Elements = [];

    for (const schema of schemas) {
      if (!schema.meta?.artboard?.position) {
        if (!schema.meta.artboard) {
          schema.meta.artboard = {
            position: { x: 0, y: 0 },
          };
        }

        schema.meta.artboard.position = {
          x: offsetX++ * 100 + 100,
          y: offsetX * 50 + 100,
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
        let sourceHandle: string;
        let targetHandle: string;

        switch (relation.kind) {
          case RelationKind.HAS_ONE:
            sourceHandle = 'has-one';
            targetHandle = 'belongs-to-one';
            break;
          case RelationKind.HAS_MANY:
            sourceHandle = 'has-many';
            targetHandle = 'belongs-to-many';
            break;
          case RelationKind.BELONGS_TO_ONE:
            sourceHandle = 'belongs-to-one';
            targetHandle = 'has-one';
            break;
          case RelationKind.BELONGS_TO_MANY:
            sourceHandle = 'belongs-to-many';
            targetHandle = 'has-many';
            break;
        }

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
          animated: !!relation.kind.match('has'),
        };

        elements.push(edge);
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
          if (!schema.meta.artboard) {
            schema.meta.artboard = {
              position: { x: 0, y: 0 },
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
