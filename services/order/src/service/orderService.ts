import { OrderRepository } from '../repository/orderRepository';

export class OrderService {
  constructor(private repo: OrderRepository) {}

  public async createOrder(userId: string, itemIds: string[], totalAmount: number) {
    if (!userId || !itemIds || itemIds.length === 0) {
      throw new Error('Invalid order data');
    }

    const order = {
      order_id: `ord_${Math.random().toString(36).substring(7)}`,
      user_id: userId,
      item_ids: itemIds,
      total_amount: totalAmount,
      status: 'PENDING_PAYMENT',
      created_at: new Date().toISOString(),
    };

    return this.repo.create(order);
  }

  public async listUserOrders(userId: string, pageSize: number = 10, pageNumber: number = 1) {
    // Ensure safe pagination limits
    const safePageSize = Math.min(Math.max(1, pageSize), 100); 
    const safePageNumber = Math.max(1, pageNumber);

    return this.repo.findByUserId(userId, safePageSize, safePageNumber);
  }
}