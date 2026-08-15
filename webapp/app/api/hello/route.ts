import { proxyBackendResponse } from "@/lib/backend";

/**
 * Dummy BFF route: GET /api/hello → GET {PYTHON_BACKEND_URL}/hello
 *
 * To add another backend endpoint, copy this file under app/api/<name>/route.ts
 * and change the path passed to proxyBackendResponse.
 */
export async function GET() {
  return proxyBackendResponse("/hello");
}
