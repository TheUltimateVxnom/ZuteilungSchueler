import React, { useState } from "react";
import "./index.css";

function App() {
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [history, setHistory] = useState([]);

  const handleImportChange = (e) => {
    setImportText(e.target.value);
  };

  const handleExportChange = (e) => {
    setExportText(e.target.value);
  };

  const handleSave = () => {
    if (importText.trim() !== "" || exportText.trim() !== "") {
      const newEntry = {
        import: importText,
        export: exportText,
        timestamp: new Date().toLocaleString(),
      };
      setHistory([newEntry, ...history]); // Eintrag vorne einfügen
      setImportText("");
      setExportText("");
    }
  };

  return (
    <div className="app">
      <h1 className="title">Sonderzeichen-Coder</h1>

      <div className="container">
        <div className="input-group">
          <label className="label">Import</label>
          <textarea
            className="textarea"
            value={importText}
            onChange={handleImportChange}
            placeholder="Hier importieren..."
          />
        </div>

        <div className="input-group">
          <label className="label">Export</label>
          <textarea
            className="textarea"
            value={exportText}
            onChange={handleExportChange}
            placeholder="Hier exportieren..."
          />
        </div>
      </div>

      <button className="btn-import" onClick={handleSave}>
        Speichern
      </button>

      <div className="history">
        <h2 className="subtitle">History</h2>
        {history.length === 0 ? (
          <p className="no-history">Keine Einträge vorhanden</p>
        ) : (
          <ul>
            {history.map((entry, index) => (
              <li key={index} className="history-entry">
                <p>
                  <strong>Import:</strong> {entry.import}
                </p>
                <p>
                  <strong>Export:</strong> {entry.export}
                </p>
                <span className="timestamp">{entry.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
