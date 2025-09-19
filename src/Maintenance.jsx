import React, { useState, useEffect, useRef } from "react";

function MenuDropdown({ theme, toggleTheme, onShowTimeline, onShowApp, view }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Schließt das Menü, wenn außerhalb geklickt wird
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="menu-dropdown-container" ref={ref}>
      <button
        className="menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menü öffnen"
      >
        ☰
      </button>
      {open && (
        <div className="menu-dropdown">
          <button className="menu-item" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dunkel" : "☀️ Hell"}
          </button>
          <div className="menu-divider" />
        </div>
      )}
    </div>
  );
}

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
    <>
      <footer className="footer">
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline", cursor: "pointer" }}
        >
          © Lukas Diezinger, Beta v2.0.40
        </a>
      </footer>
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
        <MenuDropdown theme={theme} toggleTheme={toggleTheme} />
        <section className="card maintenance-glow" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h1>🚧 Wartungsmodus aktiv</h1>
          <p>Die Seite wird gerade aktualisiert. Bitte später erneut versuchen.</p>
        </section>
      </div>
    </>
  );
}
