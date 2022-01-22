import { Button, Divider, Drawer, Form, Input, Select, Transfer } from 'antd';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { databasesAtom, schemasAtom } from '../../admin/admin.atoms';
import { IBlueprint } from '../interface/blueprint.interface';

type Props = {
  blueprint: IBlueprint;
  onSave: (blueprint: IBlueprint) => void;
};

export default function BlueprintEditorComponent({ blueprint, onSave }: Props) {
  const schemas = useRecoilValue(schemasAtom);
  const databases = useRecoilValue(databasesAtom);
  const [selectedDatabase, setSelectedDatabase] = useState<string>(
    blueprint.database,
  );

  const [selectedSchemas, setSelectedSchemas] = useState<string[]>(
    blueprint.schemas.map(s => s.reference),
  );

  return (
    <Drawer
      width={900}
      visible
      title="Blueprint Editor"
      onClose={() => {
        onSave(blueprint);
      }}
    >
      <Form layout="vertical" initialValues={blueprint} className="px-4">
        <Form.Item label="Identifier" name="id">
          <Input readOnly disabled />
        </Form.Item>

        <Form.Item label="Title" name="title">
          <Input />
        </Form.Item>

        <Form.Item label="Version" name="version">
          <Input />
        </Form.Item>

        <Form.Item label="Database" name="database">
          <Select
            placeholder="Select a database to pick schemas"
            size="middle"
            className="w-full mb-4"
            onChange={(v: string) => setSelectedDatabase(v)}
          >
            {databases.map(db => (
              <Select.Option key={db.ref} value={db.ref}>
                {db.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Transfer
          dataSource={schemas}
          titles={['Available', 'Selected']}
          targetKeys={selectedSchemas}
          render={item => item.title}
          pagination
          onChange={selected => setSelectedSchemas(selected)}
        />

        <Divider />

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
