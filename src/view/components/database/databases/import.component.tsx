import { SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Input, notification, Select } from 'antd';
import { useEffect, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ISchema } from '../../../../models/schema.interface';
import { databasesAtom, schemasAtom } from '../../../atoms/admin.atoms';
import PageHeader from '../../../layout/page-header.component';
import PageWithHeader from '../../../layout/page-with-header.component';

export default function ImportSchemaComponent() {
  const databases = useRecoilValue(databasesAtom);
  const [schemas, setSchemas] = useRecoilState(schemasAtom);
  const [database, setDatabase] = useState<string>(null);
  const [content, setContent] = useState<string>(null);
  const [isValid, setIsValid] = useState(false);

  // Routing
  const navigate = useNavigate();

  useEffect(() => {
    if (databases && databases.length === 1) {
      setDatabase(databases[0].ref);
    }
  }, [databases]);

  useEffect(() => {
    if (content && content.length) {
      try {
        const temp = JSON.parse(content);
        const keys = Object.keys(temp);

        for (const req of [
          'database',
          'reference',
          'title',
          'tableName',
          'fields',
          'indices',
          'uniques',
          'relations',
          'tags',
        ]) {
          if (!keys.includes(req)) {
            throw `Missing key [${req}]`;
          }
        }

        if (database) {
          if (
            schemas.some(
              s => s.database == database && s.reference == temp.reference,
            )
          ) {
            throw `Reference [${temp.reference}] already exists!`;
          }

          if (
            schemas.some(
              s => s.database == database && s.tableName == temp.tableName,
            )
          ) {
            throw `Table [${temp.tableName}] already exists!`;
          }

          setIsValid(true);

          notification.info({
            key: 'schema-import',
            message: 'Schema seems to be valid',
          });
        }
      } catch (error) {
        setIsValid(false);
        notification.error({
          key: 'schema-import',
          message: 'Schema validation failed',
          description: (error as Error)?.message,
        });
      }
    }
  }, [content, database]);

  const doImport = () => {
    const newSchema: ISchema = JSON.parse(content);
    newSchema.database = database;

    setSchemas(s => s.concat(newSchema));

    const path = generatePath(
      `/admin/database/artboard/:ref?schema=${newSchema.reference}`,
      {
        ref: database,
      } as any,
    );

    setTimeout(() => navigate(path), 50);

    notification.success({
      key: 'schema-import',
      message: 'Schema imported',
      description: 'Have fun!',
    });
  };

  return (
    <PageWithHeader header={<PageHeader title="Import Schema" />}>
      <Alert
        message="Please be aware if the system cannot create the schema after the import, it will not try to recreate it until the next system startup."
        type="warning"
        className="mb-2"
        showIcon
      />
      <Divider />
      <div className="w-full">
        <Select
          size="large"
          className="w-full"
          placeholder="Please select the target database"
          value={database}
          onChange={v => setDatabase(v)}
        >
          {databases.map(db => (
            <Select.Option key={db.ref} value={db.ref}>
              {db.title}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Divider />

      <Input.TextArea
        rows={16}
        showCount
        maxLength={65536 * 2}
        className="bg-midnight-750 mb-4"
        placeholder="Paste your schema JSON here"
        value={content}
        onChange={e => setContent(e.target.value)}
      ></Input.TextArea>

      <Button
        type="primary"
        icon={<SaveOutlined />}
        block
        disabled={!database || !isValid}
        onClick={() => doImport()}
      >
        Create Table
      </Button>
    </PageWithHeader>
  );
}
