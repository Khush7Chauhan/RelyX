import * as grpc from '@grpc/grpc-js';

export function withLogging<Req, Res>(
  methodName: string,
  handler: any 
): any {
  return async (call: grpc.ServerUnaryCall<Req, Res>, callback: grpc.sendUnaryData<Res>) => {
    const startTime = Date.now();
    console.log(`[gRPC Request] ${methodName} started`);

    const interceptedCallback: grpc.sendUnaryData<Res> = (error, value, trailer, flags) => {
      const duration = Date.now() - startTime;
      if (error) {
        console.error(`[gRPC Error] ${methodName} failed in ${duration}ms with code ${error.code}`);
      } else {
        console.log(`[gRPC Response] ${methodName} succeeded in ${duration}ms`);
      }
      callback(error, value, trailer, flags);
    };

    try {
      await handler(call, interceptedCallback);
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error(`[gRPC Crash] ${methodName} crashed in ${duration}ms`);
      throw err;
    }
  };
}