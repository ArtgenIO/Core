import { kebabCase, startCase } from 'lodash';
import { INode } from '../interface';
import { CustomNode } from '../interface/custom-node';

export const unserializeNode = (serialized: INode): CustomNode => {
  const node: CustomNode = {
    id: serialized.id,
    type: kebabCase(serialized.type),
    data: {
      label: serialized.label ?? startCase(serialized.id),
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
