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
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        paddingTop: 0,
      }}
    >
      <div className="theme-toggle-container">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dunkel" : "☀️ Hell"}
        </button>
      </div>
      <section className="card maintenance-glow" style={{ maxWidth: 500, margin: "0 auto" }}>
        <h1>🚧 Wartungsmodus aktiv</h1>
        <p>Die Seite wird gerade aktualisiert. Bitte später erneut versuchen.</p>
      </section>
      <footer className="footer">
        <a
          href="https://github.com/TheUltimateVxnom/ZuteilungSchueler/tree/main?tab=BSD-3-Clause-1-ov-file"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline", cursor: "pointer" }}
        >
          © Lukas Diezinger, v1.01
        </a>
      </footer>
    </div>
  );
}
