import React, { useState, useEffect } from "react";

export default function Maintenance() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="app-container" style={{ textAlign: "center", paddingTop: "50px" }}>
      <div className="theme-toggle-container">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dunkel" : "☀️ Hell"}
        </button>
      </div>

      <div className="app-inner">
        <section className="card" style={{ maxWidth: 500, margin: "40px auto" }}>
          <h1>🚧 Wartungsmodus aktiv</h1>
          <p>Die Seite wird gerade aktualisiert. Bitte später erneut versuchen.</p>
        </section>
        <footer className="footer" style={{ marginTop: "50px" }}>
          © Lukas Diezinger
        </footer>
      </div>
    </div>
  );
}
