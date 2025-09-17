[17:51, 17.9.2025] Lukas: :root {
  --bg-light: #f0f2f5;
  --bg-dark: #1f1f1f;
  --card-light: #ffffff;
  --card-dark: #2b2b2b;
  --text-light: #1f1f1f;
  --text-dark: #f0f0f0;
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --danger: #dc2626;
  --danger-hover: #b91c1c;
  --success: #16a34a;
  --success-hover: #15803d;
  --input-light: #fff;
  --input-dark: #3a3a3a;
  --input-border-light: #ccc;
  --input-border-dark: #555;
}

[data-theme="light"] {
  --bg: var(--bg-light);
  --card-bg: var(--card-light);
  --text-color: var(--text-light);
  --input-bg: var(--input-light);
  --input-border: var(--input-border-light);
}

[data-theme="dark"] {
  --bg: var(--bg-dark);
  --card-bg: var(--card-dark);
  --text-color: var(--text-dark);
  --input-bg: var(--input-dark);
  --input-border: var(--input-border-dark);
}

body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background-color: var(--bg);
  color: var(--text-color);
  display: flex;
  justify-content: center;
}

/* Dark/Light Button */
.theme-toggle-container {
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1000;
}
.theme-toggle-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: background-color 0.3s, transform 0.2s;
}
.theme-toggle-btn:hover {
  background-color: var(--primary-hover);
  transform: scale(1.05);
}

/* App Container */
.app-container {
  max-width: 1200px;
  width: 100%;
  padding: 20px;
}
.app-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* App Cards */
.card {
  background-color: var(--card-bg);
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: 0.3s;
}
.card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.15); }

/* Inputs & Textareas */
.card-input, input, textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  padding: 12px;
  font-family: monospace;
  background-color: var(--input-bg);
  color: var(--text-color);
  margin-top: 8px;
  margin-bottom: 8px;
}

/* Grid Layout */
.grid-section { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 20px; 
}
@media(min-width:768px){ 
  .grid-section { grid-template-columns: repeat(3, 1fr); gap: 20px; } 
}

/* Buttons Modern */
.btn {
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s all;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  font-weight: bold;
}
.btn:hover { transform: translateY(-2px); box-shadow:0 6px 12px rgba(0,0,0,0.2); }

/* Button Types */
.btn-primary { background-color: var(--primary); color:white; }
.btn-primary:hover { background-color: var(--primary-hover); }

.btn-danger { background-color: var(--danger); color:white; }
.btn-danger:hover { background-color: var(--danger-hover); }

.btn-outline {
  background:none; 
  border:1px solid var(--input-border); 
  color: var(--text-color);
}
.btn-outline:hover { background-color: rgba(0,0,0,0.05); }

/* Import Button */
.btn-import { font-weight: normal; padding: 10px 16px; display: inline-flex; align-items: center; }

/* History Table */
.history-table { width:100%; border-collapse:collapse; margin-top:15px; }
.history-table th, .history-table td { border:1px solid var(--input-border); padding:8px 12px; border-radius:10px; text-align:center; }

/* Footer */
.footer { text-align:center; margin-top:30px; font-size:14px; color:var(--text-color); }
[17:53, 17.9.2025] Lukas: import React, { useEffect, useState } from "react";

export default function App() {
  const [studentsText, setStudentsText] = useState("");
  const [students, setStudents] = useState([]);
  const [capacityOutside, setCapacityOutside] = useState(3);
  const [capacityGroup, setCapacityGroup] = useState(3);
  const [outside, setOutside] = useState([]);
  const [groupRoom, setGroupRoom] = useState([]);
  const [classroom, setClassroom] = useState([]);
  const [history, setHistory] = useState({});
  const STORAGE_KEY = "schueler_zuteilung_state_v1";

  // Update students array from textarea
  useEffect(() => {
    const arr = studentsText.split(/\r?\n/).map(s => s.trim()).filter(s => s);
    setStudents(Array.from(new Set(arr)));
  }, [studentsText]);

  // Load saved history if exists
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.history) setHistory(parsed.history);
      }
    } catch {}
  }, []);

  const persist = newHistory => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: newHistory })); }
    catch {}
  };

  // Random assignment
  const assign = () => {
    if (!students.length) return;
    const shuffled = [...students].sort(() => Math.random() - 0.5);

    const takeOutside = Math.min(capacityOutside, shuffled.length);
    const outsideSel = shuffled.slice(0, takeOutside);
    const remaining = shuffled.slice(takeOutside);
    const takeGroup = Math.min(capacityGroup, remaining.length);
    const groupSel = remaining.slice(0, takeGroup);
    const rest = remaining.slice(takeGroup);

    setOutside(outsideSel);
    setGroupRoom(groupSel);
    setClassroom(rest);

    // Reset history for new assignment (no old numbers)
    const newHistory = {};
    students.forEach(n => newHistory[n] = { outside:0, group:0, classroom:0 });
    outsideSel.forEach(n => newHistory[n].outside++);
    groupSel.forEach(n => newHistory[n].group++);
    rest.forEach(n => newHistory[n].classroom++);
    setHistory(newHistory);
    persist(newHistory);
  };

  const resetHistory = () => { setHistory({}); localStorage.removeItem(STORAGE_KEY); };

  const exportJSON = () => { 
    const blob = new Blob([JSON.stringify({students,capacityOutside,capacityGroup,history},null,2)], {type:"application/json"}); 
    const url=URL.createObjectURL(blob); 
    const a=document.createElement("a"); 
    a.href=url; a.download="schueler_zuteilung.json"; 
    a.click(); 
    URL.revokeObjectURL(url); 
  };

  const importJSON = file => { 
    const reader = new FileReader(); 
    reader.onload = e => { 
      try { 
        const parsed = JSON.parse(e.target.result); 
        if(parsed.students) setStudentsText(parsed.students.join("\n")); 
        if(parsed.capacityOutside) setCapacityOutside(parsed.capacityOutside); 
        if(parsed.capacityGroup) setCapacityGroup(parsed.capacityGroup); 
        if(parsed.history){ setHistory(parsed.history); persist(parsed.history); } 
      } catch(e){ alert("Fehler: "+e.message); } 
    }; 
    reader.readAsText(file); 
  };

  return (
    <div className="app-container">
      <div className="app-inner">
        <header className="app-header" style={{textAlign:"center"}}>
          <h1>Schüler-Zuteilung</h1>
          <p>Konfiguriere Schüler, Kapazitäten und weise zufällig zu</p>
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
            <div className="card-controls" style={{display:"flex", justifyContent:"center", gap:"20px", marginTop:"10px"}}>
              <label>Außenbereich
                <input type="number" value={capacityOutside} onChange={e=>setCapacityOutside(Number(e.target.value))}/>
              </label>
              <label>Gruppenraum
                <input type="number" value={capacityGroup} onChange={e=>setCapacityGroup(Number(e.target.value))}/>
              </label>
            </div>
            <div className="card-buttons" style={{display:"flex", justifyContent:"center", gap:"10px", marginTop:"15px"}}>
              <button onClick={assign} className="btn btn-primary">Zuweisen</button>
              <button onClick={resetHistory} className="btn btn-danger">Verlauf zurücksetzen</button>
              <button onClick={exportJSON} className="btn btn-outline">Export</button>
              <label className="btn btn-outline btn-import cursor-pointer">
                Import
                <input type="file" style={{display:"none"}} onChange={e=>importJSON(e.target.files[0])}/>
              </label>
            </div>
          </section>

          <section className="card">
            <h2>Aktuelle Zuteilung</h2>
            <div className="grid-section">
              <div>
                <h3>Außenbereich ({outside.length})</h3>
                <ul>{outside.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3>Gruppenraum ({groupRoom.length})</h3>
                <ul>{groupRoom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3>Klassenzimmer ({classroom.length})</h3>
                <ul>{classroom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
            </div>

            <h3>Verlauf</h3>
            <table className="history-table">
              <thead>
                <tr><th>Name</th><th>Außen</th><th>Gruppe</th><th>Klassenzimmer</th></tr>
              </thead>
              <tbody>
                {students.map(name => {
                  const row = history[name] || {outside:0, group:0, classroom:0};
                  return (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{row.outside}</td>
                      <td>{row.group}</td>
                      <td>{row.classroom}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </main>

        <footer className="footer">
          © Lukas Diezinger
        </footer>
      </div>
    </div>
  );
}
