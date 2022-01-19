import { Service } from '../../app/container';
import { ITelemetryResult } from './interface/result.interface';

@Service()
export class TelemetryService {
  protected x = {
    'http.requests': 0,
  };

  increment(key: string, amount: number = 1) {
    this.x[key] += amount;
  }

  getReadings(): ITelemetryResult {
    return {
      node: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      ...this.x,
    };
  }
}
