import { Elements } from 'react-flow-renderer';
import { ILogic } from '../interface';
import { unserializeEdge } from './unserialize-edge';
import { unserializeNode } from './unserialize-node';

export const unserializeWorkflow = (workflow: ILogic): Elements => {
  return [
    ...workflow.nodes.map(unserializeNode),
    ...workflow.edges.map(unserializeEdge),
  ];
};
