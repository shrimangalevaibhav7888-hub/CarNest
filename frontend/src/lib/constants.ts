const resolveApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, "");
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
    }
    return trimmed;
  }
  return typeof window !== "undefined" ? "/api" : "http://localhost:8000/api";
};

export const API_URL = resolveApiUrl();

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "CareNest AI";

export const APP_TAGLINE =
  process.env.NEXT_PUBLIC_APP_TAGLINE ||
  "Elderly Patient Home-Care Support & Hospital Discharge Coordination";
