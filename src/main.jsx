import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Maintenance from "./Maintenance.jsx"; // neu
import "./index.css";

function Root() {
  const [theme, setTheme] = useState("dark");
  const maintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true"; // prüfung

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (maintenance) {
    return <Maintenance />; // zeigt Wartungsseite
  }

  return (
    <>
      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === "dark" ? "🌞 Hell" : "🌙 Dunkel"}
        </button>
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
