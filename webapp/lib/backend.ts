const DEFAULT_BACKEND_URL = "http://localhost:3001";

/**
 * Base URL for the Python backend. Set PYTHON_BACKEND_URL in .env.local.
 * Server-only: do not import this from Client Components.
 */
export function getBackendBaseUrl(): string {
  return (process.env.PYTHON_BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(
    /\/$/,
    "",
  );
}

export function getBackendUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalized}`;
}

/**
 * Fetch against the Python backend. Use from Route Handlers / Server Components.
 *
 * @example
 * const res = await backendFetch("/hello");
 * const data = await res.json();
 */
export async function backendFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = getBackendUrl(path);

  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
}

/**
 * Proxy a backend response through a Next.js Route Handler, preserving status
 * and JSON vs text body shape.
 */
export async function proxyBackendResponse(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    const res = await backendFetch(path, init);
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data: unknown = await res.json();
      return Response.json(data, { status: res.status });
    }

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        error: "Failed to reach Python backend",
        backendUrl: getBackendUrl(path),
        detail,
      },
      { status: 502 },
    );
  }
}
