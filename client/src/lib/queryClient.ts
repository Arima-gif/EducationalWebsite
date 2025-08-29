import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error('API Error:', { status: res.status, statusText: res.statusText, text });
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const fullUrl = url.startsWith('/api') ? `${apiUrl}${url}` : url;
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey.join("/") as string;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const fullUrl = url.startsWith('/api') ? `${apiUrl}${url}` : url;
      
      const res = await fetch(fullUrl, {
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        console.error(`API Error: ${res.status} ${res.statusText}`);
        return []; // Return empty array instead of throwing
      }

      return await res.json();
    } catch (error) {
      console.error('Network error:', error);
      return []; // Return empty array for network errors
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      retryDelay: 1000,
      throwOnError: false,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      throwOnError: false,
      networkMode: 'online',
    },
  },
});
