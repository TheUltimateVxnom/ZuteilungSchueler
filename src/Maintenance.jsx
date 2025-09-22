import React, { useState, useEffect, useRef } from "react";

function MenuDropdown({ theme, toggleTheme, showSnake, onShow404 }) {
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
          <button className="menu-item" onClick={() => { setOpen(false); showSnake(); }}>
            🐍 Snake spielen
          </button>
          <div className="menu-divider" />
          <button className="menu-item" onClick={() => { setOpen(false); onShow404(); }}>
            ❌ 404
          </button>
        </div>
      )}
    </div>
  );
}

export default function Maintenance() {
  const [theme, setTheme] = useState("light");
  const [snakeOpen, setSnakeOpen] = useState(false);
  const [view, setView] = useState("main"); // "main" oder "404"

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
          © Lukas Diezinger, Release v2.2.1
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
          />
        )}
        {view === "main" && (
          <section className="card maintenance-glow" style={{ maxWidth: 500, margin: "0 auto" }}>
            <h1>🚧 Wartungsmodus aktiv</h1>
            <p>Die Seite wird gerade aktualisiert. Bitte später erneut versuchen.</p>
          </section>
        )}
        {view === "404" && (
          <section className="card" style={{ maxWidth: 400, margin: "60px auto", textAlign: "center" }}>
            <h1 style={{ fontSize: "2.5rem", color: "#dc2626" }}>404</h1>
            <p>Seite nicht gefunden</p>
            <button className="btn btn-outline" onClick={toggleTheme} style={{ margin: "18px 0" }}>
              {theme === "light" ? "🌙 Dunkel" : "☀️ Hell"}
            </button>
            <br />
            <button
              className="btn btn-primary"
              style={{ marginTop: 10 }}
              onClick={() => window.open("https://www.youtube.com/embed/xvFZjo5PgG0?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0", "_blank")}
            >
              Zurück zur Seite
            </button>
            <div style={{ marginTop: 18, fontSize: 13, color: "#888" }}>
              
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
    // Snake
    ctx.fillStyle = "#4f46e5";
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
      ctx.fillStyle = "#4f46e5";
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
