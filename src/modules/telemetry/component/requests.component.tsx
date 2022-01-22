import { ResponsiveLine } from '@nivo/line';
import { useEffect, useState } from 'react';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ITelemetryResult } from '../interface/result.interface';

export default function RequestWidget() {
  const [{ data: response, loading, error }, refetch] =
    useHttpClient<ITelemetryResult>('/api/telemetry');

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const refresh = setInterval(() => refetch(), 10_000);

    return () => {
      clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    if (response) {
      setChartData(response.readings);
    }
  }, [response]);

  return (
    <>
      <div className="bg-midnight-900 rounded-t-md font-header text-lg indent-4 py-1 text-midnight-50">
        Telemetry - System Load
      </div>

      <div className="bg-midnight-700 rounded-md-b" style={{ height: 280 }}>
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
          colors={[
            '#fafa6e',
            '#77d183',
            '#009c8f',
            '#0b717e',
            '#1c6373',
            '#255566',
            '#2a4858',
          ]}
          data={chartData}
          margin={{ top: 12, right: 112, bottom: 32, left: 64 }}
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
            legend: 'System Load',
            legendOffset: -40,
            legendPosition: 'middle',
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      </div>
    </>
  );
}
