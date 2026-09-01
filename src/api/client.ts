import axios from "axios";
import { clearSession, getToken } from "../auth/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
  request_id?: string;
};

export default api;
