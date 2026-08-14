import { ILoadBalancer } from './loadBalancer';
import { ServiceEndpoint } from '../config/config';

export class RoundRobinLoadBalancer implements ILoadBalancer {
  private cursorMap: Map<string, number> = new Map();

  constructor(private endpoints: Map<string, ServiceEndpoint[]>) {}

  public select(serviceName: string): ServiceEndpoint {
    const pool = this.endpoints.get(serviceName);
    
    if (!pool || pool.length === 0) {
      throw new Error(`No endpoints available for service: ${serviceName}`);
    }
    const cursor = this.cursorMap.get(serviceName) || 0;
    const selected = pool[cursor % pool.length];
    this.cursorMap.set(serviceName, (cursor + 1) % pool.length);

    return selected;
  }

  public updateHealth(_endpointId: string, _isHealthy: boolean): void {
    // Basic round-robin does not care about health status.
    // We implement this as a no-op to satisfy the ILoadBalancer interface.
  }
}