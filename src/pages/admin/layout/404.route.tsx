import { Result } from 'antd';

export default function Route404() {
  return (
    <Result
      status="404"
      title="404 Not Found"
      subTitle="Seems like You are trying to reach a non existing page"
    />
  );
}
