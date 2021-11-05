import {
  AppstoreAddOutlined,
  ArrowUpOutlined,
  EllipsisOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ResponsiveLine } from '@nivo/line';
import { Button, Statistic } from 'antd';
import { useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { breadcrumbsAtom } from '../backoffice.atoms';
import PageHeader from '../layout/PageHeader';
import PageWithHeader from '../layout/PageWithHeader';
import { dashboarGridAtom } from './dashboard.atoms';
import './dashboard.component.less';

function DataWidget({ id, backgroundColor }) {
  return (
    <div
      style={{ width: '100%', height: '100%', backgroundColor }}
      className="text-center text-2xl"
    >
      Data Widget [{id}]
    </div>
  );
}

export default function DashboardPage() {
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);
  const resetBreadcrumb = useResetRecoilState(breadcrumbsAtom);
  const [gridState, setGridState] = useRecoilState(dashboarGridAtom);

  const onLayoutChange = (currentGridState, allLayouts) => {
    if (currentGridState) {
      setGridState(currentGridState);
      console.log(currentGridState);
    }
  };

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
      header={
        <PageHeader
          title="Dashboard"
          subTitle="Welcome Artisan!"
          actions={
            <>
              <Button key="add" icon={<AppstoreAddOutlined />}>
                Add Chart
              </Button>
              <Button key="refresh" icon={<ReloadOutlined />}>
                Refresh
              </Button>
              <Button
                key="configure"
                icon={<EllipsisOutlined />}
                ghost
              ></Button>
            </>
          }
        />
      }
    >
      <GridLayout
        className=""
        layout={gridState}
        cols={16}
        rowHeight={80}
        width={1800}
        onLayoutChange={onLayoutChange}
      >
        <div key="a" className="bg-lightest-dark p-8">
          <Statistic
            title="Active"
            value={11.28}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            prefix={<ArrowUpOutlined />}
            suffix="%"
          />
        </div>
        <div key="b">
          <DataWidget id="b" backgroundColor="#37393f" />
        </div>
        <div key="c" className="bg-lightest-dark">
          <ResponsiveLine
            data={[
              {
                id: 'japan',
                color: 'hsl(6, 70%, 50%)',
                data: [
                  {
                    x: 'plane',
                    y: 79,
                  },
                  {
                    x: 'helicopter',
                    y: 157,
                  },
                  {
                    x: 'boat',
                    y: 78,
                  },
                  {
                    x: 'train',
                    y: 252,
                  },
                  {
                    x: 'subway',
                    y: 208,
                  },
                  {
                    x: 'bus',
                    y: 165,
                  },
                  {
                    x: 'car',
                    y: 195,
                  },
                  {
                    x: 'moto',
                    y: 110,
                  },
                  {
                    x: 'bicycle',
                    y: 116,
                  },
                  {
                    x: 'horse',
                    y: 233,
                  },
                  {
                    x: 'skateboard',
                    y: 175,
                  },
                  {
                    x: 'others',
                    y: 84,
                  },
                ],
              },
              {
                id: 'france',
                color: 'hsl(78, 70%, 50%)',
                data: [
                  {
                    x: 'plane',
                    y: 279,
                  },
                  {
                    x: 'helicopter',
                    y: 24,
                  },
                  {
                    x: 'boat',
                    y: 60,
                  },
                  {
                    x: 'train',
                    y: 39,
                  },
                  {
                    x: 'subway',
                    y: 132,
                  },
                  {
                    x: 'bus',
                    y: 86,
                  },
                  {
                    x: 'car',
                    y: 224,
                  },
                  {
                    x: 'moto',
                    y: 210,
                  },
                  {
                    x: 'bicycle',
                    y: 51,
                  },
                  {
                    x: 'horse',
                    y: 103,
                  },
                  {
                    x: 'skateboard',
                    y: 234,
                  },
                  {
                    x: 'others',
                    y: 204,
                  },
                ],
              },
              {
                id: 'us',
                color: 'hsl(93, 70%, 50%)',
                data: [
                  {
                    x: 'plane',
                    y: 196,
                  },
                  {
                    x: 'helicopter',
                    y: 4,
                  },
                  {
                    x: 'boat',
                    y: 88,
                  },
                  {
                    x: 'train',
                    y: 278,
                  },
                  {
                    x: 'subway',
                    y: 299,
                  },
                  {
                    x: 'bus',
                    y: 78,
                  },
                  {
                    x: 'car',
                    y: 282,
                  },
                  {
                    x: 'moto',
                    y: 259,
                  },
                  {
                    x: 'bicycle',
                    y: 47,
                  },
                  {
                    x: 'horse',
                    y: 196,
                  },
                  {
                    x: 'skateboard',
                    y: 114,
                  },
                  {
                    x: 'others',
                    y: 161,
                  },
                ],
              },
              {
                id: 'germany',
                color: 'hsl(262, 70%, 50%)',
                data: [
                  {
                    x: 'plane',
                    y: 199,
                  },
                  {
                    x: 'helicopter',
                    y: 48,
                  },
                  {
                    x: 'boat',
                    y: 133,
                  },
                  {
                    x: 'train',
                    y: 108,
                  },
                  {
                    x: 'subway',
                    y: 67,
                  },
                  {
                    x: 'bus',
                    y: 2,
                  },
                  {
                    x: 'car',
                    y: 77,
                  },
                  {
                    x: 'moto',
                    y: 169,
                  },
                  {
                    x: 'bicycle',
                    y: 239,
                  },
                  {
                    x: 'horse',
                    y: 195,
                  },
                  {
                    x: 'skateboard',
                    y: 294,
                  },
                  {
                    x: 'others',
                    y: 54,
                  },
                ],
              },
              {
                id: 'norway',
                color: 'hsl(147, 70%, 50%)',
                data: [
                  {
                    x: 'plane',
                    y: 211,
                  },
                  {
                    x: 'helicopter',
                    y: 226,
                  },
                  {
                    x: 'boat',
                    y: 283,
                  },
                  {
                    x: 'train',
                    y: 162,
                  },
                  {
                    x: 'subway',
                    y: 257,
                  },
                  {
                    x: 'bus',
                    y: 162,
                  },
                  {
                    x: 'car',
                    y: 258,
                  },
                  {
                    x: 'moto',
                    y: 131,
                  },
                  {
                    x: 'bicycle',
                    y: 108,
                  },
                  {
                    x: 'horse',
                    y: 147,
                  },
                  {
                    x: 'skateboard',
                    y: 140,
                  },
                  {
                    x: 'others',
                    y: 113,
                  },
                ],
              },
            ]}
            margin={{ top: 30, right: 50, bottom: 30, left: 30 }}
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
              legend: 'transportation',
              legendOffset: 36,
              legendPosition: 'middle',
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'count',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            lineWidth={2}
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
        <div key="d">
          <DataWidget id="d" backgroundColor="#37393f" />
        </div>
      </GridLayout>
    </PageWithHeader>
  );
}
