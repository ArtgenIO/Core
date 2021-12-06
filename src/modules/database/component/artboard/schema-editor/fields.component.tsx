import {
  DatabaseOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
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
import { Dispatch, SetStateAction } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { pageDrawerAtom } from '../../../../admin/admin.atoms';
import { FieldType, ISchema } from '../../../../schema';
import SchemaEditorFieldTunerComponent from './field-tune.component';

export default function SchemaEditorFieldsComponent({
  schema,
  setSchema,
}: {
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
}) {
  const setPageDrawler = useSetRecoilState(pageDrawerAtom);
  const resetPageDrawler = useResetRecoilState(pageDrawerAtom);

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
        label: `New Field ${fieldKey}`,
        type: FieldType.TEXT,
        defaultValue: null,
        typeParams: {
          values: [],
        },
        tags: [],
      });

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
        dataSource={schema.fields}
        renderItem={(field, k) => (
          <List.Item
            key={`field-${k}`}
            onClick={() =>
              setPageDrawler(
                <SchemaEditorFieldTunerComponent
                  fieldKey={k}
                  schema={schema}
                  setSchema={setSchema}
                />,
              )
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  shape="square"
                  size="large"
                  className="bg-dark"
                  icon={<DatabaseOutlined />}
                />
              }
              title={<span className="text-xl font-thin">{field.label}</span>}
            />
            {field.tags.map(t => (
              <Tag key={t}>{t}</Tag>
            ))}

            <Popconfirm
              title="Are You sure to delete this field?"
              okText="Yes, delete"
              cancelText="No"
              placement="left"
              icon={<QuestionCircleOutlined />}
              onConfirm={e => {
                e.stopPropagation();

                setSchema(schema => {
                  if (schema.fields.length === 1) {
                    message.warn('You need to have at least one field');

                    return schema;
                  }

                  const newSchema = cloneDeep(schema);
                  newSchema.fields.splice(k, 1);

                  return newSchema;
                });

                resetPageDrawler();
              }}
            >
              <Button
                onClick={e => e.stopPropagation()}
                icon={<DeleteOutlined />}
                className="rounded-md hover:text-red-500 hover:border-red-500"
              ></Button>
            </Popconfirm>
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
    </>
  );
}
