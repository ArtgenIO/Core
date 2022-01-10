import { Elements } from 'react-flow-renderer';
import { IFlow } from '../interface';
import { unserializeEdge } from './unserialize-edge';
import { unserializeNode } from './unserialize-node';

export const unserializeFlow = (flow: IFlow): Elements => {
  return [
    ...flow.nodes.map(unserializeNode),
    ...flow.edges.map(unserializeEdge),
  ];
};
