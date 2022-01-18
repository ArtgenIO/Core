import {
  DatabaseOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  List,
  message,
  Popconfirm,
  Tag,
  Typography,
} from 'antd';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { FieldType, ISchema } from '../..';
import { GridTools } from '../../../content/util/grid.tools';
import { FieldTool } from '../../util/field-tools';
import SchemaEditorFieldTunerComponent from './field-tune.component';

export default function SchemaEditorFieldsComponent({
  schema,
  setSchema,
  isNewSchema,
  immutableSchema,
}: {
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
  isNewSchema: boolean;
  immutableSchema: ISchema;
}) {
  const [fieldTuneKey, setFieldTuneKey] = useState<number>(null);

  const reSort = (idx: number, dir: number) => {
    setSchema(currentState => {
      const newState = cloneDeep(currentState);
      const newFields = newState.fields
        .map(FieldTool.withMeta)
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

  const addNewField = () => {
    setSchema(s => {
      const newState = cloneDeep(s);
      const fieldKeys = newState.fields.map(f => f.reference);
      let fieldKey = 0;

      while (++fieldKey) {
        if (!fieldKeys.includes(`newField${fieldKey}`)) {
          break;
        }
      }

      newState.fields.push({
        reference: `newField${fieldKey}`,
        columnName: `newField${fieldKey}`,
        title: `New Field ${fieldKey}`,
        type: FieldType.TEXT,
        defaultValue: null,
        meta: {},
        args: {},
        tags: [],
      });

      setFieldTuneKey(newState.fields.length - 1);

      return newState;
    });
  };

  return (
    <>
      <Typography>
        <Typography.Paragraph>
          Here You can customize the additional data fields, those will be
          translated as table columns for your chosen database. At first it can
          be overwhelming to plan for every scenario, but worry not, you can
          edit everything even after creation. Consider using a least minimum
          approach where you only add fields what you know will definitely need,
          and you can add more of those as the need arises.
        </Typography.Paragraph>
      </Typography>

      <List
        bordered
        size="small"
        dataSource={cloneDeep(schema)
          .fields.map(FieldTool.withMeta)
          .sort(GridTools.sortFields)}
        renderItem={(field, idx) => (
          <List.Item key={`field-${idx}`} onClick={() => setFieldTuneKey(idx)}>
            <List.Item.Meta
              avatar={
                <Avatar
                  shape="square"
                  size="default"
                  className="bg-midnight-800"
                  icon={<DatabaseOutlined />}
                />
              }
              title={<span className="text-xl font-thin">{field.title}</span>}
            />
            {field.tags.map(t => (
              <Tag key={t}>{t}</Tag>
            ))}

            <Button.Group size="small">
              <Button
                icon={
                  field.meta.grid.hidden ? (
                    <EyeInvisibleOutlined className="text-yellow-500" />
                  ) : (
                    <EyeOutlined />
                  )
                }
                onClick={e => {
                  setSchema(currentState => {
                    const newState = cloneDeep(currentState);

                    newState.fields
                      .map(FieldTool.withMeta)
                      .find(
                        f => f.reference === field.reference,
                      ).meta.grid.hidden = !field.meta.grid.hidden;

                    return newState;
                  });

                  e.stopPropagation();
                }}
              />

              <Button
                icon={<DownOutlined />}
                disabled={idx + 1 === schema.fields.length}
                onClick={e => {
                  reSort(idx, 1);
                  e.stopPropagation();
                }}
              />
              <Button
                icon={<UpOutlined />}
                disabled={idx === 0}
                onClick={e => {
                  reSort(idx, -1);
                  e.stopPropagation();
                }}
              />

              {isNewSchema || !FieldTool.isPrimary(field) ? (
                <Popconfirm
                  title="Are You sure to delete this field?"
                  okText="Yes, delete"
                  cancelText="No"
                  placement="left"
                  icon={<QuestionCircleOutlined />}
                  onConfirm={e => {
                    e.stopPropagation();

                    setSchema(schema => {
                      if (
                        schema.fields.filter(FieldTool.isPrimary).length === 1
                      ) {
                        message.warn(
                          'You need to have at least primary key field',
                        );

                        return schema;
                      }

                      const newSchema = cloneDeep(schema);
                      newSchema.fields.splice(idx, 1);

                      return newSchema;
                    });
                  }}
                >
                  <Button
                    onClick={e => e.stopPropagation()}
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                  ></Button>
                </Popconfirm>
              ) : (
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  disabled
                  danger
                ></Button>
              )}
            </Button.Group>
          </List.Item>
        )}
      ></List>
      <Button
        ghost
        block
        size="large"
        type="dashed"
        onClick={() => addNewField()}
        className="mt-4 hover:text-green-400"
      >
        <span className="material-icons-outlined">add</span>
      </Button>
      {fieldTuneKey !== null && (
        <SchemaEditorFieldTunerComponent
          fieldKey={fieldTuneKey}
          schema={schema}
          setSchema={setSchema}
          onClose={() => setFieldTuneKey(null)}
          isNewSchema={isNewSchema}
          immutableSchema={immutableSchema}
        />
      )}
    </>
  );
}
