import { ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';
import 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import PageComponent from './layout/page.component';
import './style/main.less';

window.global = window;

createRoot(document.getElementById('app')).render(
  <RecoilRoot>
    <BrowserRouter basename="/admin">
      <ConfigProvider
        theme={{
          algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
          token: {
            colorPrimary: '#46bdc6',
            colorText: '#25272b',
          },
        }}
      >
        <PageComponent />
      </ConfigProvider>
    </BrowserRouter>
  </RecoilRoot>,
);
