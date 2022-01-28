import { EditOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import { useRecoilState } from 'recoil';
import { flowAtom } from '../../atom/artboard.atoms';

export default function FlowNameComponent() {
  const [flow, setFlow] = useRecoilState(flowAtom);

  return (
    <div className="absolute top-3 left-3 z-10 flex">
      <div>
        <EditOutlined className="text-4xl" style={{ lineHeight: '4rem' }} />
      </div>
      <div>
        <Input
          defaultValue={flow ? flow.name : 'Loading...'}
          bordered={false}
          placeholder="Flow name"
          required
          className="text-3xl"
          style={{ lineHeight: '3rem' }}
          onBlur={event => {
            setFlow(wf => {
              if (wf.name != event.target.value) {
                message.info('Flow name changed', 1);
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
