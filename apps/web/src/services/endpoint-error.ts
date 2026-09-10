export type EndpointErrorKind =
  | "http"
  | "network"
  | "timeout"
  | "invalid-response"
  | "configuration"
  | "input";

export class EndpointError extends Error {
  constructor(
    readonly kind: EndpointErrorKind,
    readonly status?: number,
  ) {
    super(status ? `Data service returned HTTP ${status}` : `Data service failure: ${kind}`);
    this.name = "EndpointError";
  }
}

export interface FailureInfo {
  title: string;
  description: string;
  code: string;
}

export function failureInfo(error: unknown, offline = false): FailureInfo {
  const failure = error instanceof EndpointError ? error : undefined;
  const code = failure?.status
    ? `HTTP ${failure.status}`
    : (failure?.kind ?? "unexpected").toUpperCase().replaceAll("-", " ");
  const info = (title: string, description: string): FailureInfo => ({ title, description, code });
  if (failure?.kind === "network") {
    return offline
      ? info(
          "You appear to be offline",
          "Reconnect to the internet, then retry. Your search or query is still here.",
        )
      : info(
          "Cannot reach the data service",
          "Check your connection and retry. If other websites work, the data service may be unavailable or blocking browser requests.",
        );
  }
  if (failure?.kind === "timeout" || failure?.status === 504 || failure?.status === 408) {
    return info(
      "The data service took too long",
      "The request timed out. Try again shortly, or narrow your search or query to ask for less data.",
    );
  }
  if (failure?.status === 502 || failure?.status === 503) {
    return info(
      "The data service is temporarily unavailable",
      failure.status === 502
        ? "The website is available, but the data service returned a bad gateway response. Try again shortly, or explore the published datasets below."
        : "The data service is currently busy or unavailable. Wait a moment before retrying. Published datasets are still accessible below.",
    );
  }
  if (failure?.status === 429)
    return info(
      "The data service needs a moment",
      "Too many requests were sent. Wait a minute before trying again; repeated retries can keep the service busy.",
    );
  if (failure?.status === 404 || failure?.kind === "configuration")
    return info(
      "The data service address is unavailable",
      "The configured data service could not be found. This does not mean your resource is missing. Try again later or use the published datasets.",
    );
  if (failure?.status === 401 || failure?.status === 403)
    return info(
      "The data service refused this request",
      "The service is not allowing this request. Retrying immediately may not help. You can still browse the published datasets and documentation.",
    );
  if (failure?.kind === "input" || failure?.status === 400 || failure?.status === 422)
    return info(
      "Check your search or query",
      "Use an Amharic resource title or a valid HTTP IRI. For a SPARQL query, check the syntax and include a LIMIT before running it again.",
    );
  if (failure?.status === 406)
    return info(
      "This RDF format is unavailable",
      "The data service could not provide the requested format. Return to the resource and try another format.",
    );
  if (failure?.kind === "invalid-response")
    return info(
      "The data service returned an unreadable response",
      "The response was not valid data. It may be a temporary service problem. Retry shortly; no results from this response are displayed.",
    );
  if (failure?.status && failure.status >= 500)
    return info(
      "The data service encountered a problem",
      "The service could not finish this request. Try again shortly, or browse the published datasets while it recovers.",
    );
  return info(
    "This view could not be loaded",
    "Try again. If the problem continues, use the resource directory or published datasets to continue exploring.",
  );
}
