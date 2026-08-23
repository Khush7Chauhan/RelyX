import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// 1. Resolve Proto Paths
const PROTO_DIR = path.resolve(__dirname, '../../proto');
const USER_PROTO_PATH = path.join(PROTO_DIR, 'user/user.proto');
const ORDER_PROTO_PATH = path.join(PROTO_DIR, 'order/order.proto');

// 2. Load Protos
const userPackageDef = protoLoader.loadSync(USER_PROTO_PATH, { 
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [PROTO_DIR] 
});
const orderPackageDef = protoLoader.loadSync(ORDER_PROTO_PATH, { 
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [PROTO_DIR] 
});

const userProto = (grpc.loadPackageDefinition(userPackageDef) as any).relayx.user.v1;
const orderProto = (grpc.loadPackageDefinition(orderPackageDef) as any).relayx.order.v1;

// 3. Create Backend Clients (Where the gateway routes traffic to)
// It defaults to localhost for native running, but allows Docker to override via ENV vars
const USER_SVC_URL = process.env.USER_SVC_URL || 'localhost:50051';
const ORDER_SVC_URL = process.env.ORDER_SVC_URL || 'localhost:50053';

const userClient = new userProto.UserService(USER_SVC_URL, grpc.credentials.createInsecure());
const orderClient = new orderProto.OrderService(ORDER_SVC_URL, grpc.credentials.createInsecure());

// 4. Create the Gateway Server
const server = new grpc.Server();

// 5. Define Routing Logic for User Service
server.addService(userProto.UserService.service, {
  CreateUser: (call: any, callback: any) => {
    // Forward the request payload directly to the User Service
    userClient.CreateUser(call.request, (error: any, response: any) => {
      callback(error, response);
    });
  },
  GetUser: (call: any, callback: any) => {
    userClient.GetUser(call.request, (error: any, response: any) => {
      callback(error, response);
    });
  }
});

// 6. Define Routing Logic for Order Service
server.addService(orderProto.OrderService.service, {
  CreateOrder: (call: any, callback: any) => {
    // Forward the request payload directly to the Order Service
    orderClient.CreateOrder(call.request, (error: any, response: any) => {
      callback(error, response);
    });
  },
  ListOrders: (call: any, callback: any) => {
    orderClient.ListOrders(call.request, (error: any, response: any) => {
      callback(error, response);
    });
  }
});

// 7. Start the Gateway
const PORT = process.env.PORT || '5000';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Gateway failed to start:', err);
    return;
  }
  console.log(`Gateway running at 0.0.0.0:${port}`);
});