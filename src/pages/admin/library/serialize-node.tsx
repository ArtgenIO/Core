import { CustomNode } from '../../../api/types/custom-node';
import { INode } from '../../../api/types/node.interface';

export const serializeNode = (element: CustomNode): INode => {
  const serialized: INode = {
    id: element.id,
    type: element.data.type, // Revert to the original type
    config: element.data.config,
    title: element.data.title,
    position: [element.position.x, element.position.y],
  };

  return serialized;
};
