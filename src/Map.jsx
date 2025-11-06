import React, { useEffect, useState } from "react";

export default function Map({
  nodes,
  edges,
  selectedUser,
  pathsData,
  optimalData,
  deliveryPlaced,
}) {
  const width = 700,
    height = 500;
  const [deliveryPos, setDeliveryPos] = useState(null);

  function scale(n) {
    return { x: n.x * width, y: n.y * height };
  }

  useEffect(() => {
    if (deliveryPlaced && optimalData.length > 0) {
      // Ensure the path starts at the user node
      const path = optimalData[0].optimal.map((id) => scale(nodes[id]));
      let index = 0;
      const interval = setInterval(() => {
        if (index >= path.length) {
          clearInterval(interval);
          return;
        }
        setDeliveryPos(path[index]);
        index++;
      }, 300); // adjust speed
      return () => clearInterval(interval);
    }
  }, [deliveryPlaced, optimalData, nodes]);

  // Draw edges
  const edgeLines = edges.map((e, i) => {
    const from = scale(nodes[e[0]]);
    const to = scale(nodes[e[1]]);
    return (
      <line
        key={i}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#ccc"
        strokeWidth="2"
      />
    );
  });

  // Alternative paths (red)
  const pathLines = pathsData.flatMap((rData, i) =>
    rData.paths.flatMap((p) =>
      p.map((nodeId, j) => {
        if (j === p.length - 1) return null;
        const from = scale(nodes[p[j]]);
        const to = scale(nodes[p[j + 1]]);
        return (
          <line
            key={`p-${i}-${j}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#f00"
            strokeWidth="2"
          />
        );
      })
    )
  );

  // Optimal path (green)
  const optimalLines = optimalData.flatMap((rData, i) =>
    rData.optimal.map((nodeId, j) => {
      if (j === rData.optimal.length - 1) return null;
      const from = scale(nodes[rData.optimal[j]]);
      const to = scale(nodes[rData.optimal[j + 1]]);
      return (
        <line
          key={`o-${i}-${j}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#10b981"
          strokeWidth="4"
        />
      );
    })
  );

  // Draw nodes (keep original colors)
  const nodeCircles = nodes.map((n) => {
    const pos = scale(n);
    let color = "#111";
    let label = "";

    if (n.type === "user") {
      color = "#3b82f6"; // user node color
      label = n.label;
    }
    if (n.type === "restaurant") {
      color = "#ef4444"; // restaurant node color
      label = n.emoji;
    }

    return (
      <g key={n.id} className="node">
        <circle cx={pos.x} cy={pos.y} r={12} fill={color} />
        <text x={pos.x} y={pos.y - 18} fontSize="16" textAnchor="middle">
          {label}
        </text>
        <title>
          {n.type === "restaurant" ? `${n.name} ${n.emoji}` : n.label}
        </title>
      </g>
    );
  });

  const selected = selectedUser ? (
    <circle
      cx={scale(selectedUser).x}
      cy={scale(selectedUser).y}
      r={14}
      fill="#2563eb"
      stroke="white"
      strokeWidth="2"
    />
  ) : null;

  const deliveryIcon = deliveryPos ? (
    <text x={deliveryPos.x} y={deliveryPos.y - 25} fontSize="20">
      🛵
    </text>
  ) : null;

  return (
    <svg
      width={width}
      height={height}
      style={{
        margin: "20px auto",
        display: "block",
        background: "#f3f4f6",
        border: "1px solid #ccc",
      }}
    >
      {edgeLines}
      {pathLines}
      {optimalLines}
      {nodeCircles}
      {selected}
      {deliveryIcon}
    </svg>
  );
}