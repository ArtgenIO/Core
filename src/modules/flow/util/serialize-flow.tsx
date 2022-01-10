import { Elements, isEdge, isNode } from 'react-flow-renderer';
import { IFlow } from '../interface';
import { serializeEdge } from './serialize-edge';
import { serializeNode } from './serialize-node';

export const serializeFlow = (original: IFlow, elements: Elements): IFlow => {
  const serialized: IFlow = {
    id: original.id,
    name: original.name,
    nodes: elements.filter(isNode).map(serializeNode),
    edges: elements.filter(isEdge).map(serializeEdge),
  };

  return serialized;
};
