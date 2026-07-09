export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  created_at?: string;
};
