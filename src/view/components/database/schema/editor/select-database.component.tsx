import { FileAddOutlined } from '@ant-design/icons';
import { Button, Divider, Result, Select, Spin, Typography } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import startCase from 'lodash.startcase';
import { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { IDatabase } from '../../../../../models/database.interface';
import { ISchema } from '../../../../../models/schema.interface';
import { IFindResponse } from '../../../../../types/find-reponse.interface';
import { SchemaRef } from '../../../../../types/system-ref.enum';
import { useHttpClient } from '../../../../library/hook.http-client';
import { toRestSysRoute } from '../../../../library/schema-url';

export default function SelectDatabaseComponent({
  schema,
  setSchema,
}: {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  const [{ data: databases, loading, error }] = useHttpClient<
    IFindResponse<IDatabase>
  >(toRestSysRoute(SchemaRef.DATABASE));

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
          <Link to="/admin/content/main/Database/create">
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
            ? databases.data.map(db => (
                <Select.Option key={db.ref} value={db.ref}>
                  {startCase(db.ref)}
                </Select.Option>
              ))
            : undefined}
        </Select>
      </Spin>
    </>
  );
}
