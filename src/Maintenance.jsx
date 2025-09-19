import React, { useState, useEffect, useRef } from "react";

function MenuDropdown({ theme, toggleTheme, showSnake }) {
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
             Snake spielen
          </button>
        </div>
      )}
    </div>
  );
}

export default function Maintenance() {
  const [theme, setTheme] = useState("light");
  const [snakeOpen, setSnakeOpen] = useState(false);

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
          © Lukas Diezinger, Release v2.0.1
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
        <MenuDropdown theme={theme} toggleTheme={toggleTheme} showSnake={() => setSnakeOpen(true)} />
        <section className="card maintenance-glow" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h1>🚧 Wartungsmodus aktiv</h1>
          <p>Die Seite wird gerade aktualisiert. Bitte später erneut versuchen. 
          </p>
        </section>
        {snakeOpen && <SnakeOverlay onClose={() => setSnakeOpen(false)} />}
      </div>
    </>
  );
}

function SnakeOverlay({ onClose }) {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);

  // Spielfeld-Parameter
  const size = 15;
  const tile = 18;
  const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 10, y: 10 });

  // Steuerung
  useEffect(() => {
    function handleKey(e) {
      if (!running) return;
      if (e.key === "ArrowUp" && dir.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && dir.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && dir.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && dir.x !== -1) setDir({ x: 1, y: 0 });
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dir, running, onClose]);

  // Snake-Loop
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
    }, 90);
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
    if (!running) {
      ctx.font = "bold 28px Segoe UI";
      ctx.fillStyle = "#dc2626";
      ctx.fillText("Game Over", 30, size * tile / 2);
    }
  }, [snake, food, running, score]);

  return (
    <div className="snake-overlay">
      <div className="snake-close" onClick={onClose}>×</div>
      <canvas
        ref={canvasRef}
        width={size * tile}
        height={size * tile}
        tabIndex={0}
        style={{ outline: "none", background: "#222", borderRadius: 16 }}
      />
      <div style={{ color: "#fff", marginTop: 8, fontSize: 14 }}>
        Mit den Pfeiltasten steuern. ESC oder × zum Schließen.
      </div>
    </div>
  );
}
