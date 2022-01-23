import { ResponsiveLine } from '@nivo/line';
import { useEffect, useState } from 'react';
import { useHttpClient } from '../../admin/library/use-http-client';
import { BucketKey } from '../interface/bucket-key.enum';
import { ITelemetryResult } from '../interface/result.interface';

export default function DatabaseQueriesWidget() {
  const [{ data: response, loading, error }, refetch] =
    useHttpClient<ITelemetryResult>('/api/telemetry', {
      useCache: true,
    });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const refresh = setInterval(() => refetch(), 60_000);

    return () => {
      clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    if (response) {
      setChartData(response.readings.filter(r => r.id === BucketKey.DB_QUERY));
    }
  }, [response]);

  return (
    <ResponsiveLine
      theme={{
        background: '#25272b',
        textColor: '#cfd2d9',
        grid: {
          line: {
            stroke: '#474952',
          },
        },
      }}
      colors={['#0b717e']}
      data={chartData}
      margin={{ top: 12, right: 16, bottom: 32, left: 64 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: true,
        reverse: false,
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 6,
        tickRotation: 0,
        legendPosition: 'middle',
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Database Queries',
        legendOffset: -52,
        legendPosition: 'middle',
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
    />
  );
}
