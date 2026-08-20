export class OrderRepository {
  private db = new Map<string, any>(); 

  public async create(order: any) {
    this.db.set(order.order_id, order);
    return order;
  }

  public async findByUserId(userId: string, pageSize: number, pageNumber: number) {
    // 1. Filter orders by user (Mocking a SQL WHERE clause)
    const allOrders = Array.from(this.db.values()).filter(o => o.user_id === userId);
    
    // 2. Calculate pagination offsets
    const startIndex = (pageNumber - 1) * pageSize;
    const paginated = allOrders.slice(startIndex, startIndex + pageSize);
    
    return {
      orders: paginated,
      total: allOrders.length
    };
  }
}