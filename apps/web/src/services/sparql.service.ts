import { isSparqlSelectResults, type SparqlSelectResults } from "@amdb/core";
import { EndpointError } from "./endpoint-error";

export const ENDPOINT_TIMEOUT_MS = 20000;

function queryUrl(endpoint: string, query: string, format?: string): URL {
  try {
    const url = new URL(endpoint);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid protocol");
    url.searchParams.set("query", query);
    if (format) url.searchParams.set("format", format);
    return url;
  } catch {
    throw new EndpointError("configuration");
  }
}

async function request<T>(
  url: URL,
  accept: string,
  read: (response: Response) => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal?.reason);
  if (signal?.aborted) cancel();
  else signal?.addEventListener("abort", cancel, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, ENDPOINT_TIMEOUT_MS);
  try {
    controller.signal.throwIfAborted();
    const response = await fetch(url, {
      method: "GET",
      headers: { accept },
      signal: controller.signal,
    });
    if (!response.ok) throw new EndpointError("http", response.status);
    // Gateways sometimes send an HTML error document with a successful HTTP status.
    if (response.headers.get("content-type")?.includes("text/html"))
      throw new EndpointError("invalid-response");
    return await read(response);
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? new DOMException("Cancelled", "AbortError");
    if (timedOut) throw new EndpointError("timeout");
    if (error instanceof EndpointError) throw error;
    if (error instanceof SyntaxError) throw new EndpointError("invalid-response");
    if (error instanceof TypeError) throw new EndpointError("network");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

export async function select(
  endpoint: string,
  query: string,
  signal?: AbortSignal,
): Promise<SparqlSelectResults> {
  const accept = "application/sparql-results+json";
  return request(
    queryUrl(endpoint, query, accept),
    accept,
    async (response) => {
      const body: unknown = await response.json();
      if (!isSparqlSelectResults(body)) throw new EndpointError("invalid-response");
      return body;
    },
    signal,
  );
}

export async function describe(
  endpoint: string,
  query: string,
  accept: "text/turtle" | "application/ld+json" | "application/n-triples",
  signal?: AbortSignal,
): Promise<string> {
  const formatNames: Record<typeof accept, readonly string[]> = {
    "text/turtle": ["text/turtle", "ttl"],
    "application/ld+json": ["application/ld+json", "jsonld"],
    "application/n-triples": ["application/n-triples", "ntriples"],
  };
  for (const format of [...formatNames[accept], undefined]) {
    try {
      return await request(
        queryUrl(endpoint, query, format),
        accept,
        async (response) => {
          const raw = await response.text();
          if (accept === "application/ld+json") JSON.parse(raw);
          return raw;
        },
        signal,
      );
    } catch (error) {
      if (!(error instanceof EndpointError) || error.status !== 406) throw error;
    }
  }
  throw new EndpointError("http", 406);
}
