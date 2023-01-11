import { ILogger, Logger, Service } from '@hisorange/kernel';
import { Serie } from '@nivo/line';
import dayjs from 'dayjs';
import { Bucket } from '../library/bucket';
import { BucketKey } from '../types/bucket-key.enum';
import { ITelemetryResult } from '../types/telemtry-result.interface';

@Service()
export class TelemetryService {
  protected tick: NodeJS.Timer;
  protected buckets: Map<BucketKey, Bucket> = new Map();
  protected tickNth = 0;

  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {
    if (process.env.NODE_ENV !== 'test') {
      this.tick = setInterval(() => {
        this.buckets.forEach(b => b.summarize());
        this.logger.info('Tick [%d]', ++this.tickNth);
      }, 3_600_000);
    }

    // Init the buckets
    this.buckets.set(BucketKey.HTTP_REQUEST, new Bucket());
    this.buckets.set(BucketKey.DB_QUERY, new Bucket());
    this.buckets.set(BucketKey.FLOW_EXEC, new Bucket());
  }

  clearTick() {
    if (this.tick) {
      clearTimeout(this.tick);
    }
  }

  record(key: BucketKey, amount: number = 1) {
    this.buckets.get(key).hit(amount);
  }

  getReadings(): ITelemetryResult {
    const readings: Serie[] = [];
    const now = dayjs();
    const y0 = now.format('HH:mm');
    const xs = Array.from(Array(24)).map((v, i) =>
      now.subtract(i + 1, 'hour').format('HH:mm'),
    );

    this.buckets.forEach((bucket, id) => {
      const data: Serie['data'] = [
        {
          x: y0,
          y: bucket.hits,
        },
      ];

      bucket.measurments.forEach((m, i) =>
        data.push({
          x: xs[i],
          y: m,
        }),
      );

      readings.push({
        id: id,
        data: data.reverse(),
      });
    });

    return {
      node: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      readings,
    };
  }
}
