export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:8000/api");

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "CareNest AI";

export const APP_TAGLINE =
  process.env.NEXT_PUBLIC_APP_TAGLINE ||
  "Elderly Patient Home-Care Support & Hospital Discharge Coordination";
