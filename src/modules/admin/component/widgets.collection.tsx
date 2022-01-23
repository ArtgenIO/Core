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
};

type Props = {
  widget: IDashGridElement['widget'];
};

export default function RenderWidgetComponent({ widget }: Props) {
  const Widget = Widgets[widget.id];

  return (
    <div
      className="h-full border-midnight-600 border-solid rounded-md"
      style={{ borderWidth: '1px' }}
    >
      <div className="bg-midnight-800 rounded-t-md font-header text-lg indent-4 py-1 text-midnight-50 h-8">
        {widget.header}
      </div>

      <div className="bg-midnight-700" style={{ height: 'calc(100% - 44px)' }}>
        <Widget />
      </div>

      <div className="bg-midnight-800 h-3 rounded-b-md"></div>
    </div>
  );
}
