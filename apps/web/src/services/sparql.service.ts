import { isSparqlSelectResults, type SparqlSelectResults } from "@amdb/core";

export async function select(
  endpoint: string,
  query: string,
  signal?: AbortSignal,
): Promise<SparqlSelectResults> {
  const url = new URL(endpoint);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "application/sparql-results+json");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/sparql-results+json",
    },
    ...(signal ? { signal } : {}),
  });

  if (!response.ok) {
    throw new Error(`SPARQL request failed: ${response.status} ${response.statusText}`);
  }

  const body: unknown = await response.json();
  if (!isSparqlSelectResults(body)) {
    throw new Error("SPARQL endpoint returned an unexpected SELECT result shape");
  }

  return body;
}

export async function describe(
  endpoint: string,
  query: string,
  accept: "text/turtle" | "application/ld+json" | "application/n-triples" | "application/rdf+xml",
  signal?: AbortSignal,
): Promise<string> {
  const formatNames: Record<typeof accept, readonly string[]> = {
    "text/turtle": ["text/turtle", "ttl"],
    "application/ld+json": ["application/ld+json", "jsonld"],
    "application/n-triples": ["application/n-triples", "ntriples"],
    "application/rdf+xml": ["application/rdf+xml", "rdf"],
  };
  let lastError = "DESCRIBE request failed";
  for (const format of [...formatNames[accept], undefined]) {
    const url = new URL(endpoint);
    url.searchParams.set("query", query);
    if (format) url.searchParams.set("format", format);

    const response = await fetch(url, {
      method: "GET",
      headers: { accept },
      ...(signal ? { signal } : {}),
    });
    if (response.ok) return response.text();
    lastError = `DESCRIBE request failed: ${response.status} ${response.statusText}`;
    if (response.status !== 406) throw new Error(lastError);
  }
  throw new Error(lastError);
}
