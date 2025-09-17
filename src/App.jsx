import React, { useState } from "react";
import "./index.css";

function App() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState("");
  const [history, setHistory] = useState([]);
  const [groupRoom, setGroupRoom] = useState("");
  const [outdoor, setOutdoor] = useState("");

  const addStudent = () => {
    if (newStudent.trim() !== "") {
      setStudents([...students, newStudent.trim()]);
      setNewStudent("");
    }
  };

  const assignStudent = (student, room) => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory([{ student, room, timestamp }, ...history]);
    if (room === "Gruppenraum") {
      setGroupRoom(student);
    } else {
      setOutdoor(student);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ students, history });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zuteilung.json";
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setStudents(data.students || []);
      setHistory(data.history || []);
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Zuteilung Schüler</h1>
        <div className="card-buttons">
          <button onClick={handleExport}>Export</button>
          <label htmlFor="import-file" className="btn-outline">
            Import
          </label>
          <input
            type="file"
            id="import-file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </div>
      </header>

      <main className="app-main">
        {/* Schülerliste */}
        <section className="card">
          <h2>Schülerliste</h2>
          <ul>
            {students.map((s, i) => (
              <li key={i}>
                {s}
                <button onClick={() => assignStudent(s, "Gruppenraum")}>
                  → Gruppenraum
                </button>
                <button onClick={() => assignStudent(s, "Außenbereich")}>
                  → Außenbereich
                </button>
              </li>
            ))}
          </ul>
          <div className="add-student">
            <input
              type="text"
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
              placeholder="Neuer Schüler"
            />
            <button onClick={addStudent}>Hinzufügen</button>
          </div>
        </section>

        {/* Zuteilung */}
        <section className="card">
          <h2>Eintragung</h2>
          <div className="assignments">
            <div>
              <h3>Gruppenraum</h3>
              <p>{groupRoom || "-"}</p>
            </div>
            <div>
              <h3>Außenbereich</h3>
              <p>{outdoor || "-"}</p>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="card">
          <h2>History</h2>
          {history.length === 0 ? (
            <p className="placeholder">Noch keine Einträge</p>
          ) : (
            <ul>
              {history.map((h, i) => (
                <li key={i}>
                  {h.student} → {h.room} ({h.timestamp})
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
