import { PlusSquareOutlined } from '@ant-design/icons';
import { Button, Drawer, List } from 'antd';
import { IDashGridElement } from '../../interface/dash-grid.interface';
import { WidgetMap } from './widget.map.js';

type Props = {
  onClose: () => void;
  onAdd: (widget: Omit<IDashGridElement, 'i' | 'x' | 'y'>) => void;
};

const widgets: Omit<IDashGridElement, 'i' | 'x' | 'y'>[] = [];

WidgetMap.forEach((widget, id) => {
  widgets.push({
    w: widget.defaults.dimensions.w,
    h: widget.defaults.dimensions.h,
    minW: widget.defaults.dimensions.minW,
    minH: widget.defaults.dimensions.minH,
    widget: {
      id,
      header: widget.defaults.header,
      config: widget.defaults?.config ?? {},
    },
  });
});

export default function WidgetDrawerComponent({ onClose, onAdd }: Props) {
  return (
    <Drawer width="40%" open title="Widgets" onClose={onClose}>
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
