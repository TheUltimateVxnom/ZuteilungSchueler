import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Maintenance from "./Maintenance.jsx";
import "./index.css";

function Root() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Wartungsmodus aus Environment Variable
  const maintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";
  console.log("Maintenance mode:", maintenance); // Testausgabe

  return (
    <>
      {/* Theme-Toggle immer sichtbar */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 999 }}>
        <button onClick={toggleTheme}>
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
