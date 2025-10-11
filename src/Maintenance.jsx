import React, { useState, useEffect, useRef } from "react";
import TextType from './TextType';
import './TextType.css';

function MenuDropdown({ theme, toggleTheme, showSnake, onShow404, accent, onAccentChange }) {
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
          <div className="menu-item" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ display: 'block' }}>Akzentfarbe wählen</span>
            <input
              aria-label="Accent color"
              type="color"
              className="color-picker"
              value={accent}
              onChange={(e) => onAccentChange(e.target.value)}
            />
            <button
              className="menu-item"
              onClick={() => { onAccentChange('#4f46e5'); setOpen(false); }}
              style={{ marginTop: 6 }}
            >
              Zurücksetzen
            </button>
          </div>
          <div className="menu-divider" />
          <button className="menu-item" onClick={() => { setOpen(false); showSnake(); }}>
            🐍 Snake spielen
          </button>
          
        </div>
      )}
    </div>
  );
}

export default function Maintenance({ initialView } = {}) {
  const [theme, setTheme] = useState("light");
  // Load persisted accent if present so reload restores user's choice
  const [accent, setAccent] = useState(() => localStorage.getItem('schueler_accent') || '#4f46e5');
  const [snakeOpen, setSnakeOpen] = useState(false);
  // Always show the 404 maintenance redesign by default
  const [view, setView] = useState('404'); // "404" only
  const [savedRedirect, setSavedRedirect] = useState(() => localStorage.getItem('schueler_redirect_choice') || null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    // Apply persisted accent (if any)
    try { document.documentElement.style.setProperty('--accent', accent); } catch (e) {}
    try { document.documentElement.style.setProperty('--accent-hover', shadeColor(accent, -12)); } catch (e) {}
    try { document.documentElement.style.setProperty('--accent-rgb', hexToRgbString(accent)); } catch (e) {}
  }, []);

  // Keep local theme state in sync with document's data-theme (main.jsx might set it)
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const docTheme = document.documentElement.getAttribute('data-theme');
      if (docTheme && docTheme !== theme) setTheme(docTheme);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleAccentChange = (hex) => {
    setAccent(hex);
    try { document.documentElement.style.setProperty('--accent', hex); } catch (e) {}
    try { document.documentElement.style.setProperty('--accent-hover', shadeColor(hex, -12)); } catch (e) {}
    try { document.documentElement.style.setProperty('--accent-rgb', hexToRgbString(hex)); } catch (e) {}
    try { localStorage.setItem('schueler_accent', hex); } catch (e) {}
  };

  // small helper to darken/lighten hex color
  function shadeColor(hex, percent) {
    // hex in format #rrggbb
    const h = hex.replace('#','');
    const num = parseInt(h,16);
    let r = (num >> 16) + Math.round(255 * (percent/100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent/100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent/100));
    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);
    return '#' + ( (1<<24) + (r<<16) + (g<<8) + b ).toString(16).slice(1);
  }

  function hexToRgbString(hex) {
    const h = hex.replace('#','');
    const num = parseInt(h,16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r},${g},${b}`;
  }

  return (
    <>
      <footer className="footer">
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline", cursor: "pointer" }}
        >
          © Lukas Diezinger, Release v4.0
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
        {view !== "404" && (
          <MenuDropdown
            theme={theme}
            toggleTheme={toggleTheme}
            showSnake={() => setSnakeOpen(true)}
            onShow404={() => setView("404")}
            accent={accent}
            onAccentChange={handleAccentChange}
          />
        )}
        {/* old main maintenance card removed so the 404 redesign is shown by default */}
        {view === "404" && (
          <section className="card maintenance-404-card" style={{ maxWidth: 700, margin: "60px auto", textAlign: "center" }}>
            <h1 style={{ margin: 0 }}>
              {/* plain 404 heading; blink/glow handled via CSS class */}
              <div className="maintenance-404">404</div>
            </h1>
            <p style={{ marginTop: 12, fontSize: 18 }}>Die Website ist in Wartung oder nicht verfügbar</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  // If a redirect choice is already saved, use it
                  const stored = localStorage.getItem('schueler_redirect_choice');
                  if (stored) {
                    window.location.href = stored;
                    return;
                  }
                  // choose randomly from three links and navigate in the same tab
                  const urls = [
                    'https://zus.onrender.com/',
                    'https://ztsl.onrender.com/',
                    'https://ztlr.onrender.com/'
                  ];
                  const choice = urls[Math.floor(Math.random() * urls.length)];
                  try { localStorage.setItem('schueler_redirect_choice', choice); setSavedRedirect(choice); } catch (e) {}
                  // open in same tab so the user leaves the maintenance page
                  window.location.href = choice;
                }}
              >
                Erneut laden
              </button>
            </div>
          </section>
        )}
        {snakeOpen && <SnakeOverlay onClose={() => setSnakeOpen(false)} />}
      </div>
    </>
  );
}

function SnakeOverlay({ onClose }) {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);

  // Größeres Spielfeld
  const size = 20;
  const tile = 22;
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 15 });

  // Steuerung
  useEffect(() => {
    function handleKey(e) {
      if (!started) return;
      if (!running && e.key === "Enter") {
        restart();
        return;
      }
      if (!running) return;
      if (e.key === "ArrowUp" && dir.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && dir.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && dir.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && dir.x !== -1) setDir({ x: 1, y: 0 });
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dir, running, started, onClose]);

  // Snake-Loop (langsamer)
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSnake(snk => {
        const head = { x: snk[0].x + dir.x, y: snk[0].y + dir.y };
        // Kollision
        if (
          head.x < 0 || head.x >= size ||
          head.y < 0 || head.y >= size ||
          snk.some(s => s.x === head.x && s.y === head.y)
        ) {
          setRunning(false);
          return snk;
        }
        let newSnake = [head, ...snk];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood({
            x: Math.floor(Math.random() * size),
            y: Math.floor(Math.random() * size)
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 140); // langsamer!
    return () => clearInterval(interval);
  }, [dir, food, running]);

  // Zeichnen
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, size * tile, size * tile);
    // determine accent color from CSS variable so canvas follows the picker
    const css = getComputedStyle(document.documentElement);
    const accentCol = css.getPropertyValue('--accent')?.trim() || '#4f46e5';
    // Snake
    ctx.fillStyle = accentCol;
    snake.forEach(s => ctx.fillRect(s.x * tile, s.y * tile, tile - 2, tile - 2));
    // Food
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(food.x * tile, food.y * tile, tile - 2, tile - 2);
    // Score
    ctx.font = "bold 18px Segoe UI";
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 8, 22);
    if (!running && started) {
      // Game Over Stil
      ctx.font = "bold 32px Segoe UI";
      ctx.fillStyle = "#dc2626";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", (size * tile) / 2, (size * tile) / 2 - 10);
      ctx.font = "bold 18px Segoe UI";
      ctx.fillStyle = "#fff";
      ctx.fillText("Drücke Enter oder Restart", (size * tile) / 2, (size * tile) / 2 + 22);
      ctx.textAlign = "left";
    }
    if (!started) {
      ctx.font = "bold 28px Segoe UI";
      ctx.fillStyle = accentCol;
      ctx.textAlign = "center";
      ctx.fillText("Snake", (size * tile) / 2, (size * tile) / 2 - 10);
      ctx.font = "bold 18px Segoe UI";
      ctx.fillStyle = "#fff";
      ctx.fillText("Starte mit Play", (size * tile) / 2, (size * tile) / 2 + 22);
      ctx.textAlign = "left";
    }
  }, [snake, food, running, score, started, size, tile]);

  function startGame() {
    setSnake([{ x: 10, y: 10 }]);
    setDir({ x: 1, y: 0 });
    setFood({ x: 15, y: 15 });
    setScore(0);
    setStarted(true);
    setRunning(true);
  }

  function restart() {
    startGame();
  }

  return (
    <div className="snake-overlay">
      <div className="snake-close" style={{ top: 12, right: 18 }} onClick={onClose}>×</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <canvas
          ref={canvasRef}
          width={size * tile}
          height={size * tile}
          tabIndex={0}
          style={{ outline: "none", background: "#222", borderRadius: 16, marginBottom: 12 }}
        />
        {/* Touch-Steuerung */}
        <div className="snake-touch-controls">
          <div>
            <button aria-label="Oben" onClick={() => running && setDir(dir => dir.y !== 1 ? { x: 0, y: -1 } : dir)}>▲</button>
          </div>
          <div>
            <button aria-label="Links" onClick={() => running && setDir(dir => dir.x !== 1 ? { x: -1, y: 0 } : dir)}>◀</button>
            <button aria-label="Unten" onClick={() => running && setDir(dir => dir.y !== -1 ? { x: 0, y: 1 } : dir)}>▼</button>
            <button aria-label="Rechts" onClick={() => running && setDir(dir => dir.x !== -1 ? { x: 1, y: 0 } : dir)}>▶</button>
          </div>
        </div>
        {!started ? (
          <button
            className="btn btn-primary"
            style={{ marginTop: 8, fontSize: 18, padding: "8px 28px" }}
            onClick={startGame}
          >
            ▶ Play
          </button>
        ) : !running ? (
          <button
            className="btn btn-primary"
            style={{ marginTop: 8, fontSize: 18, padding: "8px 28px" }}
            onClick={restart}
          >
            ↻ Restart
          </button>
        ) : null}
        <div style={{ color: "#fff", marginTop: 8, fontSize: 14 }}>
          Mit den Pfeiltasten oder Buttons steuern. X klicken zum Schließen.
        </div>
      </div>
    </div>
  );
}
