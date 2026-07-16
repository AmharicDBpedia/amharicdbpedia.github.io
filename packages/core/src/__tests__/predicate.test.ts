import { describe, expect, it } from "vitest";
import { describePredicate, predicateUsageQuery, toIri } from "../index";

describe("predicate descriptions", () => {
  it("describes rdfs:label as a readable property page model", () => {
    const description = describePredicate(toIri("http://www.w3.org/2000/01/rdf-schema#label"));

    expect(description.compactLabel).toBe("rdfs:label");
    expect(description.description).toContain("human-readable name");
    expect(description.plainMeaning).toContain("display name");
    expect(description.valueExplanation).toContain("language tag");
    expect(description.range).toBe("rdfs:Literal");
  });

  it("explains unknown predicates from their namespace", () => {
    const description = describePredicate(toIri("http://dbpedia.org/ontology/birthPlace"));

    expect(description.compactLabel).toBe("dbo:birthPlace");
    expect(description.rdfRole).toBe("DBpedia ontology property");
    expect(description.plainMeaning).toContain("curated DBpedia relationship");
  });

  it("builds bounded predicate usage queries", () => {
    const query = predicateUsageQuery(toIri("http://www.w3.org/2000/01/rdf-schema#label"), 5);

    expect(query).toContain("?subject <http://www.w3.org/2000/01/rdf-schema#label> ?object");
    expect(query).toContain("LIMIT 5");
  });
});
