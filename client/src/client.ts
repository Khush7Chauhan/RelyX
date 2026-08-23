import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import util from 'util';

// 1. Load Protobuf Definitions
const PROTO_DIR = path.resolve(__dirname, '../../proto');

const userPackageDef = protoLoader.loadSync(path.join(PROTO_DIR, 'user/user.proto'), {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [PROTO_DIR]
});
const orderPackageDef = protoLoader.loadSync(path.join(PROTO_DIR, 'order/order.proto'), {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [PROTO_DIR]
});

const userProto = (grpc.loadPackageDefinition(userPackageDef) as any).relayx.user.v1;
const orderProto = (grpc.loadPackageDefinition(orderPackageDef) as any).relayx.order.v1;

// 2. Point the client to the GATEWAY, not the underlying services
const GATEWAY_ADDRESS = 'localhost:5000';

const userClient = new userProto.UserService(
  GATEWAY_ADDRESS,
  grpc.credentials.createInsecure()
);

const orderClient = new orderProto.OrderService(
  GATEWAY_ADDRESS,
  grpc.credentials.createInsecure()
);

// Promisify gRPC methods for cleaner async/await syntax
const createUser = util.promisify(userClient.CreateUser).bind(userClient);
const getUser = util.promisify(userClient.GetUser).bind(userClient);
const createOrder = util.promisify(orderClient.CreateOrder).bind(orderClient);

async function runTests() {
  console.log('--- Starting RelayX Gateway Tests ---\n');

  try {
    // Test 1: Route to User Service
    console.log('[Test 1] Creating User...');
    const newUser = await createUser({ username: 'Khush', email: 'khush@example.com' });
    console.log('Success:', newUser);

    console.log('\n[Test 2] Fetching User...');
    const fetchedUser = await getUser({ user_id: newUser.user_id });
    console.log('Success:', fetchedUser);

    // Test 3: Route to Order Service
    console.log('\n[Test 3] Creating Order...');
    const newOrder = await createOrder({
      user_id: newUser.user_id,
      item_ids: ['item_1', 'item_2'],
      total_amount: 150.75
    });
    console.log('Success:', newOrder);

  } catch (error: any) {
    console.error('\n[RPC Error]:', error.message);
    console.error('Code:', error.code);
  }
}

runTests();