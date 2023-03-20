import { Button, Drawer, Empty, Input, message } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { IBaseWidgetProps } from '../../../api/types/base-widget.type.js';
import { dashboardsAtom } from '../atoms/dashboard.atom.jsx';

type WidgetConfig = {
  content: string;
};

export default function NoteWidget({
  id,
  config,
  openConfig,
  setOpenConfig,
}: IBaseWidgetProps<WidgetConfig>) {
  const setDasboards = useSetRecoilState(dashboardsAtom);
  const [content, setContent] = useState(config.content);

  return (
    <>
      <div className="text-center py-2 px-2">
        {content ? <pre>{content}</pre> : <Empty description="No Content" />}
      </div>
      {openConfig && (
        <Drawer
          open
          width="40%"
          onClose={() => setOpenConfig(false)}
          title="Configure Widget"
          footer={
            <Button
              block
              className="success"
              onClick={() => {
                setDasboards(oldState => {
                  const newState = cloneDeep(oldState);

                  for (const dashboard of newState) {
                    const thisWidget = dashboard.widgets.find(
                      widget => widget.i === id,
                    );

                    if (thisWidget) {
                      (thisWidget.widget.config as WidgetConfig).content =
                        content;
                      break;
                    }
                  }

                  return newState;
                });

                setOpenConfig(false);

                message.success('Widget configration updated');
              }}
            >
              Save Changes
            </Button>
          }
        >
          <Input.TextArea
            rows={8}
            spellCheck
            showCount
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Content"
          />
        </Drawer>
      )}
    </>
  );
}
