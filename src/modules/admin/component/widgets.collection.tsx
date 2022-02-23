import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { lazy } from 'react';
import { IDashGridElement } from '../interface/dash-grid.interface';

const Widgets = {
  'telemetry.http-requests': lazy(
    () => import('../../telemetry/component/http-requests.widget'),
  ),
  'telemetry.db-query': lazy(
    () => import('../../telemetry/component/db-query.widget'),
  ),
  'telemetry.uptime': lazy(
    () => import('../../telemetry/component/uptime.widget'),
  ),
  'flow.executions': lazy(
    () => import('../../flow/components/widget/execution.widget'),
  ),
};

type Props = {
  widget: IDashGridElement['widget'];
  onDeleteWidget: () => void;
};

export default function RenderWidgetComponent({
  widget,
  onDeleteWidget,
}: Props) {
  const Widget = Widgets[widget.id];

  return (
    <div
      className="h-full border-midnight-600 border-solid rounded-md"
      style={{ borderWidth: '1px' }}
    >
      <div className="bg-midnight-800 rounded-t-md font-header text-lg leading-8 text-midnight-50 h-8">
        <div className="flex">
          <div className="grow">{widget.header}</div>
          <div className="shrink pr-2">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => onDeleteWidget()}
              className="hover:text-red-500 hover:border-red-500"
              size="small"
            />
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
