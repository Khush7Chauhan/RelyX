import { ServiceEndpoint } from '../config/config';

export interface ILoadBalancer {
  /**
   * Selects an appropriate endpoint for the given service name based on the underlying algorithm.
   * @param serviceName The name of the service to route to (e.g., 'user', 'order').
   * @returns The selected ServiceEndpoint.
   * @throws Error if no endpoints are available or healthy.
   */
  select(serviceName: string): ServiceEndpoint;

  /**
   * Updates the health status of a specific endpoint. 
   * Algorithms that do not track health can simply leave this as a no-op.
   * @param endpointId The unique identifier of the endpoint.
   * @param isHealthy Boolean indicating if the endpoint is currently healthy.
   */
  updateHealth(endpointId: string, isHealthy: boolean): void;
}