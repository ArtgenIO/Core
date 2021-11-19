import { ArrowHeadType, Edge } from 'react-flow-renderer';
import { IEdge } from '../interface';

export const unserializeEdge = (serialized: IEdge): Edge => {
  return {
    id: serialized.id,
    source: serialized.sourceNodeId,
    target: serialized.targetNodeId,
    sourceHandle: serialized.sourceHandle,
    targetHandle: serialized.targetHandle,
    type: 'artgen-edge',
    arrowHeadType: ArrowHeadType.ArrowClosed,
    data: {
      transform: serialized.transform ?? '',
    },
  };
};
