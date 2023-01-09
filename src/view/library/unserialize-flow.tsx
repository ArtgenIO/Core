import { Elements } from '../../types/elements.interface';
import { IFlow } from '../../types/flow.interface';
import { unserializeEdge } from './unserialize-edge';
import { unserializeNode } from './unserialize-node';

export const unserializeFlow = (flow: IFlow): Elements => {
  return [
    ...flow.nodes.map(unserializeNode),
    ...flow.edges.map(unserializeEdge),
  ];
};
