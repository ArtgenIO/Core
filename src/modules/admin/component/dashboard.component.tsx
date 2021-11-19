import {
  AppstoreAddOutlined,
  EllipsisOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { useRecoilState } from 'recoil';
import PageHeader from '../layout/PageHeader';
import PageWithHeader from '../layout/PageWithHeader';
import { dashboarGridAtom } from './dashboard.atoms';
import './dashboard.component.less';

export default function DashboardPage() {
  const [gridState, setGridState] = useRecoilState(dashboarGridAtom);

  const onLayoutChange = (currentGridState, allLayouts) => {
    if (currentGridState) {
      setGridState(currentGridState);
    }
  };

  useEffect(() => {
    return () => {};
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
        className="text-center"
        layout={gridState}
        cols={16}
        rowHeight={80}
        width={1800}
        onLayoutChange={onLayoutChange}
      >
        <div key="a" className="bg-lightest-dark">
          Custom
        </div>
        <div key="b" className="bg-lightest-dark">
          Widgets
        </div>
        <div key="c" className="bg-lightest-dark">
          Placeholder
        </div>
        <div className="bg-lightest-dark" key="d">
          Coming Soon
        </div>
      </GridLayout>
    </PageWithHeader>
  );
}
