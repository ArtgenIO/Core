import { Layout } from 'antd';
import React, { lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { ADMIN_URL } from '../admin.constants';
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
              path={`${ADMIN_URL}(/index.html)?`}
              component={DashboardPage}
            />
            <Route
              path={`${ADMIN_URL}/workflow`}
              component={lazy(
                () => import('../../flow/components/index.component'),
              )}
            />
            <Route
              path={`${ADMIN_URL}/database`}
              component={lazy(
                () => import('../../database/component/_router.component'),
              )}
            />
            <Route
              path={`${ADMIN_URL}/content`}
              component={lazy(
                () => import('../../content/component/index.component'),
              )}
            />
            <Route
              path={`${ADMIN_URL}/page`}
              component={lazy(
                () => import('../../page/component/index.component'),
              )}
            />
            <Route
              path={`${ADMIN_URL}/analytics`}
              component={lazy(
                () => import('../../insight/component/index.component'),
              )}
            />
            <Route
              path={`${ADMIN_URL}/ext`}
              component={lazy(
                () => import('../../blueprint/component/_router.component'),
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
