import { ResponsiveLine, Serie } from '@nivo/line';
import { random } from 'lodash';
import { useEffect, useState } from 'react';

const _3np1 = (number: number): number => {
  if (number === 1) return number;

  let _n: number;

  if (number % 2 === 0) {
    _n = number / 2;
  } else {
    _n = number * 3 + 1;
  }
  return _n;
};

const getData = () => {
  const data: Serie[] = [];
  const dp = 5;
  const steps = 20;
  const b = random(100, 500);
  const rands: number[] = Array.from(Array(dp))
    .map(() => random(b, b * 2))
    .map(r => random(r, Math.round(r * 1.5)));
  let id = 0;

  for (const r of rands) {
    let x = 0;
    let y = r;
    const s: Serie['data'] = [];

    while (x++ != steps) {
      y = _3np1(y);

      s.push({
        x,
        y: r === y ? y++ : y,
      });
    }

    data.push({
      id: 'Serie ' + id++,
      data: s.reverse(),
    });
  }

  return data;
};

export default function RequestWidget() {
  const [data, setData] = useState(getData());

  useEffect(() => {
    const timer = setInterval(() => setData(getData()), 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);

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
            '#d7f171',
            '#b5e877',
            '#95dd7d',
            '#77d183',
            '#5bc489',
            '#3fb78d',
            '#23aa8f',
            '#009c8f',
            '#008d8c',
            '#007f86',
            '#0b717e',
            '#1c6373',
            '#255566',
            '#2a4858',
          ]}
          data={data}
          margin={{ top: 16, right: 96, bottom: 48, left: 64 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Random 3n+1',
            legendOffset: 36,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Reverse',
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
