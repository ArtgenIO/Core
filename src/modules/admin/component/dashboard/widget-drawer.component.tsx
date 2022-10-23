import { PlusSquareOutlined } from '@ant-design/icons';
import { Button, Drawer, List } from 'antd';
import { IDashGridElement } from '../../interface/dash-grid.interface';

type Props = {
  onClose: () => void;
  onAdd: (widget: Omit<IDashGridElement, 'i' | 'x' | 'y'>) => void;
};

const widgets: Omit<IDashGridElement, 'i' | 'x' | 'y'>[] = [
  {
    w: 8,
    h: 4,
    minW: 4,
    minH: 2,
    widget: {
      id: 'telemetry.http-requests',
      header: 'Telemetry - HTTP Proxy Request',
    },
  },
  {
    w: 8,
    h: 4,
    minW: 4,
    minH: 2,
    widget: {
      id: 'telemetry.db-query',
      header: 'Telemetry - Database Queries',
    },
  },
  {
    w: 3,
    h: 3,
    minW: 3,
    minH: 3,
    widget: {
      id: 'telemetry.uptime',
      header: 'Telemetry - Uptime',
    },
  },
  {
    w: 7,
    h: 4,
    minW: 4,
    minH: 2,
    widget: {
      id: 'flow.executions',
      header: 'Flow - Executions',
    },
  },
];

export default function WidgetDrawerComponent({ onClose, onAdd }: Props) {
  return (
    <Drawer width={420} visible title="Widgets" onClose={onClose}>
      <List
        size="small"
        bordered
        dataSource={widgets}
        renderItem={row => (
          <List.Item
            key={row.widget.id}
            actions={[
              <Button
                onClick={() => onAdd(row)}
                icon={<PlusSquareOutlined />}
                className="text-midnight-300 border-success-400"
              ></Button>,
            ]}
          >
            <List.Item.Meta title={row.widget.header} />
          </List.Item>
        )}
      ></List>
    </Drawer>
  );
}
