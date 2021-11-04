import { Layout, Menu } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { useEffect } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import {
  animatedLoadingAtom,
  breadcrumbsAtom,
} from '../../../management/backoffice/backoffice.atoms';
import { useHttpClient } from '../../../management/backoffice/library/http-client';
import { ISchema } from '../../schema';
import { schemasAtom } from '../../schema/schema.atoms';
import CrudCreateComponent from './create.component';
import CrudListComponent from './list.component';
import CrudUpdateComponent from './update.component';

export default function CrudIndexComponent() {
  const location = useLocation();
  const history = useHistory();
  const [schemas, setSchemas] = useRecoilState(schemasAtom);
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);
  const httpClient = useHttpClient();
  const setAnimateLoading = useSetRecoilState(animatedLoadingAtom);
  const resetAnimateLoading = useResetRecoilState(animatedLoadingAtom);

  useEffect(() => {
    setAnimateLoading(false);

    httpClient.get<ISchema[]>('/api/$system/content/schema').then(response => {
      setSchemas(() => response.data);

      if (location.pathname === '/backoffice/content/crud') {
        history.push(`/backoffice/content/crud/${response.data[0].id}`);
      }
    });

    setBreadcrumb(routes =>
      routes.concat({
        breadcrumbName: 'CRUD',
        path: 'content/crud',
      }),
    );

    return () => {
      setBreadcrumb(routes => routes.slice(0, routes.length - 1));
      // resetAnimateLoading();
    };
  }, [location]);

  return (
    <Layout hasSider>
      <Sider collapsible={false} width={200} className="h-screen bg-gray">
        <Menu
          key="menus"
          className="menu"
          theme="dark"
          defaultSelectedKeys={[]}
          mode="inline"
          triggerSubMenuAction="hover"
        >
          {schemas.map((schema, x) => {
            return (
              <Menu.Item key={`schema-${schema.id}`}>
                <Link to={`/backoffice/content/crud/${schema.id}`}>
                  {schema.label}
                </Link>
              </Menu.Item>
            );
          })}
        </Menu>
      </Sider>

      <Layout>
        <Switch location={location}>
          <Route exact path="/backoffice/content/crud">
            <h1>Loading content schemas...</h1>
          </Route>
          <Route
            path="/backoffice/content/crud/:schema/update/:record"
            component={CrudUpdateComponent}
          ></Route>
          <Route
            path="/backoffice/content/crud/:id/create"
            component={CrudCreateComponent}
          ></Route>
          <Route
            path="/backoffice/content/crud/:id"
            component={CrudListComponent}
          ></Route>
        </Switch>
      </Layout>
    </Layout>
  );
}
