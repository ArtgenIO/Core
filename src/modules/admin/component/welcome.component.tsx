import {
  DatabaseOutlined,
  FileOutlined,
  GithubFilled,
  MediumOutlined,
  PartitionOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Alert, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import SystemLoadMonitorWidget from '../../telemetry/component/system-load-monitor.widget';
import PageHeader from '../layout/page-header.component';
import PageWithHeader from '../layout/page-with-header.component';
import './welcome.component.less';

export default function WelcomeComponent() {
  const navigate = useNavigate();

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Welcome - Artisan"
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
                <Button icon={<MediumOutlined />}>Read more in our blog</Button>
              </a>
              <a key="site" href="https://artgen.io/" target="_blank">
                <Button icon={<SmileOutlined />}>Check Out Our Website</Button>
              </a>
            </>
          }
        />
      }
    >
      <Alert
        type="info"
        className="mb-4"
        icon={<SmileOutlined className="text-xl mr-4" />}
        showIcon
        message={
          <>
            Artgen Core is in&nbsp;
            <strong className="font-bold">beta preview</strong> status, You can
            go around and test the current state, but please don't try to deploy
            it in production environment. If You have any feedback, don't be shy
            to share with us on our GitHub page.{' '}
            <i className="bold text-primary-400">Have a nice day!</i>
          </>
        }
      />

      <div className="grid grid-cols-12 grid-rows-2 gap-4">
        <div className="col-span-10" style={{ height: 260 }}>
          <SystemLoadMonitorWidget />
        </div>

        <div className="hello-block col-span-2 !text-justify">
          <b>Hello, Artisan!</b>
          <p>
            This is a placeholder for the dashboard widgets. Take a look around
            and if You find any useful thing, let us know!
          </p>
        </div>

        <div
          className="guide-block"
          onClick={() => navigate('/admin/database/artboard/main')}
        >
          <DatabaseOutlined />
          <h1>Database Manager</h1>
        </div>
        <div
          className="guide-block"
          onClick={() => navigate('/admin/content/main/AccessKey?page=1')}
        >
          <FileOutlined />
          <h1>Content Editor</h1>
        </div>
        <div className="guide-block" onClick={() => navigate('/admin/flow')}>
          <PartitionOutlined />
          <h1>Low Code Logic</h1>
        </div>
      </div>
    </PageWithHeader>
  );
}
