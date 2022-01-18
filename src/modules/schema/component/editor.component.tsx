import { Drawer, message } from 'antd';
import { useEffect, useState } from 'react';
import { ISchema } from '..';
import SchemaEditorFrameComponent from './editor/_frame.component';

type Props = {
  schema: ISchema;
  onClose: (newState: ISchema | null) => void;
};

export default function SchemaEditorComponent({ schema, onClose }: Props) {
  const [localSchema, setLocalSchema] = useState<ISchema>(null);
  const [visible, setVisible] = useState(true);

  const [isNewSchema, setIsNewSchema] = useState(null);

  useEffect(() => {
    if (schema) {
      setIsNewSchema(schema.reference === '__new_schema');
      setLocalSchema(schema);
    }

    return () => {
      setLocalSchema(null);
      setIsNewSchema(null);
    };
  }, [schema]);

  if (!localSchema) {
    return <></>;
  }

  return (
    <Drawer
      width="50%"
      title={<span>{localSchema.title}</span>}
      visible
      closable
      maskClosable
      footer={null}
      onClose={() => {
        if (localSchema.reference === '__new_schema') {
          message.warn('Please first change the name and reference');
        } else {
          onClose(localSchema);
          setVisible(false);
        }
      }}
    >
      <SchemaEditorFrameComponent
        isNewSchema={isNewSchema}
        schema={localSchema}
        setSchema={setLocalSchema}
      />
    </Drawer>
  );
}
