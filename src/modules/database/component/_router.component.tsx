import { DatabaseOutlined, SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Layout, Menu, Result, Tree, TreeDataNode } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import {
  generatePath,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router';
import { ADMIN_URL } from '../../admin/admin.constants';
import Icon from '../../admin/component/icon.component';
import MenuBlock from '../../admin/component/menu-block.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { IDatabase } from '../interface';
import DatabaseArtboardComponent from './artboard/artboard.component';
import ConnectionsComponent from './connections.component';
import ExportDatabaseSchemantic from './export.component';
import ManagerMenuComponent from './_menu/manager.component';

type DatabaseWithSchemas = IDatabase & {
  schemas: ISchema[];
};

export default function DatabaseRouterComponent() {
  const base = `${ADMIN_URL}/database`;
  const navigate = useNavigate();
  const [tree, setTree] = useState<TreeDataNode[]>([]);

  const [{ data: databases, loading, error }, refetch] = useHttpClient<
    DatabaseWithSchemas[]
  >(
    '/api/odata/main/database' +
      new QueryBuilder()
        .top(5000)
        .select(
          'title,name,schemas/title,schemas/reference,schemas/database,schemas/fields',
        )
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
          children: db.schemas
            .sort((a, b) => (a.title > b.title ? 1 : -1))
            .map(s => ({
              title: s.title,
              key: `${db.name}-${s.reference}`,
              children: s.fields.map(f => ({
                title: f.title,
                key: `${db.name}-${s.reference}-${f.reference}`,
                selectable: true,
                isLeaf: true,
              })),
              //icon: <TableOutlined />,
            })) as TreeDataNode[],
          className: 'test--db-name',
          icon: <DatabaseOutlined />,
          isLeaf: false,
        })),
      );
    }
  }, [loading]);

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
      <Sider
        width={220}
        className="h-screen sider-2nd overflow-auto gray-scroll"
      >
        <MenuBlock title="Database Explorer" style={{ marginTop: -1 }}>
          <div className="px-2 py-2">
            <Input
              placeholder="Schemantic Search..."
              prefix={<SearchOutlined />}
              size="small"
            />
          </div>
          <Divider className="mt-0 mb-1" />

          {tree.length ? (
            <Tree.DirectoryTree
              treeData={tree}
              onSelect={selected => {
                if (selected.length) {
                  const [ref] = selected[0].toString().split('-');
                  const path = generatePath('/admin/database/artboard/:ref', {
                    ref,
                  });

                  navigate(path);
                }
              }}
            />
          ) : undefined}
        </MenuBlock>
        <ManagerMenuComponent />
        <MenuBlock title="Schemantic Generator">
          <Menu theme="dark" className="compact">
            <Menu.Item key="from-csv" icon={<Icon id="transform" />}>
              From CSV
            </Menu.Item>
            <Menu.Item key="from-json" icon={<Icon id="transform" />}>
              From JSON
            </Menu.Item>
            <Menu.Item key="from-dbml" icon={<Icon id="transform" />}>
              From DBML
            </Menu.Item>
          </Menu>
        </MenuBlock>
      </Sider>

      <Layout>
        <Routes>
          <Route path="connections" element={<ConnectionsComponent />}></Route>
          <Route
            path="artboard/:ref"
            element={<DatabaseArtboardComponent />}
          ></Route>
          <Route path="export" element={<ExportDatabaseSchemantic />}></Route>
          <Route
            path="/"
            element={<Navigate to={`${base}/connections`} />}
          ></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
