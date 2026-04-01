export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  transfer: "/transfer",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
