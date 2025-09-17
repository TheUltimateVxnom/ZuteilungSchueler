import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Maintenance from "./Maintenance.jsx";
import "./index.css";

function Root() {
  const [theme, setTheme] = useState("dark");
  const maintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Theme Toggle bleibt immer sichtbar */}
      <div className="theme-toggle-container" style={{ position: "fixed", top: 10, right: 10, zIndex: 999 }}>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === "dark" ? "🌞 Hell" : "🌙 Dunkel"}
        </button>
      </div>

      {/* Inhalt abhängig vom Maintenance-Modus */}
      {maintenance ? <Maintenance /> : <App />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
