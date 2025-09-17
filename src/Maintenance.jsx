import React, { useState, useEffect } from "react";

export default function Maintenance() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="app-container" style={{textAlign:"center", paddingTop:"100px"}}>
      {/* Theme Toggle Button */}
      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === "dark" ? "🌞 Hell" : "🌙 Dunkel"}
        </button>
      </div>

      <h1>⚠️ Wartungsarbeiten ⚠️</h1>
      <p>Die Website ist derzeit im Wartungsmodus. Bitte später wiederkommen.</p>
    </div>
  );
}
