import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { OrderRepository } from './repository/orderRepository';
import { OrderService } from './service/orderService';
import { OrderHandler } from './handler/orderHandler';

const PROTO_DIR = path.resolve(__dirname, '../../../proto');
const ORDER_PROTO_PATH = path.join(PROTO_DIR, 'order/order.proto');

const packageDefinition = protoLoader.loadSync(ORDER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR], 
});

const orderProtoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const orderPackage = orderProtoDescriptor.relayx.order.v1;

async function main() {
  const repository = new OrderRepository();
  const service = new OrderService(repository);
  const handler = new OrderHandler(service);
  const server = new grpc.Server();

  server.addService(orderPackage.OrderService.service, {
    CreateOrder: handler.CreateOrder,
    ListOrders: handler.ListOrders,
    CheckHealth: (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ) => {
      callback(null, { status: 1 }); 
    },
  });

  const port = process.env.ORDER_SVC_PORT || '50053';
  const address = `0.0.0.0:${port}`;

  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('Failed to bind Order Service:', err);
        return;
      }
      console.log(`Order Service running at ${address}`);
    }
  );
}

main();