<section className="card">
  <h2>Schülerliste</h2>
  <textarea 
    value={studentsText} 
    onChange={e=>setStudentsText(e.target.value)} 
    rows={10} 
    className="card-input"
  />
  <div className="card-controls">
    <label>Außenbereich
      <input type="number" value={capacityOutside} onChange={e=>setCapacityOutside(Number(e.target.value))}/>
    </label>
    <label>Gruppenraum
      <input type="number" value={capacityGroup} onChange={e=>setCapacityGroup(Number(e.target.value))}/>
    </label>
  </div>
  <div className="card-buttons">
    <button onClick={assign} className="btn btn-primary">Zuweisen</button>
    <button onClick={resetHistory} className="btn btn-danger">Verlauf zurücksetzen</button>
    <button onClick={exportJSON} className="btn btn-outline">Export</button>
    <label className="btn btn-outline cursor-pointer">Import
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
  <h3 style={{marginTop:"20px"}}>Verlauf</h3>
  <table className="history-table">
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
