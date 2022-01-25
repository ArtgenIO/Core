import { Alert } from 'antd';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';

export default function AnalyticsInsightComponent() {
  return (
    <PageWithHeader header={<PageHeader title="Analytics" />}>
      <Alert
        type="info"
        message={`Analytics will arrive in the beta phase when we finalize the implementation of the filtering standards.`}
      />
    </PageWithHeader>
  );
}
