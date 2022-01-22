import { Serie } from '@nivo/line';

export interface ITelemetryResult {
  node: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
  };
  readings: Serie[];
}
