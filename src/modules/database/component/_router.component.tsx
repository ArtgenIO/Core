import { DatabaseOutlined, SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Layout, Result, Tree, TreeDataNode } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import { useEffect, useState } from 'react';
import {
  generatePath,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router';
import { ADMIN_URL } from '../../admin/admin.constants';
import MenuBlock from '../../admin/component/menu-block.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { ISchema } from '../../schema';
import { IDatabase } from '../interface';
import DatabaseArtboardComponent from './artboard/artboard.component';
import DatabaseListComponent from './databases/list.component';
import ManagerMenuComponent from './_menu/manager.component';

type DatabaseWithSchemas = IDatabase & {
  schemas: ISchema[];
};

export default function DatabaseRouterComponent() {
  const base = `${ADMIN_URL}/database`;
  const navigate = useNavigate();
  const [tree, setTree] = useState<TreeDataNode[]>([]);

  const [{ data: databases, loading, error }] = useHttpClient<
    IFindResponse<DatabaseWithSchemas>
  >(
    toRestSysRoute('database') +
      new QueryBuilder()
        .top(5000)
        .select(
          'title,ref,schemas/title,schemas/reference,schemas/database,schemas/fields',
        )
        .toQuery(),
    {
      useCache: false,
    },
  );

  useEffect(() => {
    if (databases) {
      setTree(
        databases.data.map(db => ({
          title: db.title,
          key: db.ref,
          children: db.schemas
            .sort((a, b) => (a.title > b.title ? 1 : -1))
            .map(s => ({
              title: s.title,
              key: `${db.ref}-${s.reference}`,
              isLeaf: true,
            })) as TreeDataNode[],
          className: 'test--db-list-ref',
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
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <MenuBlock
          title="Database Explorer"
          className="-mb-1"
          style={{ borderTop: 0 }}
        >
          <div className="px-2 py-2">
            <Input
              placeholder="Schemantic Search..."
              prefix={<SearchOutlined />}
              size="small"
            />
          </div>
          <Divider className="my-0" />

          {tree.length ? (
            <Tree.DirectoryTree
              treeData={tree}
              defaultExpandedKeys={[]}
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
      </Sider>

      <Layout>
        <Routes>
          <Route path="databases" element={<DatabaseListComponent />}></Route>
          <Route
            path="artboard/:ref"
            element={<DatabaseArtboardComponent />}
          ></Route>
          <Route
            path="/"
            element={<Navigate to={`${base}/databases`} />}
          ></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
