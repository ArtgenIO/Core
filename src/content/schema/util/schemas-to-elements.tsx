import { Edge, Elements, Node } from 'react-flow-renderer';
import { ISchema } from '..';
import { RelationKind } from '../interface/relation.interface';

let offsetX = 0;

export const schemasToElements = (schemas: ISchema[]): Elements => {
  const elements: Elements = [];

  for (const schema of schemas) {
    const nodeID: string = schema.reference;
    const node: Node = {
      id: nodeID,
      type: 'schema',
      position: {
        x: offsetX++ * 100 + 100,
        y: offsetX * 50 + 100,
      },
      data: {
        label: schema.label,
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
        case RelationKind.MANY_TO_MANY:
          sourceHandle = 'belongs-to-many';
          targetHandle = 'has-many';
          break;
      }

      const edge: Edge = {
        id: `${nodeID}.relation.${relation.name}`,
        source: nodeID,
        target: relation.target,
        sourceHandle,
        targetHandle,
        data: {
          relation,
        },
      };

      elements.push(edge);
    }
  }

  return elements;
};
