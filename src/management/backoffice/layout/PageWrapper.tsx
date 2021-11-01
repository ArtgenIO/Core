import { ExclamationCircleOutlined } from '@ant-design/icons';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import Title from 'antd/lib/typography/Title';
import { ReactNode } from 'react';

export default function PageWrapper(props: { children?: ReactNode }) {
  return (
    <ErrorBoundary
      message={
        <>
          <Title level={3}>
            <ExclamationCircleOutlined className="mr-4 text-red-500" /> Sorry
            for this, but something gone wrong!
          </Title>

          <p>
            This error has been reported to our system, we will fix it asap!
            Until that, please try to refresh the page, maybe it's just a one
            time off.
          </p>
        </>
      }
    >
      {props.children}
    </ErrorBoundary>
  );
}
