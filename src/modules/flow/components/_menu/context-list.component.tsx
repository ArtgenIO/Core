import { EyeInvisibleOutlined } from '@ant-design/icons';
import { Empty, Menu } from 'antd';
import dayjs from 'dayjs';
import React, { Dispatch, SetStateAction } from 'react';
import MenuBlock from '../../../admin/component/menu-block.component';
import { IFlow } from '../../interface';
import { ICapturedContext } from '../../interface/captured-context.interface';

type Props = {
  flow: IFlow;
  capturedContexts: ICapturedContext[];
  setAppliedContext: Dispatch<SetStateAction<ICapturedContext>>;
  setShowExplorer: Dispatch<SetStateAction<boolean>>;
};

export default function ContextListComponent({
  flow,
  capturedContexts,
  setAppliedContext,
  setShowExplorer,
}: Props) {
  return (
    <MenuBlock title="Captured Contexts">
      {flow && (
        <Menu
          className="compact"
          onSelect={info => {
            if (info.selectedKeys.length) {
              setAppliedContext(
                capturedContexts.find(c => c.id == info.selectedKeys[0]),
              );
              setShowExplorer(true);
            } else {
              setAppliedContext(null);
            }
          }}
        >
          {capturedContexts.length ? (
            capturedContexts.map(ctx => (
              <Menu.Item key={ctx.id} icon={<EyeInvisibleOutlined />}>
                <span className="bold text-success-500">
                  {ctx.id.substring(0, 8)}
                </span>{' '}
                {dayjs(ctx.createdAt).format('HH:MM:ss')}
              </Menu.Item>
            ))
          ) : (
            <Empty description="No Context Captured Yet" />
          )}
        </Menu>
      )}
    </MenuBlock>
  );
}
