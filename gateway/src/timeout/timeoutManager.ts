import * as grpc from '@grpc/grpc-js';

export class TimeoutManager {
  public static generateDeadline(timeoutMs: number): Date {
    return new Date(Date.now() + timeoutMs);
  }

  public static isDeadlineExceeded(call: grpc.ServerUnaryCall<any, any>): boolean {
    return call.cancelled;
  }

  public static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName = 'Operation'
  ): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        const error: any = new Error(`${operationName} timed out after ${timeoutMs}ms`);
        error.code = grpc.status.DEADLINE_EXCEEDED;
        reject(error);
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutHandle);
    });
  }
}