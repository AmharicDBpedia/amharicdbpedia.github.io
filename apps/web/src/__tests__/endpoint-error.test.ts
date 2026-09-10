import { afterEach, expect, it, describe as suite, vi } from "vitest";
import { EndpointError, failureInfo } from "../services/endpoint-error";
import { describe, ENDPOINT_TIMEOUT_MS, select } from "../services/sparql.service";

const endpoint = "https://example.org/sparql";
const query = "SELECT ?s WHERE { ?s ?p ?o } LIMIT 1";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

suite("data service error classification", () => {
  it.each([
    502, 503, 504, 429, 404, 403, 400, 500,
  ])("preserves HTTP %s without exposing the response body", async (status) => {
    const fetch = vi.fn().mockResolvedValue(new Response("private server diagnostic", { status }));
    vi.stubGlobal("fetch", fetch);
    await expect(select(endpoint, query)).rejects.toMatchObject({ kind: "http", status });
    const info = failureInfo(new EndpointError("http", status));
    expect(info.code).toBe(`HTTP ${status}`);
    expect(info.description).not.toContain("private server diagnostic");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("distinguishes service 404 from a missing page", () => {
    expect(failureInfo(new EndpointError("http", 404)).description).toContain(
      "does not mean your resource is missing",
    );
  });
  it("classifies browser fetch failures and offline status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(select(endpoint, query)).rejects.toMatchObject({ kind: "network" });
    expect(failureInfo(new EndpointError("network"), true).title).toBe("You appear to be offline");
    expect(failureInfo(new EndpointError("network"), false).title).toBe(
      "Cannot reach the data service",
    );
  });
  it.each([
    "<html>Bad Gateway</html>",
    "{broken",
    '{"head":{"vars":[]}}',
  ])("rejects malformed SELECT response %s", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
    await expect(select(endpoint, query)).rejects.toMatchObject({ kind: "invalid-response" });
  });
  it("rejects HTML documents returned as successful RDF downloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>Gateway failure</html>", {
          headers: { "content-type": "text/html" },
        }),
      ),
    );
    await expect(
      describe(endpoint, "DESCRIBE <https://example.org/s>", "text/turtle"),
    ).rejects.toMatchObject({ kind: "invalid-response" });
  });
  it("tries RDF format aliases only for 406 responses", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 406 }))
      .mockResolvedValueOnce(new Response("<s> <p> <o> ."));
    vi.stubGlobal("fetch", fetch);
    await expect(describe(endpoint, query, "text/turtle")).resolves.toBe("<s> <p> <o> .");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(String(fetch.mock.calls[1]?.[0])).toContain("format=ttl");
  });
  it("times out stalled requests and clears the timer", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: URL, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(init.signal?.reason), {
              once: true,
            });
          }),
      ),
    );
    const pending = expect(select(endpoint, query)).rejects.toMatchObject({ kind: "timeout" });
    await vi.advanceTimersByTimeAsync(ENDPOINT_TIMEOUT_MS);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });
  it("keeps deliberate cancellation distinct from a network error", async () => {
    const controller = new AbortController();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    controller.abort();
    await expect(select(endpoint, query, controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("uses safe generic copy for unknown exceptions", () => {
    expect(JSON.stringify(failureInfo(new Error("secret internal stack")))).not.toContain(
      "secret internal stack",
    );
  });
});
