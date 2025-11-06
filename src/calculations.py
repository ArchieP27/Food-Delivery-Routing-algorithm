import numpy as np
import pandas as pd

# -------------------------
# 1. Graph Definition
# -------------------------
nodes = [
    {"id": 0, "x": 0.1, "y": 0.1, "type": "street"},
    {"id": 1, "x": 0.25, "y": 0.15, "type": "street"},
    {"id": 2, "x": 0.5, "y": 0.1, "type": "user", "label": "Point 1"},
    {"id": 3, "x": 0.2, "y": 0.3, "type": "user", "label": "Point 2"},
    {"id": 4, "x": 0.4, "y": 0.35, "type": "street"},
    {"id": 5, "x": 0.6, "y": 0.3, "type": "user", "label": "Point 3"},
    {"id": 6, "x": 0.7, "y": 0.5, "type": "street"},
    {"id": 7, "x": 0.8, "y": 0.4, "type": "user", "label": "Point 4"},
    {"id": 8, "x": 0.25, "y": 0.5, "type": "street"},
    {"id": 9, "x": 0.5, "y": 0.6, "type": "restaurant", "name": "Pizza"},
    {"id": 10, "x": 0.7, "y": 0.6, "type": "restaurant", "name": "Burger"},
    {"id": 11, "x": 0.9, "y": 0.5, "type": "restaurant", "name": "Salad"},
    {"id": 12, "x": 0.5, "y": 0.8, "type": "street"},
    {"id": 13, "x": 0.3, "y": 0.7, "type": "street"},
]

edges = [
    (0, 1), (1, 2), (1, 3), (2, 4), (3, 4),
    (4, 5), (4, 6), (5, 7), (6, 7), (6, 10),
    (7, 11), (8, 3), (8, 13), (12, 9), (12, 10),
    (13, 9), (9, 10), (10, 11)
]

# -------------------------
# 2. Distance function
# -------------------------
def distance(a, b):
    return np.hypot(a["x"] - b["x"], a["y"] - b["y"])

# -------------------------
# 3. Dijkstra shortest path
# -------------------------
def dijkstra(start_id, end_id):
    n_nodes = len(nodes)
    dist = [float("inf")] * n_nodes
    prev = [None] * n_nodes
    dist[start_id] = 0
    unvisited = set(range(n_nodes))

    def neighbors(node_id):
        return [v if u == node_id else u for u, v in edges if node_id in (u, v)]

    while unvisited:
        u = min(unvisited, key=lambda x: dist[x])
        if u == end_id or dist[u] == float("inf"):
            break
        unvisited.remove(u)
        for v in neighbors(u):
            if v not in unvisited:
                continue
            alt = dist[u] + distance(nodes[u], nodes[v])
            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u

    path, u = [], end_id
    while u is not None:
        path.insert(0, u)
        u = prev[u]
    return {"path": path, "distance": dist[end_id]}

# -------------------------
# 4. Sinkhorn Optimal Transport
# -------------------------
def sinkhorn(cost_matrix, a=None, b=None, epsilon=0.1, max_iter=200):
    cost_matrix = np.array(cost_matrix)
    n_rows, n_cols = cost_matrix.shape
    if a is None:
        a = np.ones(n_rows) / n_rows
    if b is None:
        b = np.ones(n_cols) / n_cols

    K = np.exp(-cost_matrix / epsilon)
    u = np.ones(n_rows)
    v = np.ones(n_cols)

    for _ in range(max_iter):
        u = a / (K @ v)
        v = b / (K.T @ u)

    P = np.outer(u, v) * K
    return P

# -------------------------
# 5. Prepare distance matrix for OT
# -------------------------
user_nodes = [n for n in nodes if n["type"] == "user"]
restaurant_nodes = [n for n in nodes if n["type"] == "restaurant"]

cost_matrix = []
for r in restaurant_nodes:
    row = [dijkstra(r["id"], u["id"])["distance"] for u in user_nodes]
    cost_matrix.append(row)

# Apply Sinkhorn OT
P = sinkhorn(cost_matrix)

# -------------------------
# 6. Create distance table
# -------------------------
table_data = []
for i, r in enumerate(restaurant_nodes):
    row = {"Restaurant": r["name"]}
    for j, u in enumerate(user_nodes):
        row[u["label"]] = round(cost_matrix[i][j], 3)
    table_data.append(row)

df = pd.DataFrame(table_data)
print("Delivery Distance Table (Restaurant → User Point)")
print(df)

# -------------------------
# 7. Optimal assignment
# -------------------------
assignment = []
for i in range(len(restaurant_nodes)):
    j = np.argmax(P[i])  # highest transport probability
    assignment.append((restaurant_nodes[i]["name"], user_nodes[j]["label"], round(cost_matrix[i][j],3)))

print("\nOptimal Delivery Assignment (Restaurant → User Point):")
for r, u, dist in assignment:
    print(f"{r} → {u} : Distance = {dist}")
