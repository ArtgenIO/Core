import 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import PageComponent from '../src/view/layout/page.component';
import './style/main.less';

window.global = window;

createRoot(document.getElementById('app')).render(
  <RecoilRoot>
    <BrowserRouter basename="/admin">
      <PageComponent />
    </BrowserRouter>
  </RecoilRoot>,
);
