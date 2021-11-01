import { CloudDownloadOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import React, { useState } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { useRecoilValue } from 'recoil';
import {
  elementsAtom,
  flowInstanceAtom,
  workflowAtom,
} from '../../atom/drawboard.atoms';
import { ISerializedEdge } from '../../interface/serialized-edge.interface';
import { ISerializedNode } from '../../interface/serialized-node.interface';
import { IWorkflow } from '../../interface/serialized-workflow.interface';

export default function DrawboardDownload() {
  const workflow = useRecoilValue(workflowAtom);
  const elements = useRecoilValue(elementsAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [source, setSource] = useState<string>('');

  const doDownloadWorkflow = () => {
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

    setSource(JSON.stringify(flowState, null, 2));
  };

  return (
    <>
      <div onClick={() => doDownloadWorkflow()} className="rounded-b-md">
        <CloudDownloadOutlined />
        <div>Download as JSON</div>
      </div>
      <Modal
        centered
        width="50%"
        title={
          <>
            <CloudDownloadOutlined /> Serialized Workflow
          </>
        }
        visible={!!source.length}
        closable
        maskClosable
        onCancel={() => setSource('')}
        footer={null}
        destroyOnClose
      >
        <Input.TextArea
          showCount
          readOnly
          defaultValue={source}
          rows={25}
        ></Input.TextArea>
      </Modal>
    </>
  );
}
