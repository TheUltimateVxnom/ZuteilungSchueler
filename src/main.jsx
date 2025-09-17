import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Dark Mode Wrapper
function Root() {
  const [theme, setTheme] = useState("light");

  // Theme auf <html> setzen
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
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
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
