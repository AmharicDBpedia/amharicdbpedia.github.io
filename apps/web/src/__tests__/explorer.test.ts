import { afterEach, describe, expect, it, vi } from "vitest";
import { loadTriplePage, PAGE_SIZE, pageQuery, type Triple } from "../features/explorer/data";
import { buildGraph } from "../features/explorer/model";
import { termLabel } from "../features/explorer/virtual-facts";

const triple: Triple = {
  subject: { type: "uri", value: "http://am.dbpedia.org/resource/ዳኛቸው_ወርቁ" },
  predicate: { type: "uri", value: "http://dbpedia.org/ontology/birthPlace" },
  object: { type: "uri", value: "http://am.dbpedia.org/resource/ደብረ_ብርሃን" },
};
afterEach(() => vi.unstubAllGlobals());

describe("bounded RDF pages", () => {
  it("normalizes Amharic titles and bounds ordered pages", () => {
    const query = pageQuery("ዳኛቸው ወርቁ", 2);
    expect(query).toContain("<http://am.dbpedia.org/resource/ዳኛቸው_ወርቁ>");
    expect(query).toContain("UNION { VALUES ?object");
    expect(query).toContain("FILTER(?subject != ?object)");
    expect(query).toContain("ORDER BY ?subject ?predicate ?object");
    expect(query).toContain("LIMIT 1001 OFFSET 2000");
  });
  it("rejects SPARQL injection and invalid pages before fetching", () => {
    for (const input of [
      "https://example.org/>} UNION {?s ?p ?o}",
      "javascript:alert(1)",
      "https://example.org/%3E",
      "https://example.org/\u0001",
    ]) {
      expect(() => pageQuery(input, 0)).toThrow();
    }
    for (const page of [-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER])
      expect(() => pageQuery("", page)).toThrow();
  });
  it("uses one sentinel row without retaining it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            head: { vars: ["subject", "predicate", "object"] },
            results: { bindings: Array.from({ length: PAGE_SIZE + 1 }, () => triple) },
          }),
        ),
      ),
    );
    const result = await loadTriplePage("", 0, new AbortController().signal);
    expect(result.rows).toHaveLength(PAGE_SIZE);
    expect(result.hasNext).toBe(true);
  });
  it("rejects malformed endpoint rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ head: { vars: [] }, results: { bindings: [{ subject: {} }] } }),
          ),
        ),
    );
    await expect(loadTriplePage("", 0, new AbortController().signal)).rejects.toThrow(
      "invalid RDF row",
    );
  });
});

describe("RDF graph projection", () => {
  it("preserves real directed edges and excludes literal objects", () => {
    const graph = buildGraph([
      triple,
      { ...triple, object: { type: "literal", value: "A label" } },
    ]);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toEqual([{ from: 0, to: 1, label: "birthPlace" }]);
    expect(graph.nodes[0]?.label).toBe("ዳኛቸው ወርቁ");
  });
  it("handles shared nodes, self loops and large slices without invalid coordinates", () => {
    const rows = Array.from(
      { length: 1000 },
      (_, i): Triple => ({
        ...triple,
        subject: { type: "uri", value: `https://example.org/${i}` },
      }),
    );
    const graph = buildGraph([...rows, { ...triple, object: triple.subject }]);
    expect(graph.nodes).toHaveLength(1002);
    expect(graph.nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y))).toBe(
      true,
    );
    expect(buildGraph(rows)).toEqual(buildGraph(rows));
    expect(buildGraph([])).toEqual({ nodes: [], edges: [] });
  });
  it("preserves literal language, datatype and blank-node notation", () => {
    expect(termLabel({ type: "literal", value: "ስም", "xml:lang": "am" })).toBe('"ስም"@am');
    expect(
      termLabel({
        type: "literal",
        value: "42",
        datatype: "http://www.w3.org/2001/XMLSchema#integer",
      }),
    ).toContain("^^integer");
    expect(termLabel({ type: "bnode", value: "b1" })).toBe("_:b1");
  });
});
