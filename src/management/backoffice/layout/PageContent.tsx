import { Layout } from 'antd';
import React, { lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import DashboardPage from '../component/dashboard.component';
import Route404 from '../route/404.route';
import PageLoading from './PageLoading';
import PageWrapper from './PageWrapper';

const { Content } = Layout;

export default function PageContent() {
  const location = useLocation();

  return (
    <Content className="overflow-y-auto overflow-x-hidden h-screen scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-400 wave-bg scrollbar-w-2">
      <PageWrapper>
        <Suspense fallback={<PageLoading />}>
          <Switch location={location}>
            <Route
              exact
              path="/backoffice(/index.html)?"
              component={DashboardPage}
            />
            <Route
              path="/backoffice/management/workflow"
              component={lazy(
                () => import('../../workflow/components/index.component'),
              )}
            />
            <Route
              path="/backoffice/content/schema"
              component={lazy(
                () =>
                  import('../../../content/schema/component/index.component'),
              )}
            />
            <Route
              path="/backoffice/content/crud"
              component={lazy(
                () => import('../../../content/crud/component/index.component'),
              )}
            />
            <Route
              path="/backoffice/content/page"
              component={lazy(
                () => import('../../../content/page/component/index.component'),
              )}
            />

            {/* Hygen insert routes above */}
            <Route path="*" component={Route404} />
          </Switch>
        </Suspense>
      </PageWrapper>
    </Content>
  );
}
