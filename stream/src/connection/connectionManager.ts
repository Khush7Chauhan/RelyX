import * as grpc from '@grpc/grpc-js';

export class ConnectionManager {
  private activeConnections = new Map<string, grpc.ServerWritableStream<any, any>>();
  public addConnection(clientId: string, stream: grpc.ServerWritableStream<any, any>) {
    this.activeConnections.set(clientId, stream);
    stream.on('cancelled', () => this.removeConnection(clientId));
    stream.on('error', () => this.removeConnection(clientId));
  }

  public removeConnection(clientId: string) {
    this.activeConnections.delete(clientId);
  }

  public getConnection(clientId: string) {
    return this.activeConnections.get(clientId);
  }
}