import { Serie } from '@nivo/line';
import dayjs from 'dayjs';
import { ILogger, Logger, Service } from '../../app/container';
import { BucketKey } from './interface/bucket-key.enum';
import { ITelemetryResult } from './interface/result.interface';
import { Bucket } from './library/bucket';

@Service()
export class TelemetryService {
  protected tick: NodeJS.Timer;
  protected buckets: Map<BucketKey, Bucket> = new Map();
  protected tickNth = 0;

  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {
    this.tick = setInterval(() => {
      this.buckets.forEach(b => b.summarize());
      this.logger.info('Tick [%d]', ++this.tickNth);
    }, 3_600_000);

    // Init the buckets
    this.buckets.set(BucketKey.HTTP_REQUEST, new Bucket());
    this.buckets.set(BucketKey.DB_QUERY, new Bucket());
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
