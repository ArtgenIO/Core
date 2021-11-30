import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import '../assets/main.less';
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
