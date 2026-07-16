import { compactIri, localName } from "../util/iri";
import type { Iri } from "./terms";

export interface PredicateDescription {
  readonly iri: Iri;
  readonly label: string;
  readonly compactLabel: string;
  readonly description: string;
  readonly namespaceLabel: string;
  readonly namespaceIri: string;
  readonly rdfRole: string;
  readonly expectedValue: string;
  readonly plainMeaning: string;
  readonly valueExplanation: string;
  readonly typeLabels: readonly string[];
  readonly domain?: string;
  readonly range?: string;
  readonly isDefinedBy?: string;
  readonly exampleObject: string;
  readonly externalPage?: string;
}

interface NamespaceInfo {
  readonly iri: string;
  readonly label: string;
  readonly rdfRole: string;
  readonly expectedValue: string;
  readonly plainMeaning: (compactLabel: string) => string;
  readonly valueExplanation: string;
  readonly description: (compactLabel: string, local: string) => string;
}

const KNOWN_PREDICATES: Readonly<Record<string, Partial<PredicateDescription>>> = {
  "http://www.w3.org/2000/01/rdf-schema#label": {
    label: "label",
    description: "A human-readable name for the subject resource.",
    expectedValue: "Literal text, often tagged with a language such as @am.",
    plainMeaning:
      "Use this property to find the display name that people should see for a resource.",
    valueExplanation:
      "The value is literal text. If it has @am, @en, or another language tag, that tells the app which language the label belongs to.",
    typeLabels: ["rdf:Property"],
    domain: "rdfs:Resource",
    range: "rdfs:Literal",
    isDefinedBy: "http://www.w3.org/2000/01/rdf-schema#",
    exampleObject: '"ዳኛቸው ወርቁ"@am',
  },
  "http://www.w3.org/2000/01/rdf-schema#comment": {
    label: "comment",
    description: "A description of the subject resource.",
    expectedValue: "Literal text, usually language-tagged.",
    plainMeaning:
      "Use this property to find a readable description or short explanation of a resource.",
    valueExplanation:
      "The value is literal text. Language tags let the page choose the best description for the selected language.",
    typeLabels: ["rdf:Property"],
    domain: "rdfs:Resource",
    range: "rdfs:Literal",
    isDefinedBy: "http://www.w3.org/2000/01/rdf-schema#",
    exampleObject: '"A short description"@en',
  },
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": {
    label: "type",
    description: "Connects a resource to the RDF class it belongs to.",
    expectedValue: "An IRI naming a class, such as dbo:Person or owl:Thing.",
    plainMeaning: "Use this property to understand what kind of thing the subject resource is.",
    valueExplanation:
      "The value is normally another IRI that names a class. Opening that class explains the category used by the data.",
    typeLabels: ["rdf:Property"],
    domain: "rdfs:Resource",
    range: "rdfs:Class",
    isDefinedBy: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    exampleObject: "dbo:Person",
  },
  "http://xmlns.com/foaf/0.1/isPrimaryTopicOf": {
    label: "is primary topic of",
    description: "Links a described resource to the document where it is the main topic.",
    expectedValue: "A document IRI, commonly a Wikipedia article URL.",
    plainMeaning:
      "Use this property to jump from a DBpedia resource to the source document where that resource is the main topic.",
    valueExplanation:
      "The value is a document IRI, usually the Wikipedia page that DBpedia extracted the resource from.",
    typeLabels: ["rdf:Property", "owl:ObjectProperty"],
    domain: "rdfs:Resource",
    range: "foaf:Document",
    isDefinedBy: "http://xmlns.com/foaf/0.1/",
    exampleObject: "<https://am.wikipedia.org/wiki/ዳኛቸው_ወርቁ>",
  },
  "http://dbpedia.org/ontology/wikiPageExternalLink": {
    label: "wiki page external link",
    description: "Connects a DBpedia resource to an external link extracted from its source page.",
    expectedValue: "An external IRI.",
    plainMeaning:
      "Use this property to see external web links that were listed on the original wiki page.",
    valueExplanation:
      "The value is another web address. It may point outside DBpedia and outside Wikipedia.",
    typeLabels: ["rdf:Property", "owl:ObjectProperty"],
    domain: "dbo:Resource",
    range: "rdfs:Resource",
    isDefinedBy: "http://dbpedia.org/ontology/",
    exampleObject: "<https://example.org/>",
  },
  "http://dbpedia.org/ontology/wikiPageWikiLinkText": {
    label: "Text used to link from a Wikipage to another Wikipage",
    description: "Text used to link from a Wikipage to another Wikipage.",
    expectedValue: "Literal link text extracted from wiki markup.",
    plainMeaning: "Use this property to see the exact anchor text that appeared in a wiki link.",
    valueExplanation:
      "The value is literal text, not a target page. It records the words that were used in the link.",
    typeLabels: ["rdf:Property", "owl:ObjectProperty"],
    domain: "dbo:Resource",
    range: "rdfs:Literal",
    isDefinedBy: "http://dbpedia.org/ontology/",
    exampleObject: '"ዳኛቸው ወርቁ"@am',
    externalPage: "https://dbpedia.org/ontology/wikiPageWikiLinkText",
  },
  "http://purl.org/dc/terms/subject": {
    label: "subject",
    description: "Connects a resource to a topic or category that classifies it.",
    expectedValue: "A resource IRI, often a category.",
    plainMeaning:
      "Use this property to see the topic or category assigned to the subject resource.",
    valueExplanation:
      "The value is usually another resource IRI. In DBpedia data this often points to a category resource.",
    typeLabels: ["rdf:Property"],
    domain: "rdfs:Resource",
    range: "rdfs:Resource",
    isDefinedBy: "http://purl.org/dc/terms/",
    exampleObject: "am:መደብ:የኢትዮጵያ_ጸሓፊዎች",
  },
};

const NAMESPACES: readonly NamespaceInfo[] = [
  {
    iri: "http://dbpedia.org/ontology/",
    label: "DBpedia ontology",
    rdfRole: "DBpedia ontology property",
    expectedValue: "A resource IRI or literal, depending on the ontology definition.",
    plainMeaning: (compactLabel) =>
      `${compactLabel} is a curated DBpedia relationship. It is usually more stable than a raw infobox property.`,
    valueExplanation:
      "Read the value according to the property's range: it may be another linked resource, a date, a number, or text.",
    description: (compactLabel) =>
      `${compactLabel} is a DBpedia ontology predicate used to describe extracted encyclopedic facts.`,
  },
  {
    iri: "http://dbpedia.org/property/",
    label: "DBpedia raw infobox property",
    rdfRole: "DBpedia property",
    expectedValue: "A resource IRI or literal extracted from source wiki markup.",
    plainMeaning: (compactLabel) =>
      `${compactLabel} is a raw property copied from wiki source data before it is normalized into the ontology.`,
    valueExplanation:
      "The value can be messy because it follows the original wiki markup: it may be text, a number, a date, or a linked resource.",
    description: (compactLabel) =>
      `${compactLabel} is a DBpedia property derived from wiki source data.`,
  },
  {
    iri: "http://am.dbpedia.org/property/",
    label: "Amharic DBpedia raw property",
    rdfRole: "Amharic DBpedia property",
    expectedValue: "A resource IRI or literal extracted from Amharic Wikipedia.",
    plainMeaning: (compactLabel) =>
      `${compactLabel} is an Amharic DBpedia property extracted from Amharic Wikipedia source data.`,
    valueExplanation:
      "The value reflects the local source page and may be a literal, a resource IRI, or a category-style link.",
    description: (compactLabel) =>
      `${compactLabel} is an Amharic DBpedia property derived from local source data.`,
  },
  {
    iri: "http://www.w3.org/2000/01/rdf-schema#",
    label: "RDF Schema vocabulary",
    rdfRole: "RDFS vocabulary property",
    expectedValue: "Usually a literal or another RDF resource, according to the RDFS definition.",
    plainMeaning: (compactLabel) =>
      `${compactLabel} is part of RDF Schema, the standard vocabulary for naming and describing RDF resources.`,
    valueExplanation:
      "The value follows the RDFS definition. Labels and comments are literals; class and property relationships are IRIs.",
    description: (compactLabel) =>
      `${compactLabel} is a standard RDF Schema predicate used to describe RDF resources and vocabularies.`,
  },
  {
    iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    label: "RDF syntax vocabulary",
    rdfRole: "RDF vocabulary property",
    expectedValue: "Usually an RDF resource.",
    plainMeaning: (compactLabel) =>
      `${compactLabel} is part of core RDF syntax and gives basic meaning to a triple.`,
    valueExplanation:
      "The value usually points to another RDF resource that gives structural meaning, such as a class.",
    description: (compactLabel) => `${compactLabel} is part of the core RDF syntax vocabulary.`,
  },
  {
    iri: "http://xmlns.com/foaf/0.1/",
    label: "FOAF vocabulary",
    rdfRole: "FOAF vocabulary property",
    expectedValue: "A person, organization, document, or literal depending on the FOAF property.",
    plainMeaning: (compactLabel) =>
      `${compactLabel} is a FOAF relationship for people, organizations, documents, and web identity.`,
    valueExplanation:
      "The value may be a document, person, organization, or text value, depending on the exact FOAF property.",
    description: (compactLabel) =>
      `${compactLabel} is a FOAF predicate used to describe people, organizations, documents, and their relationships.`,
  },
  {
    iri: "http://purl.org/dc/terms/",
    label: "Dublin Core terms",
    rdfRole: "Dublin Core metadata property",
    expectedValue: "A resource IRI or literal metadata value.",
    plainMeaning: (compactLabel) =>
      `${compactLabel} is Dublin Core metadata used to classify or describe a resource.`,
    valueExplanation:
      "The value is metadata: commonly a topic, title, date, creator, category, or another descriptive value.",
    description: (compactLabel) =>
      `${compactLabel} is a Dublin Core metadata predicate used for resource description.`,
  },
];

const FALLBACK_NAMESPACE: NamespaceInfo = {
  iri: "",
  label: "Linked data vocabulary",
  rdfRole: "RDF predicate",
  expectedValue: "A resource IRI, blank node, or literal value.",
  plainMeaning: (compactLabel) =>
    `${compactLabel} is the relationship in the triple. It explains what the object says about the subject.`,
  valueExplanation:
    "The value can be a linked resource, a blank node, or a literal. If it is a link, it identifies another thing; if it is literal text, it is the value itself.",
  description: (compactLabel) =>
    `${compactLabel} is an RDF predicate. It forms the middle part of a triple and explains how the subject is related to the object.`,
};

export function describePredicate(iri: Iri): PredicateDescription {
  const compactLabel = compactIri(iri);
  const namespace =
    NAMESPACES.find((candidate) => iri.startsWith(candidate.iri)) ?? FALLBACK_NAMESPACE;
  const known = KNOWN_PREDICATES[iri] ?? {};
  const label = known.label ?? humanizeLocalName(localName(iri));

  return {
    iri,
    label,
    compactLabel,
    description: known.description ?? namespace.description(compactLabel, localName(iri)),
    namespaceLabel: namespace.label,
    namespaceIri: known.isDefinedBy ?? namespace.iri,
    rdfRole: known.rdfRole ?? namespace.rdfRole,
    expectedValue: known.expectedValue ?? namespace.expectedValue,
    plainMeaning: known.plainMeaning ?? namespace.plainMeaning(compactLabel),
    valueExplanation: known.valueExplanation ?? namespace.valueExplanation,
    typeLabels: known.typeLabels ?? ["rdf:Property"],
    ...(known.domain ? { domain: known.domain } : {}),
    ...(known.range ? { range: known.range } : {}),
    ...(known.isDefinedBy ? { isDefinedBy: known.isDefinedBy } : {}),
    exampleObject: known.exampleObject ?? "?object",
    ...(known.externalPage ? { externalPage: known.externalPage } : {}),
  };
}

function humanizeLocalName(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .trim()
    .toLowerCase();
}
