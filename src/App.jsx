import React, { useEffect, useState } from "react";

// Default export: App component
export default function App() {
  const [studentsText, setStudentsText] = useState(`Lukas\nAnna\nBen\nClara\nDavid\nEmilia\nFelix\nGreta`);
  const [students, setStudents] = useState([]);
  const [capacityOutside, setCapacityOutside] = useState(3);
  const [capacityGroup, setCapacityGroup] = useState(3);
  const [outside, setOutside] = useState([]);
  const [groupRoom, setGroupRoom] = useState([]);
  const [classroom, setClassroom] = useState([]);
  const [history, setHistory] = useState({}); // { name: { outside: n, group: m, classroom: k } }
  const STORAGE_KEY = "schueler_zuteilung_state_v1";

  // parse studentsText into array (unique, trimmed, non-empty)
  useEffect(() => {
    const arr = studentsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    // keep order but ensure unique
    const uniq = Array.from(new Set(arr));
    setStudents(uniq);
  }, [studentsText]);

  // load persisted state (history) on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.history) setHistory(parsed.history);
      }
    } catch (e) {
      console.warn("Fehler beim Laden aus localStorage", e);
    }
  }, []);

  // helper: persist history
  const persist = (newHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: newHistory }));
    } catch (e) {
      console.warn("Fehler beim Speichern in localStorage", e);
    }
  };

  // gewichtete Auswahl: Schüler mit hoher Nutzung in einem Bereich haben geringere Wahrscheinlichkeit erneut dorthin zu kommen
  const weightedShuffle = (arr) => {
    const weighted = arr.map((name) => {
      const h = history[name] || { outside: 0, group: 0, classroom: 0 };
      // Gewicht: je öfter im Gruppenraum, desto höher die Chance auf andere Bereiche
      const weightGroup = 1 / (1 + h.group);
      const weightOutside = 1 / (1 + h.outside);
      // für die Grundmischung mitteln wir die beiden
      const baseWeight = (weightGroup + weightOutside) / 2;
      return { name, weight: baseWeight };
    });

    // normalize
    const total = weighted.reduce((acc, w) => acc + w.weight, 0);
    let pool = weighted.slice();

    const result = [];
    while (pool.length) {
      let r = Math.random() * total;
      let cumulative = 0;
      let chosenIndex = 0;
      for (let i = 0; i < pool.length; i++) {
        cumulative += pool[i].weight;
        if (r <= cumulative) {
          chosenIndex = i;
          break;
        }
      }
      result.push(pool[chosenIndex].name);
      pool.splice(chosenIndex, 1);
    }
    return result;
  };

  const assign = () => {
    if (students.length === 0) return;

    const shuffled = weightedShuffle(students);

    const takeOutside = Math.max(0, Math.min(capacityOutside | 0, shuffled.length));
    const outsideSel = shuffled.slice(0, takeOutside);

    const remainingAfterOutside = shuffled.slice(takeOutside);
    const takeGroup = Math.max(0, Math.min(capacityGroup | 0, remainingAfterOutside.length));
    const groupSel = remainingAfterOutside.slice(0, takeGroup);

    const rest = remainingAfterOutside.slice(takeGroup);

    setOutside(outsideSel);
    setGroupRoom(groupSel);
    setClassroom(rest);

    // update history counts
    const newHistory = { ...history };
    students.forEach((name) => {
      if (!newHistory[name]) newHistory[name] = { outside: 0, group: 0, classroom: 0 };
    });
    outsideSel.forEach((n) => (newHistory[n].outside += 1));
    groupSel.forEach((n) => (newHistory[n].group += 1));
    rest.forEach((n) => (newHistory[n].classroom += 1));

    setHistory(newHistory);
    persist(newHistory);
  };

  const resetHistory = () => {
    if (!confirm("Verlauf wirklich zurücksetzen?")) return;
    setHistory({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const exportRepoReady = () => {
    const payload = {
      students,
      capacityOutside,
      capacityGroup,
      history,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schueler_zuteilung_export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.students) setStudentsText(parsed.students.join("\n"));
        if (typeof parsed.capacityOutside === "number") setCapacityOutside(parsed.capacityOutside);
        if (typeof parsed.capacityGroup === "number") setCapacityGroup(parsed.capacityGroup);
        if (parsed.history) {
          setHistory(parsed.history);
          persist(parsed.history);
        }
        alert("Import erfolgreich");
      } catch (err) {
        alert("Fehler beim Import: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Schüler-Zuteilung</h1>
          <p className="text-sm text-gray-600">Konfiguriere Schüler, Kapazitäten und weise zufällig (gewichtete) zu.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-medium mb-2">Schülerliste (ein Name pro Zeile)</h2>
            <textarea
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
              rows={10}
              className="w-full border rounded p-2 font-mono"
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="flex flex-col">
                <span className="text-sm text-gray-700">Kapazität Außenbereich</span>
                <input
                  type="number"
                  value={capacityOutside}
                  onChange={(e) => setCapacityOutside(Number(e.target.value))}
                  className="border rounded p-1"
                  min={0}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-700">Kapazität Gruppenraum</span>
                <input
                  type="number"
                  value={capacityGroup}
                  onChange={(e) => setCapacityGroup(Number(e.target.value))}
                  className="border rounded p-1"
                  min={0}
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={assign} className="px-3 py-2 rounded bg-blue-600 text-white">
                Zuweisen
              </button>

              <button
                onClick={() => {
                  setStudentsText((s) => (students.length ? students.join("\n") : s));
                }}
                className="px-3 py-2 rounded border"
              >
                Liste aktualisieren
              </button>

              <button onClick={resetHistory} className="px-3 py-2 rounded border bg-red-50 text-red-600">
                Verlauf zurücksetzen
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={exportRepoReady} className="px-3 py-2 rounded border">
                Exportieren (JSON)
              </button>

              <label className="px-3 py-2 rounded border cursor-pointer">
                Importieren
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => importJSON(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </section>

          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-medium mb-2">Aktuelle Zuteilung</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-semibold">Außenbereich ({outside.length})</h3>
                <ul className="mt-2 list-disc ml-5">
                  {outside.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Gruppenraum ({groupRoom.length})</h3>
                <ul className="mt-2 list-disc ml-5">
                  {groupRoom.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Klassenzimmer ({classroom.length})</h3>
                <ul className="mt-2 list-disc ml-5">
                  {classroom.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>

            <hr className="my-4" />

            <h3 className="font-medium">Verlauf (Wieviele Einsätze pro Bereich)</h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Name</th>
                    <th className="py-2">Außen</th>
                    <th className="py-2">Gruppe</th>
                    <th className="py-2">Klassenzimmer</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((name) => {
                    const row = history[name] || { outside: 0, group: 0, classroom: 0 };
                    return (
                      <tr key={name} className="border-b even:bg-gray-50">
                        <td className="py-2">{name}</td>
                        <td className="py-2">{row.outside}</td>
                        <td className="py-2">{row.group}</td>
                        <td className="py-2">{row.classroom}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <footer className="mt-6 text-sm text-gray-600">
          <p>Hinweis: Die App speichert den Verlauf lokal (localStorage). Für ein GitHub-Repository: lege ein React/Vite-Projekt an, kopiere diese Komponente als <code>src/App.jsx</code> und richte Tailwind ein.</p>
        </footer>
      </div>
    </div>
  );
}
