import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Empty, Select } from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { IDatabase } from '..';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';

type DatabaseWithSchemas = IDatabase & {
  schemas: ISchema[];
};

export default function ExportDatabaseSchemantic() {
  const [databases, setDatabases] = useState<DatabaseWithSchemas[]>([]);
  const [selected, setSelected] = useState<string>(null);
  const [source, setSource] = useState('');

  const [{ data, loading, error }, refetch] = useHttpClient<
    DatabaseWithSchemas[]
  >(
    '/api/odata/main/database' +
      new QueryBuilder().top(5000).select('title,ref,schemas').toQuery(),
    {
      useCache: false,
    },
  );

  useEffect(() => {
    if (selected) {
      setSource(
        JSON.stringify(data.find(db => db.ref === selected).schemas, null, 2),
      );
    } else {
      setSource('');
    }
  }, [selected]);

  useEffect(() => {
    if (data && data.length === 1) {
      setSelected(data[0].ref);
    }
  }, [data]);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Export Database Schemantic"
          actions={
            <Button
              className="test--download"
              type="primary"
              ghost
              icon={<DownloadOutlined />}
            >
              Download
            </Button>
          }
        />
      }
    >
      <Alert
        type="info"
        message="You can export the database schemantic in JSON format and keep it as a backup, your Artgen system can always recreate the whole database from this serialized format."
        showIcon
        className="mb-4"
      />

      <Select
        placeholder={loading ? 'Loading databases...' : 'Select a database'}
        className="w-full"
        size="large"
        value={selected}
        onChange={v => setSelected(v ? (v as string) : null)}
      >
        {data
          ? data.map(db => (
              <Select.Option key={db.ref} value={db.ref}>
                {db.title}
              </Select.Option>
            ))
          : undefined}
      </Select>
      <Divider />

      {source ? (
        <SyntaxHighlighter
          className="bg-midnight-700 rounded-sm"
          language="json"
          style={nord}
          showLineNumbers={true}
        >
          {source}
        </SyntaxHighlighter>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Please select a database"
        />
      )}
    </PageWithHeader>
  );
}
