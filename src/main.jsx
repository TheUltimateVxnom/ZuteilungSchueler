import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

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
      {/* Dark/Light Mode Button unten rechts */}
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
