import { Elements, isEdge, isNode } from 'react-flow-renderer';
import { IWorkflow } from '../interface';
import { serializeEdge } from './serialize-edge';
import { serializeNode } from './serialize-node';

export const serializeWorkflow = (
  original: IWorkflow,
  elements: Elements,
): IWorkflow => {
  const serialized: IWorkflow = {
    id: original.id,
    name: original.name,
    nodes: elements.filter(isNode).map(serializeNode),
    edges: elements.filter(isEdge).map(serializeEdge),
  };

  return serialized;
};
