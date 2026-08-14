export class Backoff {
  constructor(
    private initialDelayMs: number,
    private maxDelayMs: number,
    private factor: number
  ) {}

  public getDelay(attempt: number): number {
    const exponentialLimit = Math.min(
      this.maxDelayMs,
      this.initialDelayMs * Math.pow(this.factor, attempt)
    );
    return Math.floor(Math.random() * exponentialLimit);
  }
}