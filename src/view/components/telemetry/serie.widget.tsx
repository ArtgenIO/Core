import { ResponsiveLine, Serie } from '@nivo/line';
import { Button, Drawer, Empty, Input, message, Select } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { IBaseWidgetProps } from '../../../types/base-widget.type.js';
import { dashboardsAtom } from '../../atoms/dashboard.atom.jsx';
import LoadingComponent from '../../layout/loading/loading.component.jsx';
import { useHttpClientSimple } from '../../library/simple.http-client.js';

type Line = {
  label: string;
  serie: Serie | null;
  color: string;
};

const generateLineChart = (line: Line) => {
  if (!line.serie) {
    return <Empty description="Not Configured" className="py-4" />;
  }

  return (
    <ResponsiveLine
      theme={{
        background: '#25272B',
        textColor: '#cfd2d9',
        grid: {
          line: {
            stroke: '#474952',
          },
        },
      }}
      colors={[line.color]}
      data={[line.serie]}
      margin={{ top: 16, right: 16, bottom: 32, left: 64 }}
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
        legend: line.label,
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
};

type WidgetConfig = {
  legend: string;
  serie: string;
  color: string;
  refresh: number;
};

export default function TelemetrySerieWidget({
  id,
  config,
  openConfig,
  setOpenConfig,
}: IBaseWidgetProps<WidgetConfig>) {
  const [series, setSeries] = useState<Serie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const client = useHttpClientSimple();
  const setDasboards = useSetRecoilState(dashboardsAtom);

  const [serieKey, setSerieKey] = useState(config.serie);
  const [legend, setLegend] = useState(config.legend);
  const [color, setColor] = useState(config.color);

  const fetchSerie = () => {
    if (config.serie && !isLoading) {
      setIsLoading(true);

      client
        .get(`/api/telemetry/serie/${config.serie}`)
        .then(response => setSeries(response.data))
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (config.serie) {
      fetchSerie();
    }
  }, [config]);

  useEffect(() => {
    const refresh = setInterval(
      () => fetchSerie(),
      Math.max(config?.refresh ?? 60, 1) * 1_000,
    );

    return () => {
      clearInterval(refresh);
    };
  }, []);

  const widgetContent = !config?.serie ? (
    <Empty description="Not Configured" className="py-4" />
  ) : isLoading && !series ? (
    <LoadingComponent />
  ) : (
    generateLineChart({
      label: legend,
      serie: series,
      color,
    })
  );

  return (
    <>
      {widgetContent}
      {openConfig && (
        <Drawer
          open
          width="40%"
          onClose={() => setOpenConfig(false)}
          title="Configure Widget"
          footer={
            <Button
              block
              className="success"
              onClick={() => {
                setDasboards(oldState => {
                  const newState = cloneDeep(oldState);

                  for (const dashboard of newState) {
                    const thisWidget = dashboard.widgets.find(
                      widget => widget.i === id,
                    );

                    if (thisWidget) {
                      (thisWidget.widget.config as WidgetConfig) = {
                        legend,
                        color,
                        serie: serieKey,
                        refresh: config.refresh,
                      };
                      break;
                    }
                  }

                  return newState;
                });

                setOpenConfig(false);

                message.success('Widget configration updated');
              }}
            >
              Save Changes
            </Button>
          }
        >
          <Select
            className="w-full"
            placeholder="Select Serie"
            value={serieKey}
            onSelect={(value: string) => setSerieKey(value)}
            options={[
              {
                label: 'HTTP Requests',
                value: 'http.request',
              },
              {
                label: 'Database Queries',
                value: 'db.query',
              },
              {
                label: 'Flow Executions',
                value: 'flow.execution',
              },
            ]}
          />

          <Input
            value={legend}
            onChange={e => setLegend(e.target.value)}
            placeholder="Legend"
          />

          <Input
            value={color}
            onChange={e => setColor(e.target.value)}
            placeholder="Color"
          />
        </Drawer>
      )}
    </>
  );
}
