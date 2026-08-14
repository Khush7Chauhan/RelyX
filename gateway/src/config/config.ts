/// <reference types="node" />

export interface ServiceEndpoint {
  id: string;
  address: string; 
  weight?: number;
}

export interface GatewayConfig {
  port: number;
  host: string;
  services: {
    user: ServiceEndpoint[];
    order: ServiceEndpoint[];
  };
  retry: {
    maxRetries: number;
    initialBackoffMs: number;
    maxBackoffMs: number;
    backoffFactor: number;
  };
  timeout: {
    defaultDeadlineMs: number;
  };
}

export const config: GatewayConfig = {
  port: parseInt(process.env.GATEWAY_PORT || '5000', 10),
  host: process.env.GATEWAY_HOST || '0.0.0.0',
  services: {
    user: [
      { id: 'user-1', address: process.env.USER_SVC_1 || '127.0.0.1:50051' },
      { id: 'user-2', address: process.env.USER_SVC_2 || '127.0.0.1:50052' },
    ],
    order: [
      { id: 'order-1', address: process.env.ORDER_SVC_1 || '127.0.0.1:50053' },
    ],
  },
  retry: {
    maxRetries: 3,
    initialBackoffMs: 100,
    maxBackoffMs: 2000,
    backoffFactor: 2,
  },
  timeout: {
    defaultDeadlineMs: 3000,
  },
};