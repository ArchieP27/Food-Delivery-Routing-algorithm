export function drawGraphOnCanvas(
  canvas,
  graph,
  drivers,
  restaurants,
  routes,
  transportPlan
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw edges
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#cbd5e1";
  for (const e of graph.edges) {
    const a = graph.nodes[e.u];
    const b = graph.nodes[e.v];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // highlight shortest paths if present
  if (routes && routes.length) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2b6ef6";
    for (const r of routes) {
      if (!r.path || !r.path.nodes) continue;
      const nodes = r.path.nodes;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        const p = graph.nodes[nodes[i]];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }
  // draw nodes
  for (const n of graph.nodes) {
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // draw restaurants
  for (const r of restaurants) {
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(r.x, r.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "11px sans-serif";
    ctx.fillText("R", r.x - 4, r.y + 4);
  }
  // draw drivers
  for (const d of drivers) {
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(d.x, d.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "11px sans-serif";
    ctx.fillText("D", d.x - 4, d.y + 4);
  }
  // if transportPlan, draw lines proportional to mass
  if (transportPlan) {
    const colors = [
      "rgba(59,110,246,0.9)",
      "rgba(16,185,129,0.9)",
      "rgba(239,68,68,0.9)",
      "rgba(234,179,8,0.9)",
    ];
    for (let i = 0; i < transportPlan.length; i++) {
      for (let j = 0; j < transportPlan[0].length; j++) {
        const mass = transportPlan[i][j];
        if (mass < 1e-3) continue;
        const a = drivers[i];
        const b = restaurants[j];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineWidth = 2 + mass * 6;
        ctx.strokeStyle = colors[(i + j) % colors.length];
        ctx.stroke();
      }
    }
  }
}
