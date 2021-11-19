import { Modal, Typography } from 'antd';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Elements, isNode, Node, OnLoadParams } from 'react-flow-renderer';
import { ISchema } from '../../../schema';
import { SchemaSerializer } from '../../../schema/serializer/schema.serializer';
import SchemaEditorFrameComponent from './schema-editor/_frame.component';

type Props = {
  flowInstance: OnLoadParams;
  openedNode: string;
  setOpenedNode: Dispatch<SetStateAction<string>>;
  setElements: Dispatch<SetStateAction<Elements>>;
};

export default function DatabaseSchemaEditorComponent({
  flowInstance,
  openedNode,
  setOpenedNode,
  setElements,
}: Props) {
  const [schema, setSchema] = useState<ISchema>(null);
  const [originalRef, setOriginalRef] = useState<string>(null);

  useEffect(() => {
    if (openedNode) {
      const node: Node<{ schema: ISchema }> = flowInstance
        .getElements()
        .filter(isNode)
        .find(n => n.id === openedNode);
      const schema = node.data.schema;

      schema.drawboard.position = node.position;

      setOriginalRef(schema.reference);
      setSchema(schema);
    }

    return () => {};
  }, [openedNode]);

  if (!openedNode || !schema) {
    return <></>;
  }

  return (
    <Modal
      centered
      width="70%"
      title={
        <Typography.Title style={{ marginBottom: 0 }}>
          {schema.label}
        </Typography.Title>
      }
      visible
      closable
      maskClosable
      footer={null}
      onCancel={() => {
        setOpenedNode(null);

        setElements(() => {
          const update = SchemaSerializer.fromElements(
            flowInstance.getElements(),
          );
          const idx = update.findIndex(s => s.reference === originalRef);

          update.splice(idx, 1, schema);

          return SchemaSerializer.toElements(update);
        });
      }}
    >
      <SchemaEditorFrameComponent schema={schema} setSchema={setSchema} />
    </Modal>
  );
}
