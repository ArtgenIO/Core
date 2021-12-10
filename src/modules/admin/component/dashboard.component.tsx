import { GithubFilled, MediumOutlined, SmileOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import { useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { useRecoilState } from 'recoil';
import PageHeader from '../layout/page-header.component';
import PageWithHeader from '../layout/page-with-header.component';
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
              <a
                key="github"
                href="https://github.com/ArtgenIO/Core"
                target="_blank"
              >
                <Button icon={<GithubFilled />}>Star it on Github ❤️</Button>
              </a>
              <a key="blog" href="https://blog.artgen.io/" target="_blank">
                <Button key="refresh" icon={<MediumOutlined />}>
                  Read more in our blog
                </Button>
              </a>
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
        cols={14}
        rowHeight={80}
        width={window.innerWidth - 100}
        onLayoutChange={onLayoutChange}
      >
        <div key="a" className="bg-midnight-600">
          Placeholder
        </div>
        <div key="b" className="bg-midnight-600">
          Placeholder
        </div>
        <div key="c" className="bg-midnight-600">
          Placeholder
        </div>
        <div className="bg-midnight-600" key="d">
          Placeholder
        </div>
      </GridLayout>
    </PageWithHeader>
  );
}
