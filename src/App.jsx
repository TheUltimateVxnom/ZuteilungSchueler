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

  // Verlauf laden
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

  // **Komplett zufällige Zuteilung**
  const assign = () => {
    if (!students.length) return;

    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const outsideSel = shuffled.slice(0, Math.min(capacityOutside, shuffled.length));
    const groupSel = shuffled.slice(outsideSel.length, outsideSel.length + Math.min(capacityGroup, shuffled.length - outsideSel.length));
    const rest = shuffled.slice(outsideSel.length + groupSel.length);

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
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-gray-200">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Schüler-Zuteilung</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Zufällige Zuweisung von Schülern</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
            <h2 className="font-semibold mb-2">Schülerliste</h2>
            <textarea value={studentsText} onChange={e=>setStudentsText(e.target.value)} rows={10} className="w-full p-2 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"/>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <label className="flex flex-col text-sm">Außenbereich
                <input type="number" value={capacityOutside} onChange={e=>setCapacityOutside(Number(e.target.value))} className="p-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"/>
              </label>
              <label className="flex flex-col text-sm">Gruppenraum
                <input type="number" value={capacityGroup} onChange={e=>setCapacityGroup(Number(e.target.value))} className="p-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"/>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={assign} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg">Zuweisen</button>
              <button onClick={resetHistory} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg">Verlauf zurücksetzen</button>
              <button onClick={exportJSON} className="border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold px-4 py-2 rounded-lg">Export</button>
              <label className="border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold px-4 py-2 rounded-lg cursor-pointer">
                Import
                <input type="file" style={{display:"none"}} onChange={e=>importJSON(e.target.files[0])}/>
              </label>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
            <h2 className="font-semibold mb-2">Aktuelle Zuteilung</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium">Außenbereich ({outside.length})</h3>
                <ul className="list-disc ml-5">{outside.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3 className="text-sm font-medium">Gruppenraum ({groupRoom.length})</h3>
                <ul className="list-disc ml-5">{groupRoom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <h3 className="text-sm font-medium">Klassenzimmer ({classroom.length})</h3>
                <ul className="list-disc ml-5">{classroom.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Verlauf</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 border-b border-gray-300 dark:border-gray-600">Name</th>
                    <th className="py-2 border-b border-gray-300 dark:border-gray-600">Außen</th>
                    <th className="py-2 border-b border-gray-300 dark:border-gray-600">Gruppe</th>
                    <th className="py-2 border-b border-gray-300 dark:border-gray-600">Klassenzimmer</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(name => {
                    const row = history[name]||{outside:0,group:0,classroom:0};
                    return (
                      <tr key={name} className="even:bg-gray-100 dark:even:bg-gray-700">
                        <td className="py-1">{name}</td>
                        <td className="py-1">{row.outside}</td>
                        <td className="py-1">{row.group}</td>
                        <td className="py-1">{row.classroom}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
