import { describe, it, expect, vi } from 'vitest';
import { RetryManager } from '../../gateway/src/retry/retryManager';
import * as grpc from '@grpc/grpc-js';

describe('Gateway Reliability: Retry Manager', () => {
  it('should retry a transient UNAVAILABLE error using exponential backoff', async () => {
    const retryManager = new RetryManager(10, 50, 2);
    let attempts = 0;
    const mockOperation = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 3) {
        const err: any = new Error('Connection refused');
        err.code = grpc.status.UNAVAILABLE;
        throw err;
      }
      return 'SUCCESS';
    });

    const result = await retryManager.executeWithRetry(mockOperation);

    expect(result).toBe('SUCCESS');
    expect(attempts).toBe(3);
    expect(mockOperation).toHaveBeenCalledTimes(3);
  });

  it('should immediately fail on non-retryable errors (e.g., INVALID_ARGUMENT)', async () => {
    const retryManager = new RetryManager(10, 50, 2);
    
    const mockOperation = vi.fn().mockImplementation(async () => {
      const err: any = new Error('Bad Request');
      err.code = grpc.status.INVALID_ARGUMENT;
      throw err;
    });

    await expect(retryManager.executeWithRetry(mockOperation)).rejects.toThrow('Bad Request');
    expect(mockOperation).toHaveBeenCalledTimes(1); // Should not retry
  });
});