import { useEffect } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { breadcrumbsAtom } from '../backoffice.atoms';
import PageHeader from '../layout/PageHeader';
import PageWithHeader from '../layout/PageWithHeader';

export default function DashboardPage() {
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);
  const resetBreadcrumb = useResetRecoilState(breadcrumbsAtom);

  useEffect(() => {
    setBreadcrumb(routes =>
      routes.concat({
        breadcrumbName: 'Dashboard',
        path: '',
      }),
    );

    return () => {
      resetBreadcrumb();
    };
  }, []);

  return (
    <PageWithHeader
      header={<PageHeader title="Dashboard" subTitle="Poc is Love!" />}
    >
      <div className="content-box">
        <h1 className="text-4xl font-thin text-center py-24">
          Welcome, <span className="text-success">Artisan</span>!
        </h1>
      </div>
      <div style={{ height: '8000px' }}></div>
    </PageWithHeader>
  );
}
