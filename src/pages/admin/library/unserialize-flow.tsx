import { Elements } from '../../../api/types/elements.interface';
import { IFlow } from '../../../api/types/flow.interface';
import { unserializeEdge } from './unserialize-edge';
import { unserializeNode } from './unserialize-node';

export const unserializeFlow = (flow: IFlow): Elements => {
  return [
    ...flow.nodes.map(unserializeNode),
    ...flow.edges.map(unserializeEdge),
  ];
};
