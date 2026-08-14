import { ILoadBalancer } from './loadBalancer';
import { ServiceEndpoint } from '../config/config';

export class HealthAwareLoadBalancer implements ILoadBalancer {
  private healthState: Map<string, boolean> = new Map();
  private cursorMap: Map<string, number> = new Map();

  constructor(private endpoints: Map<string, ServiceEndpoint[]>) {
    for (const [_, list] of this.endpoints) {
      for (const ep of list) {
        this.healthState.set(ep.id, true);
      }
    }
  }

  public updateHealth(endpointId: string, isHealthy: boolean): void {
    this.healthState.set(endpointId, isHealthy);
  }

  public select(serviceName: string): ServiceEndpoint {
    const pool = this.endpoints.get(serviceName);
    
    if (!pool || pool.length === 0) {
      throw new Error(`No endpoints configured for service: ${serviceName}`);
    }
    const healthyPool = pool.filter((ep) => this.healthState.get(ep.id) !== false);

    if (healthyPool.length === 0) {
      throw new Error(`No healthy endpoints available for service: ${serviceName}`);
    }

    const cursor = this.cursorMap.get(serviceName) || 0;
    const selected = healthyPool[cursor % healthyPool.length];
    this.cursorMap.set(serviceName, (cursor + 1) % healthyPool.length);

    return selected;
  }
}