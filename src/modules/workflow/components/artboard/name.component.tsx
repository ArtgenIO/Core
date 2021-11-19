import { EditOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import React from 'react';
import { useRecoilState } from 'recoil';
import { workflowAtom } from '../../atom/artboard.atoms';

export default function WorkflowNameComponent() {
  const [workflow, setWorkflow] = useRecoilState(workflowAtom);

  return (
    <div className="absolute top-3 left-3 z-10 flex">
      <div>
        <EditOutlined className="text-4xl" style={{ lineHeight: '4rem' }} />
      </div>
      <div>
        <Input
          defaultValue={workflow ? workflow.name : 'Loading...'}
          bordered={false}
          placeholder="Workflow name"
          required
          className="text-3xl"
          style={{ lineHeight: '3rem' }}
          onBlur={event => {
            setWorkflow(wf => {
              if (wf.name != event.target.value) {
                message.info('Workflow name changed', 1);
              } else {
                return wf;
              }

              const newWf = {
                id: wf.id,
                name: event.target.value,
                nodes: wf.nodes,
                edges: wf.edges,
              };

              return newWf;
            });
          }}
        />
      </div>
    </div>
  );
}
