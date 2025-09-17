import React, { useEffect, useState } from "react";

export default function App() {
  const [studentsText, setStudentsText] = useState(""); // Start leer
  const [students, setStudents] = useState([]);
  const [capacityOutside, setCapacityOutside] = useState(3);
  const [capacityGroup, setCapacityGroup] = useState(3);
  const [outside, setOutside] = useState([]);
  const [groupRoom, setGroupRoom] = useState([]);
  const [classroom, setClassroom] = useState([]);
  const [history, setHistory] = useState({});
  const STORAGE_KEY = "schueler_zuteilung_state_v1";

  // Schülerliste parsen + History anpassen
  useEffect(() => {
    const arr = studentsText
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s);
    const uniq = Array.from(new Set(arr));
    setStudents(uniq);

    if (uniq.length === 0) {
      setHistory({});
      localStorage.removeItem(STORAGE_KEY);
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.history) {
            const filteredHistory = {};
            uniq.forEach(name => {
              if (parsed.history[name]) filteredHistory[name] = parsed.history[name];
            });
            setHistory(filteredHistory);
          }
        }
      } catch {}
    }
  }, [studentsText]);

  const persist = newHistory => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: newHistory })); }
    catch {}
  };

  // Vollständig zufällige Zuweisung
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

    const newHistory = { ...history };
    students.forEach(n => {
      if (!newHistory[n]) newHistory[n] = { outside:0, group:0, classroom:0 };
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
    a.href=url;
    a.download="schueler_zuteilung.json";
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
    <div className="app-container flex flex-col items-center min-h-screen p-6">
      <div className="app-inner w-full max-w-5xl">
        <header className="app-header text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Schüler-Zuteilung</h1>
          <p className="text-gray-600">Konfiguriere Schüler, Kapazitäten und weise zufällig zu</p>
        </header>

        <main className="app-main grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="card">
            <h2 className="text-xl font-semibold mb-2">Schülerliste</h2>
            <textarea
              value={studentsText}
              onChange={e=>setStudentsText(e.target.value)}
              rows={10}
              className="card-input"
              placeholder="Gib hier die Namen ein, jeweils eine Zeile pro Schüler"
            />
            <div className="card-controls flex gap-4 mt-4">
              <label className="flex flex-col">Außenbereich
                <input type="number" value={capacityOutside} onChange={e=>setCapacityOutside(Number(e.target.value))}/>
              </label>
              <label className="flex flex-col">Gruppenraum
                <input type="number" value={capacityGroup} onChange={e=>setCapacityGroup(Number(e.target.value))}/>
              </label>
            </div>
            <div className="card-buttons flex gap-2 mt-4 flex-wrap justify-center">
              <button onClick={assign} className="btn btn-primary">Zuweisen</button>
              <button onClick={resetHistory} className="btn btn-danger">Verlauf zurücksetzen</button>
              <button onClick={exportJSON} className="btn btn-outline">Export</button>
              <label className="btn btn-outline cursor-pointer">Import
                <input type="file" style={{display:"none"}} onChange={e=>importJSON(e.target.files[0])}/>
              </label>
            </div>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold mb-2">Aktuelle Zuteilung</h2>
            <div className="grid-section mb-4">
              <div>
                <h3 className="font-medium mb-1">Außenbereich ({outside.length})</h3>
                <ul className="list-disc ml-5">{outside.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">Gruppenraum ({groupRoom.length})</h3>
                <ul className="list-disc ml-5">{groupRoom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">Klassenzimmer ({classroom.length})</h3>
                <ul className="list-disc ml-5">{classroom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">Verlauf</h3>
            <table className="history-table mx-auto">
              <thead>
                <tr><th>Name</th><th>Außen</th><th>Gruppe</th><th>Klassenzimmer</th></tr>
              </thead>
              <tbody>
                {students.map(name=>{
                  const row = history[name]||{outside:0,group:0,classroom:0};
                  return (<tr key={name}><td>{name}</td><td>{row.outside}</td><td>{row.group}</td><td>{row.classroom}</td></tr>);
                })}
              </tbody>
            </table>
          </section>
        </main>

        <footer className="mt-6 text-center text-sm text-gray-600">
          <p>Hinweis: Verlauf wird lokal gespeichert. © Lukas Diezinger</p>
        </footer>
      </div>
    </div>
  );
}

