import { Divider, Drawer } from 'antd';
import * as jsonSchemaInst from 'json-schema-instantiator';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { ILambdaHandle } from '../../../lambda/interface/handle.interface';

type Props = {
  handle: ILambdaHandle;
  onClose: () => void;
};

export default function HandleSchemaComponent({ onClose, handle }: Props) {
  const [schemaDefault, setSchemaDefault] = useState('');

  useEffect(() => {
    try {
      setSchemaDefault(
        JSON.stringify(jsonSchemaInst.instantiate(handle.schema), null, 2),
      );
    } catch (error) {
      setSchemaDefault('Could not initate the default values');
    }
  }, [handle]);

  return (
    <Drawer
      width="40%"
      title={<>Handle » {handle.id}</>}
      visible
      closable
      maskClosable
      footer={null}
      onClose={onClose}
    >
      <h2 className="font-header text-lg">Example Object</h2>

      <SyntaxHighlighter
        className="bg-midnight-800 rounded-sm"
        language="json"
        style={nord}
        showLineNumbers={true}
        selected
      >
        {schemaDefault ?? 'Not Defined'}
      </SyntaxHighlighter>

      <Divider />

      <h2 className="font-header text-lg">JSON Schema</h2>

      <SyntaxHighlighter
        className="bg-midnight-800 rounded-sm"
        language="json"
        style={nord}
        showLineNumbers={true}
        selected
      >
        {JSON.stringify(handle.schema, null, 2)}
      </SyntaxHighlighter>
    </Drawer>
  );
}
