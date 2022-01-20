import { Button, Divider, Drawer, message, Result, Skeleton } from 'antd';
import { saveAs } from 'file-saver';
import { QueryBuilder } from 'odata-query-builder';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { useHttpClient } from '../../../admin/library/use-http-client';
import { toRestSysRoute } from '../../../content/util/schema-url';
import { IFindResponse } from '../../../rest/interface/find-reponse.interface';
import { ISchema } from '../../../schema';
import { SchemaRef } from '../../../schema/interface/system-ref.enum';
import { IDatabase } from '../../interface';

type Props = {
  onClose: () => void;
  database: IDatabase;
};

type DatabaseWithSchemas = IDatabase & {
  schemas: ISchema[];
};

export default function DatabaseExportComponent({ onClose, database }: Props) {
  const [{ data: response, loading, error }] = useHttpClient<
    IFindResponse<DatabaseWithSchemas>
  >(
    toRestSysRoute(SchemaRef.DATABASE) +
      new QueryBuilder()
        .top(1)
        .select('ref,schemas')
        .filter(f => f.filterExpression('ref', 'eq', database.ref))
        .toQuery(),
    {
      useCache: false,
    },
  );

  if (error) {
    return (
      <Result
        status="error"
        title="Could not load the database schema!"
      ></Result>
    );
  }

  const doDownload = () => {
    const fileName = `schema-${database.ref}.json`;
    const fileContent = new Blob([JSON.stringify(response.data[0], null, 2)], {
      type: 'application/json',
    });

    saveAs(fileContent, fileName);
  };

  const doCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(response.data[0], null, 2));
    message.success('Database copied to Your clipboard!', 2);
  };

  return (
    <Drawer
      width="50%"
      visible={true}
      title="Export Database Schemantic"
      onClose={onClose}
    >
      <Skeleton active loading={loading}>
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
          {response ? JSON.stringify(response.data[0], null, 2) : ''}
        </SyntaxHighlighter>
      </Skeleton>
    </Drawer>
  );
}
