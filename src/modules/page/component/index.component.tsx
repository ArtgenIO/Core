import { SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Layout, Menu, Skeleton } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useHttpClient } from '../../admin/library/use-http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IPage } from '../interface/page.interface';
import PageEditorComponent from './editor.component';

export default function PageIndexComponent() {
  const location = useLocation();
  const redirect = useNavigate();
  const [search, setSearch] = useState<string>(null);

  const [{ data: reponse, loading, error }] = useHttpClient<
    IFindResponse<IPage>
  >(
    toRestSysRoute(SchemaRef.PAGE) +
      new QueryBuilder()
        .select('id,title,domain,path,tags')
        .orderBy('id')
        .top(100)
        .toQuery(),
  );

  if (!loading) {
    if (reponse.data.length) {
      if (location.pathname === '/admin/page') {
        //history.push(routeCrudUI(`TODO`));
      }
    }
  }

  if (error) {
    return <h1>Error while loading the page</h1>;
  }

  const menuFilter = (page: IPage): boolean => {
    if (!search) {
      return true;
    }

    return (
      !!page.title.toLowerCase().match(search) ||
      !!page.domain.toLowerCase().match(search) ||
      !!page.path.toLowerCase().match(search) ||
      page.tags.some(t => t.toLowerCase().match(search))
    );
  };

  useEffect(() => {
    return () => {};
  }, [location]);

  return (
    <Skeleton loading={loading}>
      <Layout hasSider>
        <Sider collapsible={false} width={200} className="h-screen">
          <div className="pt-2 -mb-2 px-2">
            <Input
              placeholder="Search content..."
              prefix={<SearchOutlined />}
              onChange={e => setSearch(e.target.value.toLowerCase())}
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  const match = reponse.data.filter(menuFilter);

                  if (match.length === 1) {
                    redirect('TODO');
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
            {reponse
              ? reponse.data.filter(menuFilter).map(page => {
                  return (
                    <Menu.Item key={`page-${page.id}`}>
                      <Link to={`/admin/page/${page.id}`}>
                        <span>{page.domain}</span> &raquo; {page.title}
                      </Link>
                    </Menu.Item>
                  );
                })
              : undefined}
          </Menu>
        </Sider>

        <Layout>
          <Routes>
            <Route
              path="/admin/page/:id"
              element={<PageEditorComponent />}
            ></Route>
          </Routes>
        </Layout>
      </Layout>
    </Skeleton>
  );
}
