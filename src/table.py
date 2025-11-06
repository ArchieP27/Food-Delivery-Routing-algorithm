import numpy as np
import pandas as pd

# -------------------------
# Graph Definition
# -------------------------
nodes = [
    {"id": 2, "x": 0.5, "y": 0.1, "type": "user", "label": "Point 1"},
    {"id": 3, "x": 0.2, "y": 0.3, "type": "user", "label": "Point 2"},
    {"id": 5, "x": 0.6, "y": 0.3, "type": "user", "label": "Point 3"},
    {"id": 7, "x": 0.8, "y": 0.4, "type": "user", "label": "Point 4"},
    {"id": 9, "x": 0.5, "y": 0.6, "type": "restaurant", "name": "Pizza"},
    {"id": 10, "x": 0.7, "y": 0.6, "type": "restaurant", "name": "Burger"},
    {"id": 11, "x": 0.9, "y": 0.5, "type": "restaurant", "name": "Salad"},
]

edges = [
    (2, 3), (2, 5), (3, 5), (5, 7), (5, 9), (7, 10), (9, 10), (10, 11)
]

# -------------------------
# Distance function
# -------------------------
def distance(a, b):
    return np.hypot(a["x"] - b["x"], a["y"] - b["y"])

# -------------------------
# Dijkstra shortest path
# -------------------------
def dijkstra(start_id, end_id):
    n_nodes = len(nodes)
    dist = [float("inf")] * n_nodes
    prev = [None] * n_nodes
    node_ids = [n["id"] for n in nodes]
    start_index = node_ids.index(start_id)
    end_index = node_ids.index(end_id)
    dist[start_index] = 0
    unvisited = set(range(n_nodes))

    def neighbors(idx):
        return [node_ids.index(v if u == node_ids[idx] else u)
                for u, v in edges if node_ids[idx] in (u, v)]

    while unvisited:
        u = min(unvisited, key=lambda x: dist[x])
        if u == end_index or dist[u] == float("inf"):
            break
        unvisited.remove(u)
        for v in neighbors(u):
            if v not in unvisited:
                continue
            alt = dist[u] + distance(nodes[u], nodes[v])
            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u

    path, u = [], end_index
    while u is not None:
        path.insert(0, node_ids[u])
        u = prev[u]
    return {"path": path, "distance": dist[end_index]}

# -------------------------
# Distance Table
# -------------------------
user_nodes = [n for n in nodes if n["type"] == "user"]
restaurant_nodes = [n for n in nodes if n["type"] == "restaurant"]

table_data = []
for r in restaurant_nodes:
    row = {"Restaurant": r["name"]}
    for u in user_nodes:
        row[u["label"]] = round(dijkstra(r["id"], u["id"])["distance"], 3)
    table_data.append(row)

df = pd.DataFrame(table_data)
print("Delivery Distance Table (Restaurant → User Point)\n")
print(df.to_string(index=False))
