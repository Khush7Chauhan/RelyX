import * as grpc from '@grpc/grpc-js';

type UnaryHandler<Req, Res> = (
  call: grpc.ServerUnaryCall<Req, Res>,
  callback: grpc.sendUnaryData<Res>
) => Promise<void> | void;

export function withErrorHandler<Req, Res>(
  handler: UnaryHandler<Req, Res>
): UnaryHandler<Req, Res> {
  return async (call, callback) => {
    try {
      await handler(call, callback);
    } catch (error: any) {
      console.error(`[ErrorInterceptor] Unhandled Error:`, error);
      const errorMetadata = new grpc.Metadata();

      const grpcError: grpc.ServiceError = {
        name: 'ServiceError',
        message: error.message || 'Internal Server Error',
        code: error.code || grpc.status.INTERNAL,
        details: 'An unexpected error occurred in the gateway routing layer.',
        metadata: errorMetadata, 
      };

      callback(grpcError, null);
    }
  };
}