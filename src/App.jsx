import React, { useEffect, useState } from "react";

export default function App() {
  const [studentsText, setStudentsText] = useState(``); // leer starten
  const [students, setStudents] = useState([]);
  const [capacityOutside, setCapacityOutside] = useState(3);
  const [capacityGroup, setCapacityGroup] = useState(3);
  const [outside, setOutside] = useState([]);
  const [groupRoom, setGroupRoom] = useState([]);
  const [classroom, setClassroom] = useState([]);
  const [history, setHistory] = useState({}); // leer starten

  // parse students text
  useEffect(() => {
    const arr = studentsText.split(/\r?\n/).map(s => s.trim()).filter(s => s);
    setStudents(Array.from(new Set(arr)));
  }, [studentsText]);

  // Vollständig zufällige Zuteilung
  const shuffleArray = arr => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const assign = () => {
    if (!students.length) return;
    const shuffled = shuffleArray(students);
    const takeOutside = Math.min(capacityOutside, shuffled.length);
    const outsideSel = shuffled.slice(0, takeOutside);
    const remaining = shuffled.slice(takeOutside);
    const takeGroup = Math.min(capacityGroup, remaining.length);
    const groupSel = remaining.slice(0, takeGroup);
    const rest = remaining.slice(takeGroup);

    setOutside(outsideSel);
    setGroupRoom(groupSel);
    setClassroom(rest);

    // Update history nur für aktuelle Session
    const newHistory = {};
    students.forEach(n => { newHistory[n] = { outside:0, group:0, classroom:0 }; });
    outsideSel.forEach(n => newHistory[n].outside++);
    groupSel.forEach(n => newHistory[n].group++);
    rest.forEach(n => newHistory[n].classroom++);
    setHistory(newHistory);
  };

  const resetHistory = () => { setHistory({}); };

  return (
    <div className="app-container">
      <div className="app-inner">
        <header className="app-header" style={{textAlign:"center", marginBottom:"20px"}}>
          <h1>Schüler-Zuteilung</h1>
          <p>Konfiguriere Schüler, Kapazitäten und weise zufällig zu</p>
        </header>

        <main className="app-main">
          <section className="card">
            <h2>Schülerliste</h2>
            <textarea
              value={studentsText}
              onChange={e => setStudentsText(e.target.value)}
              rows={10}
              className="card-input"
            />
            <div className="card-controls" style={{marginTop:"15px", display:"flex", justifyContent:"center", gap:"15px"}}>
              <label>Außenbereich<input type="number" value={capacityOutside} onChange={e => setCapacityOutside(Number(e.target.value))}/></label>
              <label>Gruppenraum<input type="number" value={capacityGroup} onChange={e => setCapacityGroup(Number(e.target.value))}/></label>
            </div>
            <div className="card-buttons" style={{marginTop:"15px", display:"flex", justifyContent:"center", gap:"10px", flexWrap:"wrap"}}>
              <button onClick={assign} className="btn btn-primary">Zuweisen</button>
              <button onClick={resetHistory} className="btn btn-danger">Verlauf zurücksetzen</button>
            </div>
          </section>

          <section className="card">
            <h2>Aktuelle Zuteilung</h2>
            <div className="grid-section">
              <div style={{textAlign:"center"}}>
                <h3>Außenbereich ({outside.length})</h3>
                <ul>{outside.map(n => <li key={n}>{n}</li>)}</ul>
              </div>
              <div style={{textAlign:"center"}}>
                <h3>Gruppenraum ({groupRoom.length})</h3>
                <ul>{groupRoom.map(n => <li key={n}>{n}</li>)}</ul>
              </div>
              <div style={{textAlign:"center"}}>
                <h3>Klassenzimmer ({classroom.length})</h3>
                <ul>{classroom.map(n => <li key={n}>{n}</li>)}</ul>
              </div>
            </div>

            <h3 style={{marginTop:"20px"}}>Verlauf</h3>
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
      </div>
    </div>
  );
}
