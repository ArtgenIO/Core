import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import '../assets/antd.less';
import '../assets/main.css';
import PageComponent from '../layout/Page';

export default function Root() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <PageComponent />
      </BrowserRouter>
    </RecoilRoot>
  );
}
