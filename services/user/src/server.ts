import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { userRepository } from './repository/userRepository';
import { UserService } from './service/userService';
import { UserHandler } from './handler/userHandler';

// Path resolution from services/user/src/server.ts to proto/user/user.proto
const PROTO_DIR = path.resolve(__dirname, '../../../proto');
const USER_PROTO_PATH = path.join(PROTO_DIR, 'user/user.proto');

// 1. Load the Protocol Buffer definitions
const packageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR], // Tells the loader where to find common/common.proto
});

const userProtoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const userPackage = userProtoDescriptor.relayx.user.v1;

async function main() {
  // 2. Initialize the Dependency Injection tree
  const repository = new userRepository();
  const service = new UserService(repository);
  const handler = new UserHandler(service);

  // 3. Create the gRPC Server
  const server = new grpc.Server();

  // 4. Map the RPC methods to your handler implementation
  server.addService(userPackage.UserService.service, {
    // Map the method defined in userHandler.ts
    GetUser: handler.GetUser,
    
    // Inline implementation for CreateUser (can also be moved to UserHandler)
    CreateUser: async (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ) => {
      try {
        const { username, email } = call.request;
        const user = await service.createUser(username, email);
        callback(null, user);
      } catch (error) {
        callback({ code: grpc.status.INTERNAL, message: 'Failed to create user' }, null);
      }
    },

    // Health Check Endpoint (Required by Gateway's HealthAwareLoadBalancer)
    CheckHealth: (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ) => {
      // 1 maps to SERVING in common.proto HealthStatus enum
      callback(null, { status: 1 }); 
    },
  });

  // 5. Bind and start the server
  const port = process.env.USER_SVC_PORT || '50051';
  const address = `0.0.0.0:${port}`;

  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('Failed to bind User Service:', err);
        return;
      }
      console.log(`User Service running at ${address}`);
    }
  );
}

main();