import { MenuUnfoldOutlined } from '@ant-design/icons';
import { Descriptions, PageHeader } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import Sider from 'antd/lib/layout/Sider';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ISchema } from '..';
import { schemasAtom } from '../schema.atoms';

type Props = {
  id: string;
};

export default function SchemaDetailsComponent({ id }: Props) {
  const schemas = useRecoilValue(schemasAtom);
  const [schema, setSchema] = useState<ISchema>(null);

  useEffect(() => {
    setSchema(schemas.find(s => s.id === id));
    return () => {
      setSchema(null);
    };
  }, [id, schemas]);

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
              <Descriptions.Item label="Identifier">
                <code>{schema.id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Database ID">
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
