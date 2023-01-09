import { isEdge, isNode } from 'reactflow';
import { Elements } from '../../types/elements.interface';
import { IFlow } from '../../types/flow.interface';
import { serializeEdge } from './serialize-edge';
import { serializeNode } from './serialize-node';

export const serializeFlow = (original: IFlow, elements: Elements): IFlow => {
  const serialized: IFlow = {
    id: original.id,
    name: original.name,
    nodes: elements.filter(isNode).map(serializeNode),
    edges: elements.filter(isEdge).map(serializeEdge),
    captureContext: original.captureContext,
    isActive: original.isActive,
  };

  return serialized;
};
