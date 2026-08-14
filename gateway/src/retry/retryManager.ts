import * as grpc from '@grpc/grpc-js';
import { Backoff } from './backoff';

export interface RetryPolicy {
  maxRetries: number;
  retryableStatuses: grpc.status[];
}

export class RetryManager {
  private backoff: Backoff;
  private defaultPolicy: RetryPolicy;

  constructor(
    initialDelayMs: number,
    maxDelayMs: number,
    factor: number,
    defaultPolicy?: Partial<RetryPolicy>
  ) {
    this.backoff = new Backoff(initialDelayMs, maxDelayMs, factor);
    this.defaultPolicy = {
      maxRetries: defaultPolicy?.maxRetries ?? 3,
      retryableStatuses: defaultPolicy?.retryableStatuses ?? [
        grpc.status.UNAVAILABLE,
        grpc.status.DEADLINE_EXCEEDED,
        grpc.status.RESOURCE_EXHAUSTED,
      ],
    };
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    policy: Partial<RetryPolicy> = {}
  ): Promise<T> {
    const effectivePolicy = { ...this.defaultPolicy, ...policy };
    let attempt = 0;

    while (attempt <= effectivePolicy.maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        const grpcCode = error?.code as grpc.status | undefined;
        const isRetryable =
          grpcCode !== undefined &&
          effectivePolicy.retryableStatuses.includes(grpcCode);

        if (attempt >= effectivePolicy.maxRetries || !isRetryable) {
          throw error;
        }

        const delay = this.backoff.getDelay(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
      }
    }

    throw new Error('Exceeded maximum retry attempts');
  }
}