import { Button, Divider, Drawer, message } from 'antd';
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { useRecoilValue } from 'recoil';
import { schemasAtom } from '../../../admin/admin.atoms';
import { IDatabase } from '../../interface';
import { ISchema } from '../../types/schema.interface';

type Props = {
  onClose: () => void;
  database: IDatabase;
};

type DatabaseWithSchemas = IDatabase & {
  schemas: ISchema[];
};

export default function DatabaseExportComponent({ onClose, database }: Props) {
  const schemas = useRecoilValue(schemasAtom);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (schemas) {
      setContent(
        JSON.stringify(
          {
            ...database,
            schemas: schemas.filter(s => s.database === database.ref),
          },
          null,
          2,
        ),
      );
    }
  }, [schemas, database]);

  const doDownload = () => {
    const fileName = `schema-${database.ref}.json`;
    const fileContent = new Blob([content], {
      type: 'application/json',
    });

    saveAs(fileContent, fileName);
  };

  const doCopy = () => {
    navigator.clipboard.writeText(content);
    message.success('Database copied to Your clipboard!', 2);
  };

  return (
    <Drawer
      width="50%"
      open={true}
      title="Export Database Schemantic"
      onClose={onClose}
    >
      <Button.Group className="w-full">
        <Button block type="primary" ghost onClick={doDownload}>
          Download as JSON
        </Button>
        <Button block type="primary" onClick={doCopy}>
          Copy to Clipboard
        </Button>
      </Button.Group>
      <Divider />

      <SyntaxHighlighter
        className="bg-midnight-800 rounded-sm"
        language="json"
        style={nord}
        showLineNumbers={true}
        selected
      >
        {content}
      </SyntaxHighlighter>
    </Drawer>
  );
}
