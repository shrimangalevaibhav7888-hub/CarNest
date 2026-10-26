import { API_URL } from "@/lib/constants";

export interface RequestOptions extends RequestInit {
  token?: string | null;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private getAuthHeader(explicitToken?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token =
      explicitToken ||
      (typeof window !== "undefined" ? localStorage.getItem("carenest_token") : null);

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;

    const headers = {
      ...this.getAuthHeader(options.token),
      ...(options.headers as Record<string, string>),
    };

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // send cookies
      cache: "no-store",
    };

    const res = await fetch(url, config);

    if (!res.ok) {
      let errorMessage = `Request failed (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData && errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
          }
        }
      } catch {
        const text = await res.text().catch(() => "");
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return res.json() as Promise<T>;
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(path: string, body?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
