import { Delaunay } from "d3-delaunay";
import type { GraphModel, GraphNode } from "./model";

export function createNetwork(host: HTMLElement, onSelect: (node: GraphNode) => void) {
  const canvas = document.createElement("canvas");
  canvas.className = "atlas-network";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.ariaLabel =
    "Knowledge graph. Arrow keys select resources; Enter inspects. Drag to pan. Use the zoom buttons to magnify.";
  host.append(canvas);
  const ctx = canvas.getContext("2d");
  let graph: GraphModel = { nodes: [], edges: [] };
  let delaunay = Delaunay.from<GraphNode>(
    [],
    (node) => node.x,
    (node) => node.y,
  );
  let width = 1;
  let height = 1;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let selected = -1;
  let hover = -1;
  let frame = 0;
  let drag: { x: number; y: number; startX: number; startY: number; moved: boolean } | undefined;
  const scale = () => Math.min(width, height) * 0.43 * zoom;
  const screen = (node: GraphNode) => ({
    x: width / 2 + panX + node.x * scale(),
    y: height / 2 + panY + node.y * scale(),
  });

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function draw() {
    frame = 0;
    if (!ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const active = hover >= 0 ? hover : selected;
    for (const edge of graph.edges) {
      const fromNode = graph.nodes[edge.from];
      const toNode = graph.nodes[edge.to];
      if (!fromNode || !toNode) continue;
      const from = screen(fromNode);
      const to = screen(toNode);
      const highlighted = edge.from === active || edge.to === active;
      ctx.strokeStyle = highlighted ? "#196b77" : "#b9cedc";
      ctx.lineWidth = highlighted ? 1.8 : 0.7;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      if (highlighted && Math.hypot(to.x - from.x, to.y - from.y) > 35) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const x = to.x - Math.cos(angle) * 10;
        const y = to.y - Math.sin(angle) * 10;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle - 0.5) * 7, y - Math.sin(angle - 0.5) * 7);
        ctx.lineTo(x, y);
        ctx.lineTo(x - Math.cos(angle + 0.5) * 7, y - Math.sin(angle + 0.5) * 7);
        ctx.stroke();
      }
    }
    let labels = 0;
    graph.nodes.forEach((node, i) => {
      const { x, y } = screen(node);
      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) return;
      const activeNode = i === active;
      const baseRadius =
        graph.nodes.length > 500 ? 1.4 : graph.nodes.length > 100 ? 2.5 : node.source ? 5 : 3.5;
      const radius = activeNode ? 8 : baseRadius * Math.sqrt(zoom);
      ctx.fillStyle = activeNode ? "#ae7115" : node.source ? "#214868" : "#168383";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      if (activeNode) {
        ctx.strokeStyle = "#ae7115";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (
        activeNode ||
        (graph.nodes.length < 100 && labels < 12 && (node.source || graph.nodes.length < 18))
      ) {
        labels++;
        const label = node.label.length > 24 ? `${node.label.slice(0, 24)}...` : node.label;
        ctx.font = `${activeNode ? "600" : "400"} 13px "Noto Sans Ethiopic", system-ui, sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const textX = Math.max(5, Math.min(x + 15, width - textWidth - 8));
        ctx.fillStyle = "#f0f6fb";
        ctx.fillRect(textX - 3, y - 11, textWidth + 6, 23);
        ctx.fillStyle = "#18364c";
        ctx.fillText(label, textX, y + 5);
      }
    });
  }
  function hit(event: PointerEvent): number {
    if (!graph.nodes.length) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const index = delaunay.find(
      (x - width / 2 - panX) / scale(),
      (y - height / 2 - panY) / scale(),
      Math.max(hover, 0),
    );
    const node = graph.nodes[index];
    if (!node) return -1;
    const point = screen(node);
    return Math.hypot(x - point.x, y - point.y) <= 20 ? index : -1;
  }
  function choose(index: number) {
    const node = graph.nodes[index];
    if (!node) return;
    selected = index;
    onSelect(node);
    schedule();
  }
  canvas.onpointerdown = (event) => {
    if (event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    drag = {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };
  canvas.onpointermove = (event) => {
    if (drag) {
      panX += event.clientX - drag.x;
      panY += event.clientY - drag.y;
      drag.moved ||= Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4;
      drag.x = event.clientX;
      drag.y = event.clientY;
      schedule();
    } else {
      const next = hit(event);
      if (next !== hover) {
        hover = next;
        schedule();
      }
      canvas.style.cursor = next < 0 ? "grab" : "pointer";
      canvas.title = graph.nodes[next]?.label ?? "Drag to pan";
    }
  };
  canvas.onpointerup = (event) => {
    if (drag && !drag.moved) choose(hit(event));
    drag = undefined;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  canvas.onpointercancel = () => {
    drag = undefined;
  };
  canvas.onpointerleave = () => {
    hover = -1;
    schedule();
  };
  canvas.onkeydown = (event) => {
    if (!graph.nodes.length) return;
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      hover = -1;
      const delta = ["ArrowLeft", "ArrowUp"].includes(event.key)
        ? -1
        : ["Enter", " "].includes(event.key)
          ? 0
          : 1;
      choose((Math.max(selected, 0) + delta + graph.nodes.length) % graph.nodes.length);
    }
  };
  const observer = new ResizeObserver(() => {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    schedule();
  });
  observer.observe(host);
  return {
    setGraph(next: GraphModel) {
      graph = next;
      delaunay = Delaunay.from(
        graph.nodes,
        (node) => node.x,
        (node) => node.y,
      );
      selected = -1;
      hover = -1;
      zoom = 1;
      panX = 0;
      panY = 0;
      schedule();
    },
    select(id: string) {
      selected = graph.nodes.findIndex((node) => node.id === id);
      schedule();
    },
    zoom(factor: number) {
      zoom = Math.min(6, Math.max(0.5, zoom * factor));
      schedule();
    },
    reset() {
      zoom = 1;
      panX = 0;
      panY = 0;
      schedule();
    },
    dispose() {
      observer.disconnect();
      cancelAnimationFrame(frame);
    },
  };
}
