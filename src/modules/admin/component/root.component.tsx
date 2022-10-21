import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import PageComponent from '../layout/page.component';

export default function Root() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <PageComponent />
      </BrowserRouter>
    </RecoilRoot>
  );
}
