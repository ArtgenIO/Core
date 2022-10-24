import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
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
          <div className="shrink pr-2">
            <Popconfirm
              title="Are you sure you want to delete this widget?"
              onConfirm={() => onDeleteWidget()}
              placement="bottom"
              showArrow
              okButtonProps={{ danger: true }}
            >
              <Button
                icon={<DeleteOutlined />}
                className="hover:text-red-500 hover:border-red-500"
                size="small"
              />
            </Popconfirm>
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
