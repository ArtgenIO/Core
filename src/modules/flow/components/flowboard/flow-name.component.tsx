import { EditOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { Dispatch, SetStateAction } from 'react';
import { IFlow } from '../../interface';

type Props = {
  flow: IFlow;
  setFlow: Dispatch<SetStateAction<IFlow>>;
};

export default function FlowboardName({ flow, setFlow }: Props) {
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
            setFlow(oldState => {
              const newState = cloneDeep(oldState);
              newState.name = event.target.value;
              message.info('Flow name changed', 1);

              return newState;
            });
          }}
        />
      </div>
    </div>
  );
}
