import { SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Layout, Menu } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import { useState } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { routeCrudAPI, routeCrudUI } from '../util/schema-url';
import CrudCreateComponent from './create.component';
import CrudReadComponent from './read.component';
import CrudUpdateComponent from './update.component';

export default function CrudIndexComponent() {
  const location = useLocation();
  const history = useHistory();
  const [search, setSearch] = useState<string>(null);

  const [{ data: schemas, loading, error }] = useHttpClient<ISchema[]>(
    routeCrudAPI({ database: 'main', reference: 'Schema' }) +
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
      if (location.pathname === '/admin/content') {
        history.push(routeCrudUI(schemas[0]));
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
      <Sider collapsible={false} width={200} className="h-screen sider-2nd">
        <div className="pt-2 -mb-2 px-2">
          <Input
            placeholder="Search content..."
            prefix={<SearchOutlined />}
            onChange={e => setSearch(e.target.value.toLowerCase())}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                const match = schemas.filter(menuFilter);

                if (match.length === 1) {
                  history.push(routeCrudUI(match[0]));
                }
              }
            }}
          />
        </div>
        <Divider />
        <Menu
          key="menus"
          className="menu -mt-2"
          theme="dark"
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
      </Sider>

      <Layout>
        <Switch location={location}>
          <Route
            path="/admin/content/:database/:reference/update"
            component={CrudUpdateComponent}
          ></Route>
          <Route
            path="/admin/content/:database/:reference/create"
            component={CrudCreateComponent}
          ></Route>
          <Route
            path="/admin/content/:database/:reference"
            component={CrudReadComponent}
          ></Route>
        </Switch>
      </Layout>
    </Layout>
  );
}
