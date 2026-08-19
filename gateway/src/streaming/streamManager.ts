import { activeStreamsGauge } from '../observability/metrics';
import { logger } from '../observability/logger';

export class StreamManager {
  private activeStreams = new Map<string, any>();

  public registerStream(streamId: string, stream: any): void {
    this.activeStreams.set(streamId, stream);
    activeStreamsGauge.inc();
    logger.info({ streamId }, 'New stream connection registered');
  }

  public unregisterStream(streamId: string): void {
    if (this.activeStreams.has(streamId)) {
      this.activeStreams.delete(streamId);
      activeStreamsGauge.dec();
      logger.info({ streamId }, 'Stream connection closed and unregistered');
    }
  }

  public getActiveStreamCount(): number {
    return this.activeStreams.size;
  }
}