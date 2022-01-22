const MAX_DP = 24;

export class Bucket {
  public measurments: number[] = Array.from(Array(MAX_DP - 1)).map(() => 0);
  public hits: number = 0;

  constructor() {}

  hit(times: number): void {
    this.hits += times;
  }

  summarize() {
    this.measurments.shift();
    this.measurments.push(this.hits);
    this.hits = 0;
  }
}
