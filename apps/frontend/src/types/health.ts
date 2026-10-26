export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  services: Record<string, string>;
}

export type ConnectionState = "idle" | "loading" | "connected" | "error";
