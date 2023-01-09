import { Layout } from 'antd';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Route404 from './404.route';
import LoadingComponent from './loading/loading.component.jsx';

const { Content } = Layout;

export default function PageContent() {
  const Flow = lazy(() => import('../components/flow/_router.component'));
  const Database = lazy(
    () => import('../components/database/_router.component'),
  );
  const Contents = lazy(() => import('../components/cms/_router.component'));
  const Apps = lazy(() => import('../components/blueprint/_router.component'));
  const Dashboard = lazy(
    () => import('../components/dashboard/dashboard.component'),
  );
  const Page = lazy(() => import('../components/page/_router.component'));
  const Analytics = lazy(
    () => import('../components/analytics/_index.component'),
  );

  const Develop = lazy(() => import('../components/develop/_router.component'));
  const FormRouter = lazy(() => import('../components/form/_router.component'));

  return (
    <Content className="overflow-y-auto overflow-x-hidden h-screen gray-scroll">
      <Suspense fallback={<LoadingComponent />}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/flow/*" element={<Flow />} />
          <Route path="/database/*" element={<Database />} />
          <Route path="/content/*" element={<Contents />} />
          <Route path="/cloud-store/*" element={<Apps />} />
          <Route path="/page/*" element={<Page />} />
          <Route path="/form/*" element={<FormRouter />} />
          <Route path="/analytics/*" element={<Analytics />} />
          <Route path="/develop/*" element={<Develop />} />

          <Route path="/sign-in" element={<Navigate to="/" />} />
          <Route path="/sign-up" element={<Navigate to="/" />} />

          <Route path="*" element={<Route404 />} />
        </Routes>
      </Suspense>
    </Content>
  );
}
