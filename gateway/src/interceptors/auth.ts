import * as grpc from '@grpc/grpc-js';
export function withAuth<Req, Res>(handler: any): any {
  return async (call: grpc.ServerUnaryCall<Req, Res>, callback: grpc.sendUnaryData<Res>) => {
    const metadata = call.metadata;
    const authHeaders = metadata.get('authorization');

    if (!authHeaders || authHeaders.length === 0) {
      return callback(
        {
          code: grpc.status.UNAUTHENTICATED,
          message: 'Missing authorization metadata',
          name: 'AuthError'
        },
        null
      );
    }

    const token = authHeaders[0] as string;
    if (!token.startsWith('Bearer ') || token.split(' ')[1] !== 'valid-secret-token') {
      return callback(
        {
          code: grpc.status.PERMISSION_DENIED,
          message: 'Invalid authorization token',
          name: 'AuthError'
        },
        null
      );
    }

    await handler(call, callback);
  };
}