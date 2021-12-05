import { Elements, isEdge, isNode } from 'react-flow-renderer';
import { ILogic } from '../interface';
import { serializeEdge } from './serialize-edge';
import { serializeNode } from './serialize-node';

export const serializeWorkflow = (
  original: ILogic,
  elements: Elements,
): ILogic => {
  const serialized: ILogic = {
    id: original.id,
    name: original.name,
    nodes: elements.filter(isNode).map(serializeNode),
    edges: elements.filter(isEdge).map(serializeEdge),
  };

  return serialized;
};
