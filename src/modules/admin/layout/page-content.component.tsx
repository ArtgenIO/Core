import { Layout } from 'antd';
import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ADMIN_URL } from '../admin.constants';
import DashboardPage from '../component/dashboard.component';
import Route404 from '../route/404.route';
import PageLoading from './page-loading.component';
import PageWrapper from './page-wrapper.component';

const { Content } = Layout;

export default function PageContent() {
  const Flow = lazy(() => import('../../flow/components/index.component'));

  const Database = lazy(
    () => import('../../database/component/_router.component'),
  );

  const Contents = lazy(
    () => import('../../content/component/index.component'),
  );

  const Page = lazy(() => import('../../page/component/index.component'));

  const Insight = lazy(() => import('../../insight/component/index.component'));

  const Ext = lazy(() => import('../../blueprint/component/_router.component'));

  return (
    <Content className="overflow-y-auto overflow-x-hidden h-screen gray-scroll">
      <PageWrapper>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path={`${ADMIN_URL}`} element={<DashboardPage />} />
            <Route path={`${ADMIN_URL}/flow/*`} element={<Flow />} />
            <Route path={`${ADMIN_URL}/database/*`} element={<Database />} />
            <Route path={`${ADMIN_URL}/content/*`} element={<Contents />} />
            <Route path={`${ADMIN_URL}/page/*`} element={<Page />} />
            <Route path={`${ADMIN_URL}/insight/*`} element={<Insight />} />
            <Route path={`${ADMIN_URL}/ext/*`} element={<Ext />} />

            {/* Hygen insert routes above */}
            <Route path="*" element={<Route404 />} />
          </Routes>
        </Suspense>
      </PageWrapper>
    </Content>
  );
}
