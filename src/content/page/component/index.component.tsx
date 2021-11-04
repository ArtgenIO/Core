import { SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Layout, Menu, Skeleton } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { breadcrumbsAtom } from '../../../management/backoffice/backoffice.atoms';
import { useHttpClient } from '../../../management/backoffice/library/use-http-client';
import { routeCrudAPI } from '../../crud/util/schema-url';
import { IPage } from '../interface/page.interface';
import PageEditorComponent from './editor.component';

export default function PageIndexComponent() {
  const location = useLocation();
  const history = useHistory();
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);
  const [search, setSearch] = useState<string>(null);

  const [{ data: pages, loading, error }] = useHttpClient<IPage[]>(
    routeCrudAPI({ database: 'system', reference: 'Page' }) +
      new QueryBuilder()
        .select('id,label,domain,path,tags')
        .orderBy('label')
        .top(100)
        .toQuery(),
  );

  if (!loading) {
    if (pages.length) {
      if (location.pathname === '/backoffice/content/page') {
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
      !!page.label.toLowerCase().match(search) ||
      !!page.domain.toLowerCase().match(search) ||
      !!page.path.toLowerCase().match(search) ||
      page.tags.some(t => t.toLowerCase().match(search))
    );
  };

  useEffect(() => {
    setBreadcrumb(routes =>
      routes.concat({
        breadcrumbName: 'Page',
        path: 'content/page',
      }),
    );

    return () => {
      setBreadcrumb(routes => routes.slice(0, routes.length - 1));
    };
  }, [location]);

  return (
    <Skeleton loading={loading}>
      <Layout hasSider>
        <Sider collapsible={false} width={200} className="h-screen sider-2nd">
          <div className="pt-2 -mb-2 px-2">
            <Input
              placeholder="Search content..."
              prefix={<SearchOutlined />}
              onChange={e => setSearch(e.target.value.toLowerCase())}
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  const match = pages.filter(menuFilter);

                  if (match.length === 1) {
                    history.push('TODO');
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
            {pages
              ? pages.filter(menuFilter).map(page => {
                  return (
                    <Menu.Item key={`page-${page.id}`}>
                      <Link to={`/backoffice/content/page/${page.id}`}>
                        <span>{page.domain}</span> &raquo; {page.label}
                      </Link>
                    </Menu.Item>
                  );
                })
              : undefined}
          </Menu>
        </Sider>

        <Layout>
          <Switch location={location}>
            <Route
              path="/backoffice/content/page/:id"
              component={PageEditorComponent}
            ></Route>
          </Switch>
        </Layout>
      </Layout>
    </Skeleton>
  );
}
