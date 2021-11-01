import { SaveOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import axios from 'axios';
import React from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  flowInstanceAtom,
  workflowAtom,
  workflowChangedAtom,
} from '../../atom/drawboard.atoms';
import { ISerializedEdge } from '../../interface/serialized-edge.interface';
import { ISerializedNode } from '../../interface/serialized-node.interface';
import { IWorkflow } from '../../interface/serialized-workflow.interface';

const SAVING_NOTIFICATION = 'saving-workflow';

export default function DrawboardSave() {
  const [workflow, setWorkflow] = useRecoilState(workflowAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [isWorkflowChanged, setIsWorkflowChanged] =
    useRecoilState(workflowChangedAtom);

  const doSaveWorkflow = () => {
    const flowState: IWorkflow = {
      id: workflow.id,
      name: workflow.name,
      nodes: [],
      edges: [],
    };

    for (const element of flowInstance.getElements()) {
      const keys = Object.keys(element);

      // Edge element
      if (keys.includes('source')) {
        const edge = element as Edge;

        const newEdge: ISerializedEdge = {
          id: edge.id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          transform: edge.data?.transform ?? '',
        };

        flowState.edges.push(newEdge);
      }
      // Node element
      else {
        const node = element as Node;
        const newNode: ISerializedNode = {
          id: node.id,
          type: node.data.type,
          position: [node.position.x, node.position.y],
          config: node.data?.config ?? {},
        };

        flowState.nodes.push(newNode);
      }
    }

    axios
      .patch(`/api/workflow/${workflow.id}`, flowState)
      .then(() => {
        notification.success({
          key: SAVING_NOTIFICATION,
          message: 'Saved successfully!',
          placement: 'bottomRight',
        });

        setIsWorkflowChanged(false);
      })
      .catch(error => {
        notification.error({
          key: SAVING_NOTIFICATION,
          message: 'Could not save workflow!',
          description: error.message,
          placement: 'bottomRight',
        });
      });
  };

  return (
    <div
      onClick={() => doSaveWorkflow()}
      className={isWorkflowChanged ? 'text-yellow-500' : ''}
    >
      <SaveOutlined />
      <div>Save Changes</div>
    </div>
  );
}
