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
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#46bdc6',
            colorLink: '#46bdc6',
            colorInfo: '#46bdc6',
            colorSuccess: '#52af6a',
            colorWarning: '#ff6b6b',
            colorError: '#c44d58',
            colorText: '#b5b9c2',
          },
        }}
      >
        <PageComponent />
      </ConfigProvider>
    </BrowserRouter>
  </RecoilRoot>,
);
