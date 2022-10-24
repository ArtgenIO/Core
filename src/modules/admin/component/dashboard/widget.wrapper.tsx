import {
  CopyOutlined,
  DeleteOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, Input, message, Popconfirm } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { IDashGridElement } from '../../interface/dash-grid.interface';
import { dashboardsAtom } from './dashboard.atom.jsx';
import { WidgetMap } from './widget.map';

type Props = {
  dashboardId: string;
  gridElement: IDashGridElement;
  onDelete: () => void;
  onChange: (widget: IDashGridElement['widget']) => void;
};

export default function WidgetWrapperComponent({
  dashboardId,
  gridElement,
  onDelete,
  onChange,
}: Props) {
  const WidgetRef = WidgetMap.get(gridElement.widget.id);
  const [openConfig, setOpenConfig] = useState(false);
  const [header, setHeader] = useState(gridElement.widget.header);
  const setDasboards = useSetRecoilState(dashboardsAtom);

  return (
    <div className="widget-box" style={{ borderWidth: '1px' }}>
      <div className="widget-header">
        <div className="flex">
          <div className="grow">
            <Input
              value={header}
              className="text-center text-lg p-0 text-white"
              bordered={false}
              onChange={e => setHeader(e.target.value)}
              onBlur={e => {
                onChange({
                  ...gridElement.widget,
                  header: e.target.value.toString(),
                });

                message.success('Widget header updated');
              }}
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
                title="Duplicate"
                onClick={() => {
                  setDasboards(oldState => {
                    const newState = cloneDeep(oldState);
                    const refDashboard = newState.find(
                      d => d.id === dashboardId,
                    );

                    if (refDashboard) {
                      const dupeGridElement = cloneDeep(gridElement);
                      dupeGridElement.i = v4();
                      dupeGridElement.widget.header = `${dupeGridElement.widget.header} (copy)`;
                      dupeGridElement.y = dupeGridElement.y + 1;

                      refDashboard.widgets.push(dupeGridElement);
                      message.success(
                        `Widget [${gridElement.widget.header}] duplicated`,
                      );
                    }

                    return newState;
                  });
                }}
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
          id={gridElement.i}
          header={gridElement.widget.header}
          config={gridElement.widget?.config || {}}
          openConfig={openConfig}
          setOpenConfig={setOpenConfig}
        />
      </div>

      <div className="bg-midnight-800 h-3 rounded-b-md"></div>
    </div>
  );
}
