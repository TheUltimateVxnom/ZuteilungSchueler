import React, { useState, useEffect } from "react";

export default function Maintenance() {
  const [theme, setTheme] = useState("light");

  // Theme beim Mount setzen
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Theme wechseln
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="app-container" style={{ textAlign: "center", paddingTop: "50px" }}>
      {/* Dark/Light Mode Button */}
      <div className="theme-toggle-container">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dunkel" : "☀️ Hell"}
        </button>
      </div>

      <h1>🚧 Wartungsmodus aktiv</h1>
      <p>Die Seite wird gerade aktualisiert. Bitte später erneut versuchen.</p>

      <footer className="footer" style={{ marginTop: "50px" }}>
        © Lukas Diezinger
      </footer>
    </div>
  );
}
