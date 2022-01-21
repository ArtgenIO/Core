import { Form, Input, Select, Tooltip } from 'antd';
import { camelCase, cloneDeep, snakeCase } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ISchema } from '../..';
import { modulesAtom } from '../../../admin/admin.atoms';

type InputLinkedProps = {
  isLinked: boolean;
  setIsLinked: (s: (c: boolean) => boolean) => void;
};

function InputLinked({ isLinked, setIsLinked }: InputLinkedProps) {
  return (
    <Tooltip
      placement="topRight"
      title={
        isLinked
          ? 'Click to edit independently'
          : 'Input is independent from the title name'
      }
    >
      <span
        className="material-icons cursor-pointer"
        onClick={() => setIsLinked(c => !c)}
      >
        {isLinked ? 'insert_link' : 'link_off'}
      </span>
    </Tooltip>
  );
}

type Props = {
  isNewSchema: boolean;
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
};

export default function SchemaEditorGeneralComponent({
  isNewSchema,
  schema,
  setSchema,
}: Props) {
  const modules = useRecoilValue(modulesAtom);

  // Name states

  // Auto generate ref and table for new schema
  const [refLinked, setRefLinked] = useState(false);
  const [tblLinked, setTblLinked] = useState(false);

  useEffect(() => {
    setRefLinked(isNewSchema);
    setTblLinked(isNewSchema);
  }, [isNewSchema]);

  return (
    <>
      <Form layout="vertical" requiredMark={false}>
        <Form.Item label="Module">
          <Select
            placeholder="Select a module"
            value={schema.moduleId}
            allowClear
            onSelect={value =>
              setSchema(s => {
                const newState = cloneDeep(s);
                newState.moduleId = value;
                return newState;
              })
            }
          >
            {modules.map(m => (
              <Select.Option key={m.id} value={m.id}>
                {m.name}
              </Select.Option>
            ))}
            <Select.Option key="nope" value={null}>
              - no module -
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Title">
          <Input
            value={schema.title}
            placeholder="Just a human friendly title, like Products"
            onChange={event =>
              setSchema(s => {
                const newState = cloneDeep(s);
                newState.title = event.target.value;
                if (refLinked) newState.reference = camelCase(newState.title);
                if (tblLinked) newState.tableName = snakeCase(newState.title);
                return newState;
              })
            }
          />
        </Form.Item>

        <Form.Item label="Reference">
          <Input
            placeholder="System inner reference, used as a unique identifier per database"
            disabled={!isNewSchema}
            value={schema.reference}
            suffix={
              isNewSchema ? (
                <InputLinked isLinked={refLinked} setIsLinked={setRefLinked} />
              ) : undefined
            }
            onChange={event =>
              setSchema(s => {
                const newState = cloneDeep(s);
                newState.reference = event.target.value;
                return newState;
              })
            }
          />
        </Form.Item>

        <Form.Item label="Table Name">
          <Input
            placeholder="The table's name created in the database server"
            disabled={!isNewSchema}
            value={schema.tableName}
            suffix={
              isNewSchema ? (
                <InputLinked isLinked={tblLinked} setIsLinked={setTblLinked} />
              ) : undefined
            }
            onChange={event =>
              setSchema(s => {
                const newState = cloneDeep(s);
                newState.tableName = event.target.value;
                return newState;
              })
            }
          />
        </Form.Item>
      </Form>
    </>
  );
}
