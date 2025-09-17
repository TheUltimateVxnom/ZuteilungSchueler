<section className="card">
  <h2>Schülerliste</h2>
  <textarea
    value={studentsText}
    onChange={(e) => setStudentsText(e.target.value)}
    rows={10}
    className="card-input"
    placeholder="Namen hier eingeben, jeweils eine Zeile"
    style={{ width: "100%", padding: "10px", borderRadius: "10px" }}
  />

  {/* Eingabefelder für Kapazität */}
  <div
    className="card-controls"
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "30px", // Abstand zwischen den Boxen
      marginTop: "15px",
    }}
  >
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
      }}
    >
      Außenbereich
      <input
        type="number"
        value={capacityOutside}
        onChange={(e) => setCapacityOutside(Number(e.target.value))}
        style={{
          padding: "5px 10px",
          borderRadius: "8px",
          textAlign: "center",
          minWidth: "60px",
        }}
      />
    </label>

    <label
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
      }}
    >
      Gruppenraum
      <input
        type="number"
        value={capacityGroup}
        onChange={(e) => setCapacityGroup(Number(e.target.value))}
        style={{
          padding: "5px 10px",
          borderRadius: "8px",
          textAlign: "center",
          minWidth: "60px",
        }}
      />
    </label>
  </div>

  {/* Buttons */}
  <div
    className="card-buttons"
    style={{
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap", // falls Bildschirm schmal ist -> Zeilenumbruch
      gap: "15px", // mehr Abstand zwischen Buttons
      marginTop: "20px",
    }}
  >
    <button
      onClick={assign}
      className="btn btn-primary"
      style={{ padding: "8px 15px", borderRadius: "8px" }}
    >
      Zuweisen
    </button>

    <button
      onClick={resetHistory}
      className="btn btn-danger"
      style={{ padding: "8px 15px", borderRadius: "8px" }}
    >
      Verlauf zurücksetzen
    </button>

    <button
      onClick={exportJSON}
      className="btn btn-outline"
      style={{ padding: "8px 15px", borderRadius: "8px" }}
    >
      Export
    </button>

    <label
      className="btn btn-outline btn-import cursor-pointer"
      style={{ padding: "8px 15px", borderRadius: "8px" }}
    >
      Import
      <input
        type="file"
        style={{ display: "none" }}
        onChange={(e) => importJSON(e.target.files[0])}
      />
    </label>
  </div>
</section>
