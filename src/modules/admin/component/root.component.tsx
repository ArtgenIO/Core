import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import PageComponent from '../layout/page.component';

export default function RootComponent() {
  return (
    <RecoilRoot>
      <BrowserRouter basename="/admin">
        <PageComponent />
      </BrowserRouter>
    </RecoilRoot>
  );
}
