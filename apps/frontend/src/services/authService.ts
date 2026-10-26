import { apiClient } from "./api";
import { UserRole } from "../types";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string | null;
  avatar_url?: string | null;
  patient_id?: number | null;
  caregiver_id?: number | null;
  verification_status?: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | null;
  linked_patient_ids?: number[];
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password?: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  // Elderly fields
  age?: number;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  medical_notes?: string;
  care_requirements?: string[];
  // Family fields
  relationship?: string;
  linked_elderly_email?: string;
  // Caregiver fields
  experience_years?: number;
  skills?: string[];
  availability?: string;
}

class AuthService {
  private tokenKey = "carenest_token";
  private userKey = "carenest_active_user";

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  setStoredUser(user: AuthUser): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>("/auth/register", payload);
    if (res.access_token) {
      this.setToken(res.access_token);
      this.setStoredUser(res.user);
    }
    return res;
  }

  async login(email: string, password: string, rememberMe = true): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>("/auth/login", {
      email,
      password,
      remember_me: rememberMe,
    });
    if (res.access_token) {
      this.setToken(res.access_token);
      this.setStoredUser(res.user);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearToken();
    }
  }

  async getMe(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const user = await apiClient.get<AuthUser>("/auth/me");
      this.setStoredUser(user);
      return user;
    } catch {
      this.clearToken();
      return null;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string; email: string }> {
    return apiClient.post<{ message: string; email: string }>("/auth/forgot-password", { email });
  }
}

export const authService = new AuthService();
