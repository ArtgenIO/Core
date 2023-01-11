import { Edge, MarkerType } from 'reactflow';
import { IEdge } from '../../../api/types/edge.interface';

export const unserializeEdge = (serialized: IEdge): Edge => {
  return {
    id: serialized.id,
    source: serialized.sourceNodeId,
    target: serialized.targetNodeId,
    sourceHandle: serialized.sourceHandle,
    targetHandle: serialized.targetHandle,
    type: 'artgen-edge',
    markerEnd: MarkerType.ArrowClosed,
    data: {
      transform: serialized.transform ?? '',
    },
  };
};
