import { INode } from '../interface';
import { CustomNode } from '../interface/custom-node';

export const serializeNode = (element: CustomNode): INode => {
  const serialized: INode = {
    id: element.id,
    type: element.data.type, // Revert to the original type
    config: element.data.config,
    label: element.data.label,
    position: [element.position.x, element.position.y],
  };

  return serialized;
};
