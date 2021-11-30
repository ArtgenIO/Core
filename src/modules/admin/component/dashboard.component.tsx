import {
  AppstoreAddOutlined,
  EllipsisOutlined,
  ReloadOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Alert, Button } from 'antd';
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
      <Alert
        type="info"
        className="mx-2 mb-4"
        icon={<SmileOutlined className="text-xl mr-4" />}
        closable
        showIcon
        message={
          <>
            Artgen Core is in{' '}
            <strong className="font-bold">alpha preview</strong> status, You can
            go around and test the current state, but please don't try to deploy
            it in production environment. If You have any feedback, don't be shy
            to share with us on our GitHub page.
            <br />
            <span className="italic">Have a nice day!</span>
          </>
        }
      />

      <GridLayout
        className="text-center"
        layout={gridState}
        cols={16}
        rowHeight={80}
        width={window.innerWidth - 80}
        onLayoutChange={onLayoutChange}
      >
        <div key="a" className="bg-lightest-dark">
          Placeholder
        </div>
        <div key="b" className="bg-lightest-dark">
          Placeholder
        </div>
        <div key="c" className="bg-lightest-dark">
          Placeholder
        </div>
        <div className="bg-lightest-dark" key="d">
          Placeholder
        </div>
      </GridLayout>
    </PageWithHeader>
  );
}
