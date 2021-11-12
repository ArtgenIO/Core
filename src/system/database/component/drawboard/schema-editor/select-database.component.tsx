import { FileAddOutlined } from '@ant-design/icons';
import { Button, Divider, Result, Select, Spin, Typography } from 'antd';
import { cloneDeep, startCase } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { routeCrudAPI } from '../../../../../content/crud/util/schema-url';
import { ISchema } from '../../../../../content/schema';
import { useHttpClient } from '../../../../../management/backoffice/library/use-http-client';
import { IDatabase } from '../../../interface';

export default function SelectDatabaseComponent({
  schema,
  setSchema,
}: {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  const [{ data: databases, loading, error }] = useHttpClient<IDatabase[]>(
    routeCrudAPI({
      database: 'system',
      reference: 'Database',
    }),
  );

  if (error) {
    return (
      <Result
        status="500"
        title="Hmm, something gone wrong!"
        subTitle="Could not load the databases list, please try to refresh the page."
      ></Result>
    );
  }

  return (
    <>
      <Typography className="mb-8">
        <Typography.Title>
          Select the Target Database
          <Link to="/backoffice/content/crud/system/Database/create">
            <Button
              className="float-right"
              type="primary"
              icon={<FileAddOutlined />}
              ghost
            >
              Add New Database
            </Button>
          </Link>
        </Typography.Title>
        <Divider />
        <Typography.Paragraph>
          Choose which database you want to create the schema to. Please be
          aware that different database providers come with different
          capabilities, for example PostgreSQL provides native UUID type, but
          SQLite does not. If you want to use a new database for this schema
          click to the add new database at the right top corner.
        </Typography.Paragraph>
      </Typography>

      <Spin size="large" spinning={loading}>
        <Select
          value={schema.database ?? undefined}
          className="w-full"
          size="large"
          placeholder="Please choose the target database"
          onChange={(db: string) =>
            setSchema(current => {
              const updated = cloneDeep(current);

              updated.database = db;

              return updated;
            })
          }
        >
          {databases
            ? databases.map(db => (
                <Select.Option key={db.name} value={db.name}>
                  [{db.type}] {startCase(db.name)}
                </Select.Option>
              ))
            : undefined}
        </Select>
      </Spin>
    </>
  );
}
