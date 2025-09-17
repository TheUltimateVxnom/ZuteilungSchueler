import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Maintenance from "./Maintenance.jsx";
import "./index.css";

function Root() {
  const [theme, setTheme] = useState("dark");

  // Theme anwenden
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Wartungsmodus aus Environment Variable
  const maintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  return (
    <>
      {/* Theme-Toggle immer sichtbar */}
      <div className="theme-toggle-container">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === "dark" ? "🌞 Hell" : "🌙 Dunkel"}
        </button>
      </div>

      {/* Content */}
      {maintenance ? <Maintenance /> : <App />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
