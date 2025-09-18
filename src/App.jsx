import React, { useEffect, useState } from "react";
import Maintenance from "./Maintenance.jsx"; // Wartungsseite importieren

export default function App() {
  // Wartungsmodus prüfen
  const maintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  // Wenn Wartungsmodus aktiv ist, zeige nur die Wartungsseite
  if (maintenance) return <Maintenance />;

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

    // Für jeden Schüler: Wie oft war er in jedem Raum?
    const getCounts = name => history[name] || { outside: 0, group: 0, classroom: 0 };

    // Gewicht: Je weniger in einem Raum, desto höher die Chance
    function weightedPick(list, count, key) {
      // Finde für jeden Schüler die minimale Anzahl in allen Räumen
      const weighted = [];
      list.forEach(n => {
        const counts = getCounts(n);
        const minCount = Math.min(counts.outside, counts.group, counts.classroom);
        // Gewicht = (maxCount - count in diesem Raum) + 1
        const weight = (counts[key] === minCount ? 5 : 1); // 5-fache Chance für den seltensten Raum
        for (let i = 0; i < weight; i++) weighted.push(n);
      });
      // Shuffle weighted array
      for (let i = weighted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
      }
      // Ziehe eindeutige Namen
      const result = [];
      for (let w of weighted) {
        if (!result.includes(w)) result.push(w);
        if (result.length === count) break;
      }
      return result;
    }

    let pool = [...students];
    const outsideSel = weightedPick(pool, Math.min(capacityOutside, pool.length), "outside");
    pool = pool.filter(n => !outsideSel.includes(n));
    const groupSel = weightedPick(pool, Math.min(capacityGroup, pool.length), "group");
    pool = pool.filter(n => !groupSel.includes(n));
    const rest = pool;

    setOutside(outsideSel);
    setGroupRoom(groupSel);
    setClassroom(rest);

    // Update history
    const newHistory = {...history};
    students.forEach(n => {
      if (!newHistory[n]) newHistory[n] = { outside: 0, group: 0, classroom: 0 };
    });
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
              <button
                className="btn btn-outline"
                onClick={() => document.getElementById('import-file').click()}
              >
                Import
              </button>
              <input
                id="import-file"
                type="file"
                style={{ display: "none" }}
                onChange={e => importJSON(e.target.files[0])}
              />
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
    </div>
  );
}
