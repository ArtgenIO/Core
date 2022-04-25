import { IFlow } from '../interface';
import { Elements } from '../interface/elements.interface';
import { unserializeEdge } from './unserialize-edge';
import { unserializeNode } from './unserialize-node';

export const unserializeFlow = (flow: IFlow): Elements => {
  return [
    ...flow.nodes.map(unserializeNode),
    ...flow.edges.map(unserializeEdge),
  ];
};
