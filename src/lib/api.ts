import axios, { AxiosError, AxiosHeaders, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getSession } from "next-auth/react";
import { clientEnv } from "@/lib/config/env.client";
import type { ApiErrorPayload, ApiSuccess } from "@/lib/api/types";

const RETRY_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriable(error: AxiosError): boolean {
  const status = error.response?.status;
  if (!status) return true;
  return RETRY_STATUS.has(status);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!(error instanceof AxiosError) || !isRetriable(error) || i === attempts) {
        throw error;
      }
      await sleep(250 * (i + 1));
    }
  }
  throw lastError;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  const bearerToken = session?.user?.id;

  if (bearerToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${bearerToken}`);
    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const payload = error.response?.data;
    const message = payload?.message ?? error.message;
    return Promise.reject(new Error(message));
  },
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await withRetry<AxiosResponse<ApiSuccess<T>>>(() => apiClient.get(url, config));
  return response.data.data;
}

export async function apiPost<TResponse, TBody>(url: string, body: TBody, config?: AxiosRequestConfig): Promise<TResponse> {
  const response = await withRetry<AxiosResponse<ApiSuccess<TResponse>>>(() => apiClient.post(url, body, config));
  return response.data.data;
}

export async function apiPut<TResponse, TBody>(url: string, body: TBody, config?: AxiosRequestConfig): Promise<TResponse> {
  const response = await withRetry<AxiosResponse<ApiSuccess<TResponse>>>(() => apiClient.put(url, body, config));
  return response.data.data;
}

export async function apiDelete<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
  const response = await withRetry<AxiosResponse<ApiSuccess<TResponse>>>(() => apiClient.delete(url, config));
  return response.data.data;
}

export { apiClient };
