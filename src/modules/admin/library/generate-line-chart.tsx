import { ResponsiveLine, Serie } from '@nivo/line';
import { Empty } from 'antd';

type Line = {
  label: string;
  serie: Serie | null;
  color: string;
};

export const generateLineChart = (line: Line) => {
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
