import { SearchOutlined } from '@ant-design/icons';
import { Input, Layout, Menu } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import { useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import MenuBlock from '../../admin/component/menu-block.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { routeCrudUI, toODataRoute } from '../util/schema-url';
import CrudCreateComponent from './create.component';
import CrudReadComponent from './read.component';
import CrudUpdateComponent from './update.component';

export default function CrudIndexComponent() {
  const location = useLocation();
  const redirect = useNavigate();
  const [search, setSearch] = useState<string>(null);

  const [{ data: schemas, loading, error }] = useHttpClient<ISchema[]>(
    toODataRoute({ database: 'main', reference: 'Schema' }) +
      new QueryBuilder()
        .select('database,reference,title,tableName,tags')
        .orderBy('title')
        .top(1000)
        .toQuery(),
    {
      useCache: true,
    },
  );

  if (!loading) {
    if (schemas.length) {
      schemas.sort((a, b) => (a.title > b.title ? 1 : -1));

      if (location.pathname === '/admin/content') {
        redirect(routeCrudUI(schemas[0]));
      }
    }
  }

  if (error) {
    return <h1>Error while loading the page</h1>;
  }

  const menuFilter = (schema: ISchema): boolean => {
    if (!search) {
      return true;
    }

    return (
      !!schema.title.toLowerCase().match(search) ||
      !!schema.reference.toLowerCase().match(search) ||
      !!schema.tableName.toLowerCase().match(search) ||
      schema.tags.some(t => t.toLowerCase().match(search))
    );
  };

  return (
    <Layout hasSider>
      <Sider
        collapsible={false}
        width={200}
        className="h-screen depth-2 overflow-auto gray-scroll"
      >
        <div className="pt-4 mb-2 px-2">
          <Input
            placeholder="Search content..."
            prefix={<SearchOutlined />}
            onChange={e => setSearch(e.target.value.toLowerCase())}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                const match = schemas.filter(menuFilter);

                if (match.length === 1) {
                  redirect(routeCrudUI(match[0]));
                }
              }
            }}
          />
        </div>
        <MenuBlock title="Content Explorer">
          <Menu
            key="menus"
            className="compact"
            defaultSelectedKeys={[]}
            mode="inline"
            triggerSubMenuAction="hover"
          >
            {schemas
              ? schemas.filter(menuFilter).map((schema, k) => {
                  return (
                    <Menu.Item key={`schema-${k}`}>
                      <Link to={routeCrudUI(schema)}>{schema.title}</Link>
                    </Menu.Item>
                  );
                })
              : undefined}
          </Menu>
        </MenuBlock>
      </Sider>

      <Layout>
        <Routes>
          <Route
            path=":database/:reference/update"
            element={<CrudUpdateComponent />}
          ></Route>
          <Route
            path=":database/:reference/create"
            element={<CrudCreateComponent />}
          ></Route>
          <Route
            path=":database/:reference"
            element={<CrudReadComponent />}
          ></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
