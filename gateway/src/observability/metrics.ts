import * as client from 'prom-client';

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });
export const activeStreamsGauge = new client.Gauge({
  name: 'grpc_active_streams',
  help: 'The current number of active gRPC streams handled by the gateway',
  registers: [registry],
});

export const streamErrorsCounter = new client.Counter({
  name: 'grpc_stream_errors_total',
  help: 'Total number of stream connection errors',
  labelNames: ['direction'], 
  registers: [registry],
});