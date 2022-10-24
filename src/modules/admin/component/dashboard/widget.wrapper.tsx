import {
  CopyOutlined,
  DeleteOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, Input, message, Popconfirm } from 'antd';
import { useState } from 'react';
import { IDashGridElement } from '../../interface/dash-grid.interface';
import { WidgetMap } from './widget.map';

type Props = {
  id: string;
  widget: IDashGridElement['widget'];
  onDelete: () => void;
  onChange: (widget: IDashGridElement['widget']) => void;
};

export default function WidgetWrapperComponent({
  id,
  widget,
  onDelete,
  onChange,
}: Props) {
  const WidgetRef = WidgetMap.get(widget.id);
  const [openConfig, setOpenConfig] = useState(false);

  return (
    <div className="widget-box" style={{ borderWidth: '1px' }}>
      <div className="widget-header">
        <div className="flex">
          <div className="grow">
            <Input
              value={widget.header}
              className="text-center text-lg p-0 text-white"
              bordered={false}
              onChange={e =>
                onChange({
                  ...widget,
                  header: e.target.value.toString(),
                })
              }
            />
          </div>
          <div className="shrink pr-2 pt-0.5">
            <Button.Group size="small">
              <Button
                icon={<SwapOutlined />}
                onClick={() => message.info('Not implemented')}
                className="hover:text-info-500 hover:border-info-500"
              />

              <Button
                icon={<CopyOutlined />}
                onClick={() => message.info('Not implemented')}
                className="hover:text-info-500 hover:border-info-500"
              />

              <Button
                icon={<SettingOutlined />}
                onClick={() => setOpenConfig(true)}
                disabled={openConfig}
                className="hover:text-info-500 hover:border-info-500"
              />

              <Popconfirm
                title="Are you sure you want to delete this widget?"
                onConfirm={() => onDelete()}
                placement="bottom"
                showArrow
                okButtonProps={{ danger: true }}
              >
                <Button
                  icon={<DeleteOutlined />}
                  className="hover:text-error-500 hover:border-error-500"
                />
              </Popconfirm>
            </Button.Group>
          </div>
        </div>
      </div>

      <div className="bg-midnight-700" style={{ height: 'calc(100% - 44px)' }}>
        <WidgetRef.element
          id={id}
          header={widget.header}
          config={widget?.config || {}}
          openConfig={openConfig}
          setOpenConfig={setOpenConfig}
        />
      </div>

      <div className="bg-midnight-800 h-3 rounded-b-md"></div>
    </div>
  );
}
