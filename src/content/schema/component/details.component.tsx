import { MenuUnfoldOutlined } from '@ant-design/icons';
import { Descriptions, PageHeader } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import Sider from 'antd/lib/layout/Sider';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ISchema } from '..';
import { schemasAtom } from '../schema.atoms';

type Props = {
  database: string;
  reference: string;
};

export default function SchemaDetailsComponent({ database, reference }: Props) {
  const schemas = useRecoilValue(schemasAtom);
  const [schema, setSchema] = useState<ISchema>(null);

  useEffect(() => {
    setSchema(
      schemas.find(s => s.database === database && s.reference === s.reference),
    );
    return () => {
      setSchema(null);
    };
  }, [database, reference, schemas]);

  return (
    <Sider
      width="380px"
      collapsible
      reverseArrow={true}
      collapsedWidth="0px"
      trigger={null}
      collapsed={false}
    >
      <ErrorBoundary>
        {schema ? (
          <>
            <PageHeader
              title={
                <span>
                  <MenuUnfoldOutlined className="mr-2" /> Details
                </span>
              }
              ghost
            ></PageHeader>

            <Descriptions layout="vertical" column={1} bordered>
              <Descriptions.Item label="Label">
                {schema.label}
              </Descriptions.Item>
              <Descriptions.Item label="Reference">
                <code>{schema.reference}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Database">
                <code>{schema.database}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Table Name">
                {schema.tableName}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <h1>Loading</h1>
        )}
      </ErrorBoundary>
    </Sider>
  );
}
