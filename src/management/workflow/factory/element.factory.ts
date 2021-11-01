import * as jsonSchemaInst from 'json-schema-instantiator';
import { kebabCase } from 'lodash';
import { ArrowHeadType, Edge, Elements, Node } from 'react-flow-renderer';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';
import { IWorkflow } from '../interface/serialized-workflow.interface';

export class ElementFactory {
  /**
   * Create new renderable node
   */
  static fromNode(node: ILambdaMeta): Node {
    return {
      id: `${node.type}.${Math.floor(Math.random() * 200) + 10}`,
      type: kebabCase(node.type),
      data: {
        label: node.type,
        config: node.config ? jsonSchemaInst.instantiate(node.config) : null,
        type: node.type,
      },
      position: {
        x: 0,
        y: 0,
      },
    };
  }

  /**
   * Convert the serialized workflow to renderable elements
   */
  static fromWorkflow(workflow: IWorkflow): Elements {
    const elements: Elements = [];

    // Convert nodes
    for (const node of workflow.nodes) {
      const nodeElement: Node = {
        id: node.id,
        data: {
          label: node.type,
          config: node.config,
          type: node.type,
        },
        position: {
          x: node.position[0],
          y: node.position[1],
        },
        type: kebabCase(node.type),
      };

      elements.push(nodeElement);
    }

    // Convert edges
    for (const edge of workflow.edges) {
      const edgeElement: Edge = {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'cedge',
        arrowHeadType: ArrowHeadType.ArrowClosed,
        data: {
          transform: edge.transform ?? '',
        },
      };

      elements.push(edgeElement);
    }

    return elements;
  }
}
