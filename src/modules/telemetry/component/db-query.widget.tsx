import { Serie } from '@nivo/line';
import { useEffect } from 'react';
import LoadingComponent from '../../admin/component/loading/loading.component.jsx';
import { generateLineChart } from '../../admin/library/generate-line-chart.jsx';
import { useHttpClient } from '../../admin/library/hook.http-client';

export default function DatabaseQueriesWidget() {
  const [{ data, loading: isLoading }, refetch] = useHttpClient<Serie>(
    '/api/telemetry/serie/db.query',
    {
      useCache: true,
    },
  );

  useEffect(() => {
    const refresh = setInterval(() => refetch(), 60_000);

    return () => {
      clearInterval(refresh);
    };
  }, []);

  return isLoading && !data ? (
    <LoadingComponent />
  ) : (
    generateLineChart({
      label: 'Database Queries',
      serie: data,
      color: '#0b717e',
    })
  );
}
