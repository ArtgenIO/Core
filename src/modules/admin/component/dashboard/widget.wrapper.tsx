import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm } from 'antd';
import { lazy } from 'react';
import { IDashGridElement } from '../../interface/dash-grid.interface';

const WidgetMap = {
  'telemetry.http-requests': lazy(
    () => import('../../../telemetry/component/http-requests.widget'),
  ),
  'telemetry.db-query': lazy(
    () => import('../../../telemetry/component/db-query.widget'),
  ),
  'telemetry.uptime': lazy(
    () => import('../../../telemetry/component/uptime.widget'),
  ),
  'flow.executions': lazy(
    () => import('../../../flow/components/widget/execution.widget'),
  ),
};

type Props = {
  widget: IDashGridElement['widget'];
  onDeleteWidget: () => void;
};

export default function WidgetWrapperComponent({
  widget,
  onDeleteWidget,
}: Props) {
  const Widget = WidgetMap[widget.id];

  return (
    <div className="widget-box" style={{ borderWidth: '1px' }}>
      <div className="widget-header">
        <div className="flex">
          <div className="grow">{widget.header}</div>
          <div className="shrink pr-2 pt-0.5">
            <Button.Group size="small">
              <Button
                icon={<SettingOutlined />}
                onClick={() => message.info('Not implemented')}
                className="hover:text-info-500 hover:border-info-500"
              />

              <Popconfirm
                title="Are you sure you want to delete this widget?"
                onConfirm={() => onDeleteWidget()}
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
        <Widget />
      </div>

      <div className="bg-midnight-800 h-3 rounded-b-md"></div>
    </div>
  );
}
