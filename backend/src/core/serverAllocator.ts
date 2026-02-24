/**
 * Server allocator abstraction.
 * In production this should request capacity from Kubernetes/GameLift/Agones.
 */
export class ServerAllocator {
  /**
   * Requests a game server endpoint for a ready match.
   * Returns mock localhost endpoint for the vertical slice.
   */
  public async allocate(matchId: string, region: string): Promise<{ endpoint: string; allocationMode: 'existing' | 'new' }> {
    void matchId;
    void region;
    return { endpoint: 'ws://localhost:7777', allocationMode: 'new' };
  }
}
