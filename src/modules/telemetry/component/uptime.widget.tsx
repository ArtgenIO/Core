import { Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ITelemetryResult } from '../interface/result.interface';

export default function UptimeWidget() {
  const [{ data: response }] = useHttpClient<ITelemetryResult>(
    '/api/telemetry',
    {
      useCache: true,
    },
  );

  const [uptime, setUptime] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setUptime(u => u + 0.1), 100);

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (response) {
      setUptime(response.node.uptime);
    }
  }, [response]);

  return (
    <Statistic
      title="System Uptime"
      precision={1}
      value={uptime}
      className="py-8"
      suffix="seconds"
    />
  );
}
