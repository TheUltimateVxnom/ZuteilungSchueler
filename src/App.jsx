import React, { useEffect, useState } from "react";

export default function App() {
  const [studentsText, setStudentsText] = useState(`Lukas\nAnna\nBen\nClara\nDavid\nEmilia\nFelix\nGreta`);
  const [students, setStudents] = useState([]);
  const [capacityOutside, setCapacityOutside] = useState(3);
  const [capacityGroup, setCapacityGroup] = useState(3);
  const [outside, setOutside] = useState([]);
  const [groupRoom, setGroupRoom] = useState([]);
  const [classroom, setClassroom] = useState([]);
  const [history, setHistory] = useState({});
  const STORAGE_KEY = "schueler_zuteilung_state_v1";

  useEffect(() => {
    const arr = studentsText.split(/\r?\n/).map(s => s.trim()).filter(s => s);
    setStudents(Array.from(new Set(arr)));
  }, [studentsText]);

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

  const weightedShuffle = arr => {
    const weighted = arr.map(name => {
      const h = history[name] || { outside: 0, group: 0, classroom: 0 };
      const weight = 1 / (1 + h.group + h.outside);
      return { name, weight };
    });
    const total = weighted.reduce((acc, w) => acc + w.weight, 0);
    let pool = weighted.slice();
    const result = [];
    while (pool.length) {
      let r = Math.random() * total;
      let cum = 0, idx = 0;
      for (let i = 0; i < pool.length; i++) {
        cum += pool[i].weight;
        if (r <= cum) { idx = i; break; }
      }
      result.push(pool[idx].name);
      pool.splice(idx, 1);
    }
    return result;
  };

  const assign = () => {
    if (!students.length) return;
    const shuffled = weightedShuffle(students);
    const takeOutside = Math.min(capacityOutside, shuffled.length);
    const outsideSel = shuffled.slice(0, takeOutside);
    const remaining = shuffled.slice(takeOutside);
    const takeGroup = Math.min(capacityGroup, remaining.length);
    const groupSel = remaining.slice(0, takeGroup);
    const rest = remaining.slice(takeGroup);

    setOutside(outsideSel);
    setGroupRoom(groupSel);
    setClassroom(rest);

    const newHistory = { ...history };
    students.forEach(n => { if (!newHistory[n]) newHistory[n] = { outside:0, group:0, classroom:0 }; });
    outsideSel.forEach(n => newHistory[n].outside++);
    groupSel.forEach(n => newHistory[n].group++);
    rest.forEach(n => newHistory[n].classroom++);
    setHistory(newHistory);
    persist(newHistory);
  };

  const resetHistory = () => { setHistory({}); localStorage.removeItem(STORAGE_KEY); };
  const exportJSON = () => { const blob = new Blob([JSON.stringify({students,capacityOutside,capacityGroup,history},null,2)], {type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="schueler_zuteilung.json"; a.click(); URL.revokeObjectURL(url); };
  const importJSON = file => { const reader = new FileReader(); reader.onload = e => { try { const parsed = JSON.parse(e.target.result); if(parsed.students) setStudentsText(parsed.students.join("\n")); if(parsed.capacityOutside) setCapacityOutside(parsed.capacityOutside); if(parsed.capacityGroup) setCapacityGroup(parsed.capacityGroup); if(parsed.history){ setHistory(parsed.history); persist(parsed.history); } } catch(e){ alert("Fehler: "+e.message); } }; reader.readAsText(file); };

  return (
    <div className="app-container">
      <div className="app-inner">
        <header className="app-header">
          <h1>Schüler-Zuteilung</h1>
          <p>Konfiguriere Schüler, Kapazitäten und weise zufällig zu</p>
        </header>

        <main className="app-main">
          <section className="card">
            <h2>Schülerliste</h2>
            <textarea value={studentsText} onChange={e=>setStudentsText(e.target.value)} rows={10} className="card-input"/>
            <div className="card-controls">
              <label>Außenbereich<input type="number" value={capacityOutside} onChange={e=>setCapacityOutside(Number(e.target.value))}/></label>
              <label>Gruppenraum<input type="number" value={capacityGroup} onChange={e=>setCapacityGroup(Number(e.target.value))}/></label>
            </div>
            <div className="card-buttons">
              <button onClick={assign} className="btn-primary">Zuweisen</button>
              <button onClick={resetHistory} className="btn-danger">Verlauf zurücksetzen</button>
              <button onClick={exportJSON} className="btn-outline">Export</button>
              <label className="btn-outline cursor-pointer">Import<input type="file" style={{display:"none"}} onChange={e=>importJSON(e.target.files[0])}/></label>
            </div>
          </section>

          <section className="card">
            <h2>Aktuelle Zuteilung</h2>
            <div className="grid-section">
              <div><h3>Außenbereich ({outside.length})</h3><ul>{outside.map(n=><li key={n}>{n}</li>)}</ul></div>
              <div><h3>Gruppenraum ({groupRoom.length})</h3><ul>{groupRoom.map(n=><li key={n}>{n}</li>)}</ul></div>
              <div><h3>Klassenzimmer ({classroom.length})</h3><ul>{classroom.map(n=><li key={n}>{n}</li>)}</ul></div>
            </div>
            <h3>Verlauf</h3>
            <table className="history-table">
              <thead>
                <tr><th>Name</th><th>Außen</th><th>Gruppe</th><th>Klassenzimmer</th></tr>
              </thead>
              <tbody>
                {students.map(name=>{ const row = history[name]||{outside:0,group:0,classroom:0}; return (<tr key={name}><td>{name}</td><td>{row.outside}</td><td>{row.group}</td><td>{row.classroom}</td></tr>); })}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
