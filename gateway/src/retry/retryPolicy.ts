import * as grpc from '@grpc/grpc-js';

export interface RetryPolicy {
  maxRetries: number;
  retryableStatuses: grpc.status[];
  customRetryCondition?: (error: any) => boolean;
}

export const IdempotentRetryPolicy: RetryPolicy = {
  maxRetries: 3,
  retryableStatuses: [
    grpc.status.UNAVAILABLE,
    grpc.status.DEADLINE_EXCEEDED,
    grpc.status.RESOURCE_EXHAUSTED,
    grpc.status.INTERNAL,
  ],
};

export const NonIdempotentRetryPolicy: RetryPolicy = {
  maxRetries: 1,
  retryableStatuses: [
    grpc.status.UNAVAILABLE, 
  ],
};

export const NoRetryPolicy: RetryPolicy = {
  maxRetries: 0,
  retryableStatuses: [],
};

export function isRetryableError(error: any, policy: RetryPolicy): boolean {
  if (!error) return false;
  if (policy.customRetryCondition && policy.customRetryCondition(error)) {
    return true;
  }

  const grpcCode = error.code as grpc.status | undefined;
  if (grpcCode !== undefined && policy.retryableStatuses.includes(grpcCode)) {
    return true;
  }

  return false;
}