import * as grpc from '@grpc/grpc-js';
import { OrderService } from '../service/orderService';

export class OrderHandler {
  constructor(private orderService: OrderService) {}

  public CreateOrder = async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) => {
    try {
      const { user_id, item_ids, total_amount } = call.request;
      const order = await this.orderService.createOrder(user_id, item_ids, total_amount);
      
      callback(null, order);
    } catch (error: any) {
      callback({ 
        code: grpc.status.INVALID_ARGUMENT, 
        message: error.message || 'Failed to create order' 
      }, null);
    }
  };

  public ListOrders = async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) => {
    try {
      const { user_id, pagination } = call.request;
      
      // Extract from the common.proto PaginationRequest object
      const pageSize = pagination?.page_size;
      const pageNumber = pagination?.page_number;

      const result = await this.orderService.listUserOrders(user_id, pageSize, pageNumber);
      
      // Map back to the common.proto PaginationResponse object
      callback(null, {
        orders: result.orders,
        pagination: {
          total_items: result.total,
          total_pages: Math.ceil(result.total / (pageSize || 10)),
          current_page: pageNumber || 1
        }
      });
    } catch (error) {
      callback({ 
        code: grpc.status.INTERNAL, 
        message: 'Failed to fetch orders' 
      }, null);
    }
  };
}