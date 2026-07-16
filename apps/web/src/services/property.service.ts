import {
  bindingToTerm,
  compactIri,
  type Iri,
  localName,
  predicateUsageQuery,
  type RdfTerm,
} from "@amdb/core";
import { env } from "../app/env";
import { select } from "./sparql.service";

export interface PredicateUsage {
  readonly subject: Iri;
  readonly subjectLabel: string;
  readonly object: RdfTerm;
}

export async function loadPredicateUsage(
  iri: Iri,
  signal?: AbortSignal,
): Promise<readonly PredicateUsage[]> {
  const results = await select(env.sparqlEndpoint, predicateUsageQuery(iri), signal);

  return results.results.bindings.flatMap((row) => {
    const subject = row.subject;
    const object = row.object;
    if (!subject || subject.type !== "uri" || !object) return [];

    return [
      {
        subject: subject.value as Iri,
        subjectLabel: compactIri(subject.value) || localName(subject.value),
        object: bindingToTerm(object),
      },
    ];
  });
}
