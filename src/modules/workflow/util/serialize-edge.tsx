import { Edge } from 'react-flow-renderer';
import { IEdge } from '../interface';

export const serializeEdge = (element: Edge): IEdge => {
  const serialized: IEdge = {
    id: element.id,
    sourceNodeId: element.source,
    targetNodeId: element.target,
    sourceHandle: element.sourceHandle,
    targetHandle: element.targetHandle,
    transform: element.data.transform,
  };

  return serialized;
};
