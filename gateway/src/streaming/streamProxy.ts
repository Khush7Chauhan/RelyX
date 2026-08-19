import * as grpc from '@grpc/grpc-js';
import { StreamManager } from './streamManager';
import { logger } from '../observability/logger';
import { streamErrorsCounter } from '../observability/metrics';

export function proxyBidiStream<Req, Res>(
  clientCall: grpc.ServerDuplexStream<Req, Res>,
  backendCall: grpc.ClientDuplexStream<Req, Res>,
  streamManager: StreamManager,
  streamId: string
) {
  streamManager.registerStream(streamId, clientCall);
  clientCall.on('data', (chunk) => {
    backendCall.write(chunk);
  });

  clientCall.on('end', () => {
    backendCall.end();
  });

  clientCall.on('error', (err) => {
    logger.error({ err, streamId }, 'Client stream error');
    streamErrorsCounter.labels('client_to_gateway').inc();
    backendCall.cancel(); 
    streamManager.unregisterStream(streamId);
  });

  backendCall.on('data', (chunk) => {
    clientCall.write(chunk);
  });

  backendCall.on('end', () => {
    clientCall.end();
    streamManager.unregisterStream(streamId);
  });

  backendCall.on('error', (err) => {
    logger.error({ err, streamId }, 'Backend stream error');
    streamErrorsCounter.labels('gateway_to_backend').inc();
    clientCall.emit('error', err);
    streamManager.unregisterStream(streamId);
  });
}