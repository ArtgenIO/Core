import {
  DatabaseOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  Divider,
  Input,
  Layout,
  Result,
  Skeleton,
  Tree,
  TreeDataNode,
} from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { ADMIN_URL } from '../../admin/admin.constants';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { IDatabase } from '../interface';

type DatabaseWithSchemas = IDatabase & {
  schemas: ISchema[];
};

export default function DatabaseTreeComponent() {
  const base = `${ADMIN_URL}/database`;
  const [tree, setTree] = useState<TreeDataNode[]>([]);

  const [{ data: databases, loading, error }, refetch] = useHttpClient<
    DatabaseWithSchemas[]
  >(
    '/api/odata/main/database' +
      new QueryBuilder()
        .top(5000)
        .select('title,name,schemas/title,schemas/reference,schemas/database')
        .toQuery(),
    {
      useCache: false,
    },
  );

  useEffect(() => {
    if (databases) {
      setTree(
        databases.map(db => ({
          title: db.title,
          key: db.name,
          children: db.schemas?.map(s => ({
            title: s.title,
            key: `${db.name}-${s.reference}`,
            icon: <TableOutlined />,
          })) as TreeDataNode[],
          className: 'test--db-name',
          icon: <DatabaseOutlined />,
          isLeaf: false,
        })),
      );
    }
  }, [databases]);

  if (error) {
    return (
      <Result
        status="error"
        title="Oups! There was an error, while we loaded the databases"
      ></Result>
    );
  }

  return (
    <Layout hasSider>
      <Sider collapsible={false} width={200} className="h-screen sider-2nd">
        <div className="pt-2 -mb-2 px-2">
          <Input placeholder="Search table..." prefix={<SearchOutlined />} />
        </div>
        <Divider />
        <Skeleton loading={loading} active>
          <Tree.DirectoryTree treeData={tree} defaultExpandAll={true} />
        </Skeleton>
      </Sider>

      <Layout></Layout>
    </Layout>
  );
}
