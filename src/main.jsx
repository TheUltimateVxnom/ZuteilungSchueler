import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Wartungsmodus global via Env
const maintenanceMode = import.meta.env.VITE_MAINTENANCE === "true";

function Root() {
  const [theme, setTheme] = useState("light");
  const [localMaintenance, setLocalMaintenance] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Dark Mode
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleAdminLogin = () => {
    if (username === "admin" && password === "1234") {
      setLocalMaintenance(true); // nur lokal
    } else {
      alert("Falsche Zugangsdaten!");
    }
    setUsername("");
    setPassword("");
    setShowLogin(false);
  };

  // Wartungsmodus anzeigen
  if (maintenanceMode || localMaintenance) {
    return (
      <div className="maintenance-overlay">
        <h1>⚠️ Wartungsmodus aktiv</h1>
        <p>Die Website ist momentan nicht verfügbar.</p>
      </div>
    );
  }

  return (
    <>
      <button id="theme-toggle" onClick={toggleTheme}>
        Toggle Dark Mode
      </button>

      <button
        id="admin-button"
        onClick={() => setShowLogin(true)}
      ></button>

      {showLogin && (
        <div className="login-popup-overlay">
          <div className="login-card">
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
            <button onClick={handleAdminLogin}>Login</button>
            <button onClick={() => setShowLogin(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Normaler Web Content */}
      <div className="main-content">
        <h1>Willkommen auf der Seite!</h1>
        <p>Hier steht dein normaler Content. Schau dir an, wie modern alles aussieht!</p>
        <button>Beispiel-Button</button>
      </div>

      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
