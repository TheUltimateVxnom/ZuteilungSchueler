import React, { useState } from "react";

function App() {
  const [aussen, setAussen] = useState("");
  const [gruppe, setGruppe] = useState("");

  return (
    <main className="app-main">
      {/* --- Erste Box --- */}
      <section className="card" style={{ marginBottom: "20px" }}>
        <div>
          <label>Außenbereich</label>
          <input
            type="text"
            value={aussen}
            onChange={(e) => setAussen(e.target.value)}
          />
        </div>
        <div>
          <label>Gruppenraum</label>
          <input
            type="text"
            value={gruppe}
            onChange={(e) => setGruppe(e.target.value)}
          />
        </div>
        <div className="button-row">
          <button className="blue">Zuweisen</button>
          <button className="red">Verlauf zurücksetzen</button>
          <button>Export</button>
          <button>Import</button>
        </div>
      </section>

      {/* --- Zweite Box --- */}
      <section className="card">
        <h2>Aktuelle Zuteilung</h2>
        <div className="zuteilung">
          <p>Außenbereich (0)</p>
          <p>Gruppenraum (0)</p>
          <p>Klassenzimmer (0)</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Außen</th>
              <th>Gruppe</th>
              <th>Klassenzimmer</th>
            </tr>
          </thead>
          <tbody>
            {/* Hier kommen deine Daten */}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default App;
