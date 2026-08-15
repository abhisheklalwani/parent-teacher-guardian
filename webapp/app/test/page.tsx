"use client";

import { useState } from "react";

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; statusCode: number; body: string }
  | { status: "error"; message: string };

export default function TestPage() {
  const [state, setState] = useState<RequestState>({ status: "idle" });

  async function callBackend() {
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/hello");
      const contentType = res.headers.get("content-type") ?? "";
      const raw = await res.text();

      let body = raw;
      if (contentType.includes("application/json") && raw) {
        try {
          body = JSON.stringify(JSON.parse(raw), null, 2);
        } catch {
          body = raw;
        }
      }

      setState({
        status: "success",
        statusCode: res.status,
        body: body || "(empty response)",
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Request failed",
      });
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Backend test
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Calls the Next.js route <code className="font-mono text-[0.9em]">/api/hello</code>,
          which proxies to the Python backend at{" "}
          <code className="font-mono text-[0.9em]">localhost:3001/hello</code>.
        </p>
      </div>

      <button
        type="button"
        onClick={callBackend}
        disabled={state.status === "loading"}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {state.status === "loading" ? "Calling…" : "GET /api/hello"}
      </button>

      {state.status === "idle" && (
        <p className="text-sm text-zinc-500">Click the button to fetch from the backend.</p>
      )}

      {state.status === "error" && (
        <pre className="overflow-x-auto rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.message}
        </pre>
      )}

      {state.status === "success" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            HTTP {state.statusCode}
          </p>
          <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
            {state.body}
          </pre>
        </div>
      )}
    </main>
  );
}
