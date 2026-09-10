import { dbpediaResourceIri, type SparqlJsonBinding } from "@amdb/core";
import { env } from "../../app/env";
import { EndpointError } from "../../services/endpoint-error";
import { select } from "../../services/sparql.service";

export const PAGE_SIZE = 1000;
export interface Triple {
  subject: SparqlJsonBinding;
  predicate: SparqlJsonBinding;
  object: SparqlJsonBinding;
}

export function pageQuery(resource: string, page: number): string {
  if (!Number.isSafeInteger(page) || page < 0 || !Number.isSafeInteger(page * PAGE_SIZE)) {
    throw new Error("Invalid page number");
  }
  const iri = resource ? dbpediaResourceIri(resource, env.resourceBase) : "";
  if (
    iri &&
    (!/^https?:\/\//i.test(iri) ||
      /[<>"{}|^`\\\s]/u.test(iri) ||
      [...iri].some((char) => char.charCodeAt(0) < 32))
  ) {
    throw new EndpointError("input");
  }
  // Ordering makes pages repeatable for a stable dataset; do not download a total count.
  return `SELECT ?subject ?predicate ?object WHERE {
    ${
      iri
        ? `{ VALUES ?subject { <${iri}> } ?subject ?predicate ?object . }
    UNION { VALUES ?object { <${iri}> } ?subject ?predicate ?object . FILTER(?subject != ?object) }`
        : "?subject ?predicate ?object ."
    }
  } ORDER BY ?subject ?predicate ?object
  LIMIT ${PAGE_SIZE + 1} OFFSET ${page * PAGE_SIZE}`;
}

export async function loadTriplePage(resource: string, page: number, signal: AbortSignal) {
  const result = await select(env.sparqlEndpoint, pageQuery(resource, page), signal);
  const bindings = result.results.bindings;
  const rows: Triple[] = [];
  for (const row of bindings.slice(0, PAGE_SIZE)) {
    if (!validTerm(row.subject) || !validTerm(row.predicate) || !validTerm(row.object)) {
      throw new EndpointError("invalid-response");
    }
    rows.push({ subject: row.subject, predicate: row.predicate, object: row.object });
  }
  return { rows, hasNext: bindings.length > PAGE_SIZE };
}

function validTerm(term: SparqlJsonBinding | undefined): term is SparqlJsonBinding {
  return (
    !!term && ["uri", "literal", "bnode"].includes(term.type) && typeof term.value === "string"
  );
}
