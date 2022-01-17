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
        className="mb-4"
        icon={<SmileOutlined className="text-xl mr-4" />}
        showIcon
        message={
          <>
            Artgen Core is in&nbsp;
            <strong className="font-bold">beta preview</strong> status, You can
            go around and test the current state, but please don't try to deploy
            it in production environment. If You have any feedback, don't be shy
            to share with us on our GitHub page.
            <br />
            <span className="italic">Have a nice day!</span>
          </>
        }
      />

      <div className="welcome-grid">
        <div onClick={() => navigate('/admin/database/artboard/main')}>
          <DatabaseOutlined />
          <h1>Database Manager</h1>
        </div>
        <div onClick={() => navigate('/admin/content/main/AccessKey?page=1')}>
          <FileOutlined />
          <h1>Content Editor</h1>
        </div>
        <div onClick={() => navigate('/admin/flow')}>
          <PartitionOutlined />
          <h1>Low Code Logic</h1>
        </div>
      </div>
    </PageWithHeader>
  );
}
