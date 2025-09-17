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

  // Schülerliste parsen
  useEffect(() => {
    const arr = studentsText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    setStudents(Array.from(new Set(arr)));
  }, [studentsText]);

  // History laden
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

  // **Zufällige Zuteilung**
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
    students.forEach(n => { if (!newHistory[n]) newHistory[n] = { outside:0, group:0, classroom:0 }; });
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
    <div className="app-container p-6 min-h-screen">
      <div className="app-inner max-w-6xl mx-auto">

        <header className="app-header mb-6">
          <h1 className="text-3xl font-bold">Schüler-Zuteilung</h1>
          <p className="text-gray-500 mt-1">Konfiguriere Schüler, Kapazitäten und weise komplett zufällig zu</p>
        </header>

        <main className="app-main grid grid-cols-1 md:grid-cols-2 gap-6">

          <section className="card">
            <h2 className="text-xl font-semibold mb-2">Schülerliste</h2>
            <textarea
              value={studentsText}
              onChange={e=>setStudentsText(e.target.value)}
              rows={10}
              className="card-input"
            />
            <div className="card-controls mt-4 flex gap-4 flex-wrap">
              <label className="flex flex-col">
                <span className="text-sm text-gray-500">Außenbereich</span>
                <input type="number" value={capacityOutside} onChange={e=>setCapacityOutside(Number(e.target.value))} className="card-input"/>
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-500">Gruppenraum</span>
                <input type="number" value={capacityGroup} onChange={e=>setCapacityGroup(Number(e.target.value))} className="card-input"/>
              </label>
            </div>
            <div className="card-buttons mt-4 flex flex-wrap gap-2">
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
            <div className="grid-section">
              <div>
                <h3 className="font-medium">Außenbereich ({outside.length})</h3>
                <ul className="list-disc ml-5">{outside.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3 className="font-medium">Gruppenraum ({groupRoom.length})</h3>
                <ul className="list-disc ml-5">{groupRoom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3 className="font-medium">Klassenzimmer ({classroom.length})</h3>
                <ul className="list-disc ml-5">{classroom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
            </div>

            <h3 className="mt-4 font-semibold">Verlauf</h3>
            <table className="history-table">
              <thead>
                <tr><th>Name</th><th>Außen</th><th>Gruppe</th><th>Klassenzimmer</th></tr>
              </thead>
              <tbody>
                {students.map(name => {
                  const row = history[name] || {outside:0,group:0,classroom:0};
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

      </div>
    </div>
  );
}
