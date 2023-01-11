import kebabCase from 'lodash.kebabcase';
import startCase from 'lodash.startcase';
import { CustomNode } from '../../../api/types/custom-node';
import { INode } from '../../../api/types/node.interface';

export const unserializeNode = (serialized: INode): CustomNode => {
  const node: CustomNode = {
    id: serialized.id,
    type: kebabCase(serialized.type),
    data: {
      title: serialized.title ?? startCase(serialized.id),
      config: serialized.config,
      type: serialized.type,
    },
    position: {
      x: serialized.position[0],
      y: serialized.position[1],
    },
  };

  return node;
};
