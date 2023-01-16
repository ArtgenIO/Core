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
          algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
          token: {
            colorPrimary: '#46bdc6',
            colorSuccess: '#52af6a',
            colorWarning: '#ff6b6b',
            colorError: '#c44d58',
            colorInfo: '#46bdc6',
            colorBgBase: '#15171b',
          },
          components: {
            Notification: {
              notificationBg: '#15171b',
              notificationPaddingVertical: 150,
            },
          },
        }}
      >
        <PageComponent />
      </ConfigProvider>
    </BrowserRouter>
  </RecoilRoot>,
);
