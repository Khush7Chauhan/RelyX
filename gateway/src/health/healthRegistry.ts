import { ILoadBalancer } from '../load-balancer/loadBalancer';

export class HealthRegistry {
  constructor(private loadBalancer: ILoadBalancer) {}
  public reportHealth(endpointId: string, isHealthy: boolean): void {
    this.loadBalancer.updateHealth(endpointId, isHealthy);
  }
}