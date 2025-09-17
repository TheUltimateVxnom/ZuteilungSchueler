import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function Root() {
  const [theme, setTheme] = useState("light");
  const [maintenance, setMaintenance] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Dark Mode
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Wartungsmodus Login prüfen
  const handleMaintenanceLogin = () => {
    if (username === "admin" && password === "1234") {
      setMaintenance(true); // Wartungsmodus aktiv
    } else {
      alert("Falsche Zugangsdaten!");
    }
    setUsername("");
    setPassword("");
    setShowLogin(false);
  };

  if (maintenance) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111",
          color: "#fff",
          flexDirection: "column",
          fontFamily: "sans-serif",
        }}
      >
        <h1>⚠️ Wartungsmodus aktiv</h1>
        <p>Die Website ist momentan nicht verfügbar.</p>
      </div>
    );
  }

  return (
    <>
      {/* Dark Mode Button */}
      <button
        id="theme-toggle"
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          padding: "8px 12px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          backgroundColor: "var(--card-bg)",
          color: "var(--text-color)",
          fontWeight: "bold",
          transition: "background-color 0.3s",
          zIndex: 1000,
        }}
      >
        Toggle Dark Mode
      </button>

      {/* Versteckter Wartungsmodus-Button unten links */}
      <button
        onClick={() => setShowLogin(true)}
        style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          opacity: 0.2,
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 1000,
          backgroundColor: "var(--text-color)",
        }}
      ></button>

      {/* Login-Popup */}
      {showLogin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minWidth: "300px",
            }}
          >
            <h2>Admin Login</h2>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleMaintenanceLogin}>Login</button>
            <button onClick={() => setShowLogin(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
