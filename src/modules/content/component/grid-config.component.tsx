import {
  DownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Button, Drawer, List } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import cloneDeep from 'lodash.clonedeep';
import { useSetRecoilState } from 'recoil';
import { schemasAtom } from '../../admin/admin.atoms';
import { ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';
import { fSchema } from '../../schema/util/filter-schema';
import { GridTools } from '../util/grid.tools';

type Props = {
  schema: ISchema;
  onClose: () => void;
};

export default function ContentGridConfigComponent({ schema, onClose }: Props) {
  const setSchemas = useSetRecoilState(schemasAtom);

  const reSort = (idx: number, dir: number) => {
    setSchemas(currentState => {
      const newState = cloneDeep(currentState);
      const newFields = newState
        .find(fSchema(schema))
        .fields.map(FieldTool.withMeta)
        .sort(GridTools.sortFields);

      const swapField = newFields[idx + dir];
      const thisField = newFields[idx];

      const swapValue = swapField.meta.grid.order;
      const thisValue = thisField.meta.grid.order;

      swapField.meta.grid.order = thisValue;
      thisField.meta.grid.order = swapValue;

      return newState;
    });
  };

  return (
    <Drawer
      width="30%"
      visible={true}
      title={`Grid Config » ${schema.title}`}
      onClose={onClose}
    >
      <ErrorBoundary>
        <List
          size="small"
          className="rounded-sm"
          bordered
          dataSource={cloneDeep(schema)
            .fields.map(FieldTool.withMeta)
            .sort(GridTools.sortFields)}
          renderItem={(field, idx) => (
            <List.Item>
              <List.Item.Meta title={<b>{field.title}</b>}></List.Item.Meta>

              <Button.Group size="small">
                <Button
                  icon={
                    field.meta.grid.hidden ? (
                      <EyeInvisibleOutlined className="text-yellow-500" />
                    ) : (
                      <EyeOutlined />
                    )
                  }
                  onClick={() => {
                    setSchemas(currentState => {
                      const newState = cloneDeep(currentState);

                      newState
                        .find(fSchema(schema))
                        .fields.map(FieldTool.withMeta)
                        .find(
                          f => f.reference === field.reference,
                        ).meta.grid.hidden = !field.meta.grid.hidden;

                      return newState;
                    });
                  }}
                />

                <Button
                  icon={<DownOutlined />}
                  disabled={idx + 1 === schema.fields.length}
                  onClick={() => reSort(idx, 1)}
                />
                <Button
                  icon={<UpOutlined />}
                  disabled={idx === 0}
                  onClick={() => reSort(idx, -1)}
                />
              </Button.Group>
            </List.Item>
          )}
        />
      </ErrorBoundary>
    </Drawer>
  );
}
