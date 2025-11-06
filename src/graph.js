// graph.js

// --- Node Definitions: Increased complexity with more street and black (blocked) nodes ---
export const nodes = [
  // Layer 1: Top-Left to Center-Top
  { id: 0, x: 0.05, y: 0.05, type: "street" },
  { id: 1, x: 0.2, y: 0.1, type: "street" },
  { id: 2, x: 0.45, y: 0.08, type: "user", label: "P1: Home" },
  { id: 3, x: 0.1, y: 0.25, type: "user", label: "P2: Work" },

  // Layer 2: Center-Left to Center
  { id: 4, x: 0.35, y: 0.2, type: "street" },
  { id: 5, x: 0.6, y: 0.25, type: "user", label: "P3: Park" },
  { id: 6, x: 0.75, y: 0.4, type: "street" },
  { id: 7, x: 0.85, y: 0.3, type: "user", label: "P4: Office" },
  { id: 8, x: 0.25, y: 0.4, type: "street" },

  // Layer 3: Restaurant/Delivery Zone
  {
    id: 9,
    x: 0.45,
    y: 0.55,
    type: "restaurant",
    emoji: "🍕",
    name: "Pizza Palace",
  },
  {
    id: 10,
    x: 0.65,
    y: 0.6,
    type: "restaurant",
    emoji: "🍔",
    name: "Burger Joint",
  },
  {
    id: 11,
    x: 0.9,
    y: 0.5,
    type: "restaurant",
    emoji: "🥗",
    name: "Salad Stop",
  },

  // Layer 4: Lower Street Grid
  { id: 12, x: 0.5, y: 0.8, type: "street" },
  { id: 13, x: 0.3, y: 0.7, type: "street" },
  { id: 14, x: 0.75, y: 0.75, type: "street" },
  { id: 15, x: 0.15, y: 0.6, type: "street" },
  { id: 16, x: 0.4, y: 0.9, type: "street" },
  { id: 17, x: 0.85, y: 0.9, type: "street" },

  // BLOCKED ZONES (Type: "black") - Creates major detours! 🚧
  { id: 18, x: 0.4, y: 0.4, type: "black" }, // Center Blockade
  { id: 19, x: 0.55, y: 0.15, type: "black" }, // Blocks direct path between 2 and 5
  { id: 20, x: 0.08, y: 0.45, type: "black" }, // West Side Blockade
  { id: 21, x: 0.7, y: 0.5, type: "black" }, // Blocks area between 6, 10, 11
  { id: 22, x: 0.6, y: 0.75, type: "black" }, // South-Center Blockade
  { id: 23, x: 0.2, y: 0.85, type: "black" }, // South-West Blockade
];

// --- Edge Definitions: Many more connections for branching paths ---
export const edges = [
  // Top-Left Connections
  [0, 1],
  [0, 3],
  [0, 20], // Connects to Black
  [1, 2],
  [1, 4],
  [2, 4],
  [2, 19], // Connects to Black
  [3, 8],
  [3, 4],
  [3, 20], // Connects to Black

  // Center Connections (Routing around major block 18)
  [4, 5],
  [4, 8],
  [4, 18], // Connects to Black
  [5, 6],
  [5, 7],
  [5, 19], // Connects to Black
  [6, 7],
  [6, 10],
  [6, 21], // Connects to Black
  [8, 15],
  [8, 13],
  [8, 18], // Connects to Black

  // Restaurant/Delivery Zone Connections (Must bypass 21 and 22)
  [9, 10],
  [9, 13],
  [9, 12],
  [10, 14],
  [10, 21],
  [10, 22], // Connects to Black
  [11, 6],
  [11, 7],
  [11, 14],

  // Lower Street Grid Connections
  [12, 16],
  [12, 14],
  [12, 22], // Connects to Black
  [13, 15],
  [13, 16],
  [14, 17],
  [15, 23], // Connects to Black
  [16, 17],
];

// --- Utility Function: Calculate Euclidean Distance ---
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// --- Utility Function: Get Valid Neighbors ---
function getNeighbors(id) {
  return edges
    .filter((e) => e[0] === id || e[1] === id)
    .map((e) => (e[0] === id ? e[1] : e[0]))
    .filter((nid) => {
      // Ensure the neighbor ID is within the bounds of the nodes array
      const node = nodes[nid];
      return node && node.type !== "black";
    });
}

// --- Shortest Path (Dijkstra's Algorithm) ---
export function shortestPath(startId, endId) {
  const dist = Array(nodes.length).fill(Infinity);
  const prev = Array(nodes.length).fill(null);
  dist[startId] = 0;
  const unvisited = new Set(nodes.map((n) => n.id));

  // Initialize unvisited set, skipping blocked nodes
  nodes.forEach((n) => {
    if (n.type === "black") unvisited.delete(n.id);
  });

  while (unvisited.size > 0) {
    let u = null;
    unvisited.forEach((n) => {
      if (u === null || dist[n] < dist[u]) u = n;
    });

    if (u === null || u === endId || dist[u] === Infinity) break;
    unvisited.delete(u);

    getNeighbors(u).forEach((v) => {
      if (!unvisited.has(v)) return;
      const alt = dist[u] + distance(nodes[u], nodes[v]);
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    });
  }

  const path = [];
  let u = endId;
  while (u !== null && u !== undefined) {
    path.unshift(u);
    u = prev[u];
  }

  if (path[0] !== startId) return { path: [], distance: Infinity };

  return { path, distance: dist[endId] };
}

// --- All Simple Paths (Depth-First Search) ---
export function allPaths(startId, endId) {
  const allFoundPaths = [];

  // DFS recursive function
  function findPath(currentId, currentPath, visited) {
    // Stop if the path gets excessively long to prevent browser lockup
    if (currentPath.length > 20) return;

    currentPath = [...currentPath, currentId];
    visited = new Set(visited).add(currentId);

    if (currentId === endId) {
      allFoundPaths.push(currentPath);
      return;
    }

    getNeighbors(currentId).forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        findPath(neighborId, currentPath, visited);
      }
    });
  }

  findPath(startId, [], new Set());

  // Sort paths by length and only return the shortest few to avoid cluttering the map
  allFoundPaths.sort((a, b) => a.length - b.length);

  // Return the shortest path, plus up to 4 other relatively short paths
  return allFoundPaths.slice(0, 5);
}