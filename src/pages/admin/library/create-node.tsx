import kebabCase from 'lodash.kebabcase';
import startCase from 'lodash.startcase';
import { CustomNode } from '../../../api/types/custom-node';
import { Elements } from '../../../api/types/elements.interface';
import { ILambdaMeta } from '../../../api/types/meta.interface';
import { updateNodeConfig } from './update-node-config';

export const createNode = (
  meta: ILambdaMeta,
  elements: Elements,
): CustomNode => {
  const elementIDs = elements.map(e => e.id);
  let nth = 0;

  // Find the smallest possible free node ID
  while (++nth) {
    if (!elementIDs.includes(`${meta.type}.${nth}`)) {
      break;
    }

    if (nth > 1_000) {
      throw new Error(
        `Cannot create node [${meta.type}] the ID matcher is looping!`,
      );
    }
  }

  const product: CustomNode = {
    id: `${meta.type}.${nth}`,
    type: kebabCase(meta.type),
    data: {
      title: startCase(`${meta.type}.${nth}`),
      config: updateNodeConfig(null, meta?.config),
      type: meta.type,
    },
    position: {
      x: 0,
      y: 0,
    },
  };

  return product;
};
