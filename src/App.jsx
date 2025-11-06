import React, { useState, useEffect } from "react";
import Map from "./Map.jsx";
import { nodes, edges, shortestPath, allPaths } from "./graph.js";

const userPoints = nodes.filter((n) => n.type === "user");
const restaurants = nodes.filter((n) => n.type === "restaurant");

export default function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [pathsData, setPathsData] = useState([]);
  const [optimalData, setOptimalData] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (orderPlaced && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, orderPlaced]);

  

  function selectUser(node) {
    setSelectedUser(node);
    setMessage("");
  }
  function selectRestaurant(node) {
    setSelectedRestaurant(node);
    setMessage("");
  }

  function placeOrder() {
    if (!selectedUser || !selectedRestaurant) {
      setMessage("Select both your location and restaurant!");
      return;
    }
    const pathsArr = allPaths(selectedUser.id, selectedRestaurant.id).map(
      (p) => ({ restaurant: selectedRestaurant, paths: [p] })
    );
    const optimalArr = [
      {
        restaurant: selectedRestaurant,
        optimal: shortestPath(selectedRestaurant.id, selectedUser.id).path,
      },
    ];

    setPathsData(pathsArr);
    setOptimalData(optimalArr);
    const dt = Math.floor(Math.random() * 10) + 5;
    setDeliveryTime(dt);
    setCountdown(dt * 60);
    setOrderPlaced(true);
  }

  function reset() {
    setSelectedUser(null);
    setSelectedRestaurant(null);
    setPathsData([]);
    setOptimalData([]);
    setDeliveryTime(null);
    setCountdown(null);
    setOrderPlaced(false);
    setMessage("");
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60),
      s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className="app">
      <div className="left-panel">
        <h1>FOOD DELIVERY APPLICATION</h1>
        <Map
          nodes={nodes}
          edges={edges}
          selectedUser={selectedUser}
          pathsData={pathsData}
          optimalData={optimalData}
          deliveryPlaced={orderPlaced}
        />
      </div>

      <div className="right-panel">
        {message && <div className="message">{message}</div>}

        {!orderPlaced && (
          <>
            <h2>Select Delivery Point</h2>
            <div className="controls">
              <div className="user-buttons-container">
                {userPoints.map((u) => (
                  <button
                    key={u.id}
                    className={`user-btn ${
                      selectedUser?.id === u.id ? "selected" : ""
                    }`}
                    onClick={() => selectUser(u)}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <h2>Select Restaurant</h2>
            <div className="controls">
              <div className="rest-buttons-container">
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    className={`rest-btn ${
                      selectedRestaurant?.id === r.id ? "selected" : ""
                    }`}
                    onClick={() => selectRestaurant(r)}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn" onClick={placeOrder}>
              Place Order
            </button>
          </>
        )}

        {orderPlaced && (
          <div className="order-info">
            <h2>Order Placed!</h2>
            <p>
              Restaurant: {selectedRestaurant.emoji} {selectedRestaurant.name}
            </p>
            <p>Delivery Point: {selectedUser.label}</p>
            <p>
              Distance:{" "}
              {shortestPath(
                selectedUser.id,
                selectedRestaurant.id
              ).distance.toFixed(2)}
            </p>
            <p>Estimated Delivery Time: {deliveryTime} minutes</p>
            <p>Countdown: {formatTime(countdown)}</p>
            <button className="btn" onClick={reset}>
              New Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}