import * as grpc from '@grpc/grpc-js';
import * as client from 'prom-client';

const rpcRequestsTotal = new client.Counter({
  name: 'grpc_requests_total',
  help: 'Total number of gRPC requests',
  labelNames: ['method', 'status'],
});

const rpcRequestDuration = new client.Histogram({
  name: 'grpc_request_duration_seconds',
  help: 'Duration of gRPC requests in seconds',
  labelNames: ['method'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export function withMetrics<Req, Res>(
  methodName: string,
  handler: any
): any {
  return async (call: grpc.ServerUnaryCall<Req, Res>, callback: grpc.sendUnaryData<Res>) => {
    const endTimer = rpcRequestDuration.labels(methodName).startTimer();

    const interceptedCallback: grpc.sendUnaryData<Res> = (error, value, trailer, flags) => {
      endTimer(); 
      
      const statusCode = error ? error.code || grpc.status.INTERNAL : grpc.status.OK;
      rpcRequestsTotal.labels(methodName, statusCode.toString()).inc(); 

      callback(error, value, trailer, flags);
    };

    await handler(call, interceptedCallback);
  };
}