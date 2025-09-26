import React, { useEffect, useState, useRef } from "react";
import Maintenance from "./Maintenance.jsx"; // Wartungsseite importieren

function MenuDropdown({ theme, toggleTheme, onShowTimeline, onShowApp, view, onShow404 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

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
          {view === "app" ? (
            <button className="menu-item" onClick={() => { setOpen(false); onShowTimeline(); }}>
              ➡️ Externe Seite
            </button>
          ) : (
            <button className="menu-item" onClick={() => { setOpen(false); onShowApp(); }}>
              ⬅️ Zurück zur App
            </button>
          )}
          <div className="menu-divider" />
          <a
            className="menu-item"
            href="https://forms.gle/eu2VJdz8rnmHQQCg8"
            target="_blank"
            rel="noopener noreferrer"
          >
             🐞 Bug melden
          </a>
          <div className="menu-divider" />
          <button className="menu-item" onClick={() => { setOpen(false); onShow404(); }}>
            ❌ 404
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [studentsText, setStudentsText] = useState("");
  const [students, setStudents] = useState([]);
  const [areas, setAreas] = useState({
    outside: [],
    group: [],
    classroom: [],
  });
  const [history, setHistory] = useState({});
  const dragStudent = useRef(null);

  // Update students array from textarea
  useEffect(() => {
    const arr = studentsText.split(/\r?\n/).map(s => s.trim()).filter(s => s);
    setStudents(Array.from(new Set(arr)));
  }, [studentsText]);

  // Namen übernehmen und Kacheln erzeugen (jetzt standardmäßig im Klassenzimmer)
  function handleNames() {
    const names = Array.from(new Set(
      studentsText.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    ));
    setStudents(names);
    setAreas({
      outside: [],
      group: [],
      classroom: names,
    });
    setHistory({});
  }

  // Drag & Drop Handler
  function onDragStart(name) {
    dragStudent.current = name;
  }
  function onDrop(area) {
    const name = dragStudent.current;
    if (!name) return;
    setAreas(prev => {
      // Entferne aus allen Bereichen
      const newAreas = {
        outside: prev.outside.filter(n => n !== name),
        group: prev.group.filter(n => n !== name),
        classroom: prev.classroom.filter(n => n !== name),
      };
      // Füge in Zielbereich ein
      newAreas[area] = [...newAreas[area], name];
      return newAreas;
    });
    dragStudent.current = null;
  }

  // Zählen-Button: History aktualisieren
  function handleCount() {
    const newHistory = { ...history };
    students.forEach(name => {
      if (!newHistory[name]) newHistory[name] = { outside: 0, group: 0, classroom: 0 };
    });
    areas.outside.forEach(n => newHistory[n].outside++);
    areas.group.forEach(n => newHistory[n].group++);
    areas.classroom.forEach(n => newHistory[n].classroom++);
    setHistory(newHistory);
  }

  // Verlauf zurücksetzen
  function handleResetHistory() {
    setHistory({});
  }

  // Export Namen
  function handleExport() {
    const blob = new Blob([studentsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schuelerliste.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import Namen
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      setStudentsText(evt.target.result);
    };
    reader.readAsText(file);
  }

  // Kachel-Rendering
  function renderTile(name) {
    return (
      <div
        key={name}
        className="student-tile"
        draggable
        onDragStart={() => onDragStart(name)}
      >
        {name}
      </div>
    );
  }

  // Theme-Handling für das Menü
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Wartungsmodus prüfen
  const maintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";
  if (maintenance) return <Maintenance />;

  const [view, setView] = useState("app"); // "app", "timeline", "404"

  return (
    <>
      <footer className="footer">
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline", cursor: "pointer" }}
        >
          © Lukas Diezinger, Beta v3.0
        </a>
      </footer>
      <MenuDropdown
        theme={theme}
        toggleTheme={toggleTheme}
        onShowTimeline={() => setView("timeline")}
        onShowApp={() => setView("app")}
        view={view}
        onShow404={() => setView("404")}
      />
      <div className="app-container">
        <div className="app-inner">
          {view === "app" ? (
            <>
              <header className="app-header" style={{textAlign:"center"}}>
                <h1>Schüler-Zuteilung</h1>
                <p>Ziehe die Kacheln in die Bereiche. Mit „Zählen“ wird der Verlauf aktualisiert.</p>
              </header>

              <main className="app-main">
                <section className="card">
                  <h2>Schülerliste</h2>
                  <textarea 
                    value={studentsText} 
                    onChange={e=>setStudentsText(e.target.value)} 
                    rows={10} 
                    className="card-input" 
                    placeholder="Namen hier eingeben, jeweils eine Zeile"
                  />
                  <div style={{display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center", marginTop:"10px"}}>
                    <button className="btn btn-primary" onClick={handleNames}>
                      Namen übernehmen
                    </button>
                    <button className="btn btn-outline" onClick={handleExport}>
                      Export
                    </button>
                    <label className="btn btn-outline" style={{cursor:"pointer", marginBottom:0}}>
                      Import
                      <input type="file" accept=".txt" style={{display:"none"}} onChange={handleImport} />
                    </label>
                  </div>
                </section>

                <section className="card">
                  <h2>Kacheln zuweisen (Drag & Drop)</h2>
                  <div className="grid-section">
                    <div
                      className="dropzone"
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDrop("outside")}
                    >
                      <h3>Außenbereich ({areas.outside.length})</h3>
                      {areas.outside.map(renderTile)}
                    </div>
                    <div
                      className="dropzone"
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDrop("group")}
                    >
                      <h3>Gruppenraum ({areas.group.length})</h3>
                      {areas.group.map(renderTile)}
                    </div>
                    <div
                      className="dropzone"
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDrop("classroom")}
                    >
                      <h3>Klassenzimmer ({areas.classroom.length})</h3>
                      {areas.classroom.map(renderTile)}
                    </div>
                  </div>
                  <div style={{display:"flex", gap:"8px", marginTop:"10px"}}>
                    <button className="btn btn-primary" onClick={handleCount}>
                      Zählen
                    </button>
                    <button className="btn btn-outline" onClick={handleResetHistory}>
                      Verlauf zurücksetzen
                    </button>
                  </div>
                </section>

                <section className="card">
                  <h2>Verlauf</h2>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Außen</th>
                        <th>Gruppe</th>
                        <th>Klassenzimmer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(name => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{history[name]?.outside || 0}</td>
                          <td>{history[name]?.group || 0}</td>
                          <td>{history[name]?.classroom || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </main>
            </>
          ) : view === "404" ? (
            <NotFound404 onShowApp={() => setView("app")} />
          ) : (
            <Timeline />
          )}
        </div>
      </div>
    </>
  );
}

function NotFound404({ onShowApp }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
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
        (Du wirst einfach zu Google geschickt 😁)
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="card timeline-card" style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2 style={{ textAlign: "center" }}>Changelog / Timeline</h2>
      <div className="timeline-list">
        <div className="timeline-item">
  <div
    className="timeline-dot"
    style={{
      background: "#4f46e5", // gelb
      boxShadow: "0 0 16px 4px #4f46e5"
    }}
  />
  <div>
    <div className="timeline-date">Release v3.0</div>
    <div className="timeline-content">🤫</div>
  </div>
</div>
<div className="timeline-item">
  <div
    className="timeline-dot"
    style={{
      background: "#16a34a", // rot
      boxShadow: "0 0 16px 4px #16a34a"
    }}
  />
  <div>
    <div className="timeline-date">Beta v3.0</div>
    <div className="timeline-content">Test für neue Features</div>
  </div>
</div>
      <div className="timeline-item">
        <div
          className="timeline-dot"
          style={{
            background: "#4f46e5", // lila
            boxShadow: "0 0 16px 4px #4f46e5"
          }}
        />
        <div>
          <div className="timeline-date">Release v2.2</div>
          <div className="timeline-content">Snake-Game im Wartungsmodus, Dunkle Pfeile und Scrollbar</div>
        </div>
      </div>
      <div className="timeline-item">
          <div
            className="timeline-dot"
            style={{
              background: "#4f46e5", // lila
              boxShadow: "0 0 16px 4px #4f46e5"
            }}
          />
          <div>
            <div className="timeline-date">Release v2.0</div>
            <div className="timeline-content">Timeline, Anpassung für jedes Gerät, Bug-Meldefunktion</div>
          </div>
        </div>
        <div className="timeline-item">
          <div
            className="timeline-dot"
            style={{
              background: "#4f46e5", // grün
              boxShadow: "0 0 16px 4px #4f46e5"
            }}
          />
          <div>
            <div className="timeline-date">Beta v2.0</div>
            <div className="timeline-content">Tests für den Release v2.0</div>
          </div>
        </div>
        <div className="timeline-item">
          <div
            className="timeline-dot"
            style={{
              background: "#4f46e5", // lila
              boxShadow: "0 0 16px 4px #4f46e5"
            }}
          />
          <div>
            <div className="timeline-date">Release v1.2</div>
            <div className="timeline-content">Wartungsmodus, Hoveranimationen, Glow</div>
          </div>
        </div>
        <div className="timeline-item">
          <div
            className="timeline-dot"
            style={{
              background: "#4f46e5", // lila
              boxShadow: "0 0 16px 4px #4f46e5"
            }}
          />
          <div>
            <div className="timeline-date">Release v1.0</div>
            <div className="timeline-content">Dark-Mode</div>
          </div>
        </div>
        <div className="timeline-item">
          <div
            className="timeline-dot"
            style={{
              background: "#4f46e5", // lila
              boxShadow: "0 0 16px 4px #4f46e5"
            }}
          />
          <div>
            <div className="timeline-date">Beta v1.0</div>
            <div className="timeline-content">Projekt gestartet</div>
          </div>
        </div>
        {/* Weitere Einträge ... */}
      </div>
    </section>
  );
}
