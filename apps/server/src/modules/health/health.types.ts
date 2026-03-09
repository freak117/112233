export interface DependencyHealth {
  ok: boolean;
  details?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  services: {
    api: DependencyHealth;
    database: DependencyHealth;
    redis: DependencyHealth;
    minio: DependencyHealth;
  };
}

