import { localName } from "@amdb/core";
import type { Triple } from "./data";

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  source: boolean;
}
export interface GraphEdge {
  from: number;
  to: number;
  label: string;
}
export interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraph(rows: readonly Triple[]): GraphModel {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const indices = new Map<string, number>();
  function add(id: string, source: boolean): number {
    const existing = indices.get(id);
    if (existing !== undefined) {
      const node = nodes[existing];
      if (source && node) node.source = true;
      return existing;
    }
    const index = nodes.length;
    indices.set(id, index);
    nodes.push({ id, label: localName(id), x: 0, y: 0, source });
    return index;
  }
  for (const row of rows) {
    if (row.subject.type !== "uri") continue;
    const from = add(row.subject.value, true);
    if (row.object.type === "uri") {
      edges.push({ from, to: add(row.object.value, false), label: localName(row.predicate.value) });
    }
  }
  // Place subject hubs on a spiral and their objects locally, without force simulation ticks.
  const hubs = nodes.filter((node) => node.source);
  hubs.forEach((node, i) => {
    const radius = hubs.length === 1 ? 0 : Math.sqrt((i + 0.5) / hubs.length) * 0.7;
    node.x = Math.cos(i * 2.399963) * radius;
    node.y = Math.sin(i * 2.399963) * radius;
  });
  const children = new Map<number, number[]>();
  const placed = new Set<number>();
  for (const edge of edges) {
    if (nodes[edge.to]?.source || placed.has(edge.to)) continue;
    placed.add(edge.to);
    const group = children.get(edge.from) ?? [];
    group.push(edge.to);
    children.set(edge.from, group);
  }
  for (const [parent, group] of children) {
    const hub = nodes[parent];
    if (!hub) continue;
    group.forEach((index, i) => {
      const radius =
        (hubs.length === 1 ? 0.85 : Math.min(0.24, 0.9 / Math.sqrt(hubs.length))) *
        Math.sqrt((i + 1) / group.length);
      const node = nodes[index];
      if (!node) return;
      const angle = (i + parent) * 2.399963;
      node.x = hub.x + Math.cos(angle) * radius;
      node.y = hub.y + Math.sin(angle) * radius;
    });
  }
  return { nodes, edges };
}
