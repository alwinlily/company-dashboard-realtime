export interface PerformanceMetrics {
  connectionLatency: number;
  updateFrequency: number;
  errorRate: number;
  memoryUsage: number;
  activeConnections: number;
}

export interface UserSession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  updateCount: number;
  errorCount: number;
  connectionStatus: string;
}

class PerformanceMonitor {
  private sessions: Map<string, UserSession> = new Map();
  private metrics: PerformanceMetrics = {
    connectionLatency: 0,
    updateFrequency: 0,
    errorRate: 0,
    memoryUsage: 0,
    activeConnections: 0,
  };
  private metricsCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    // Update metrics every 5 seconds
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
      this.notifyMetricsCallbacks();
    }, 5000);
  }

  private updateMetrics() {
    const now = new Date();
    const activeSessions = Array.from(this.sessions.values()).filter(
      session => now.getTime() - session.lastActivity.getTime() < 30000 // Active within last 30 seconds
    );

    // Calculate average connection latency (simulated)
    const avgLatency = Math.random() * 100 + 10; // 10-110ms

    // Calculate update frequency (updates per minute)
    const totalUpdates = Array.from(this.sessions.values()).reduce(
      (sum, session) => sum + session.updateCount, 0
    );
    const totalMinutes = activeSessions.length > 0
      ? activeSessions.reduce((sum, session) =>
          sum + (now.getTime() - session.startTime.getTime()) / 60000, 0) / activeSessions.length
      : 1;
    const updateFrequency = totalUpdates / totalMinutes;

    // Calculate error rate
    const totalOperations = Array.from(this.sessions.values()).reduce(
      (sum, session) => sum + session.updateCount + session.errorCount, 0
    );
    const totalErrors = Array.from(this.sessions.values()).reduce(
      (sum, session) => sum + session.errorCount, 0
    );
    const errorRate = totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;

    // Get memory usage if available
    const memoryUsage = this.getMemoryUsage();

    this.metrics = {
      connectionLatency: avgLatency,
      updateFrequency,
      errorRate,
      memoryUsage,
      activeConnections: activeSessions.length,
    };

    // Clean up inactive sessions
    this.cleanupInactiveSessions();
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  private cleanupInactiveSessions() {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > inactiveThreshold) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private notifyMetricsCallbacks() {
    this.metricsCallbacks.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in metrics callback:', error);
      }
    });
  }

  // Public API methods
  public registerSession(sessionId: string): UserSession {
    const session: UserSession = {
      id: sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      updateCount: 0,
      errorCount: 0,
      connectionStatus: 'connected',
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  public updateSessionActivity(sessionId: string, isUpdate: boolean = false, isError: boolean = false) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      if (isUpdate) {
        session.updateCount++;
      }
      if (isError) {
        session.errorCount++;
      }
    }
  }

  public removeSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getActiveSessionCount(): number {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      session => now.getTime() - session.lastActivity.getTime() < 30000
    ).length;
  }

  public getSessionCount(): number {
    return this.sessions.size;
  }

  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.metricsCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.metricsCallbacks.indexOf(callback);
      if (index > -1) {
        this.metricsCallbacks.splice(index, 1);
      }
    };
  }

  public simulateConcurrentUsers(count: number, duration: number = 60000) {
    console.log(`Simulating ${count} concurrent users for ${duration}ms`);

    const sessions: string[] = [];
    const updateInterval = 1000 + Math.random() * 2000; // 1-3 seconds between updates

    // Create sessions
    for (let i = 0; i < count; i++) {
      const sessionId = `sim-user-${i}-${Date.now()}`;
      this.registerSession(sessionId);
      sessions.push(sessionId);

      // Simulate periodic updates
      const interval = setInterval(() => {
        const isError = Math.random() < 0.05; // 5% error rate
        this.updateSessionActivity(sessionId, true, isError);
      }, updateInterval + Math.random() * 1000);

      // Clean up after duration
      setTimeout(() => {
        clearInterval(interval);
        this.removeSession(sessionId);
      }, duration);
    }

    return sessions;
  }

  public generatePerformanceReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      sessions: {
        total: this.getSessionCount(),
        active: this.getActiveSessionCount(),
      },
      recommendations: this.generateRecommendations(),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.connectionLatency > 100) {
      recommendations.push('Consider optimizing connection latency - currently above 100ms');
    }

    if (this.metrics.errorRate > 5) {
      recommendations.push('Error rate is high - investigate connection stability');
    }

    if (this.metrics.memoryUsage > 100) {
      recommendations.push('Memory usage is high - consider cleanup optimizations');
    }

    if (this.metrics.activeConnections > 50) {
      recommendations.push('High number of active connections - monitor server capacity');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges');
    }

    return recommendations;
  }

  public destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.sessions.clear();
    this.metricsCallbacks = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();