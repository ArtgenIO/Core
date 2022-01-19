export interface ITelemetryResult {
  node: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
  };
}
