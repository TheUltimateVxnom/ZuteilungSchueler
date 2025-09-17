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
  const [history, setHistory] = useState({});
  const STORAGE_KEY = "schueler_zuteilung_state_v1";

  useEffect(() => {
    const arr = studentsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const uniq = Array.from(new Set(arr));
    setStudents(uniq);
  }, [studentsText]);

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

  const persist = (newHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: newHistory }));
    } catch (e) {
      console.warn("Fehler beim Speichern in localStorage", e);
    }
  };

  const weightedShuffle = (arr) => {
    const weighted = arr.map((name) => {
      const h = history[name] || { outside: 0, group: 0, classroom: 0 };
      const weightGroup = 1 / (1 + h.group);
      const weightOutside = 1 / (1 + h.outside);
      const baseWeight = (weightGroup + weightOutside) / 2;
      return { name, weight: baseWeight };
    });
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
    const payload = { students, capacityOutside, capacityGroup, history };
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
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Schüler-Zuteilung</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Konfiguriere Schüler, Kapazitäten und weise zufällig (gewichtete) zu.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
            <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Schülerliste</h2>
            <textarea
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
              rows={10}
              className="w-full p-3 font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 dark:text-gray-300">Kapazität Außenbereich</span>
                <input
                  type="number"
                  value={capacityOutside}
                  onChange={(e) => setCapacityOutside(Number(e.target.value))}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={0}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-700 dark:text-gray-300">Kapazität Gruppenraum</span>
                <input
                  type="number"
                  value={capacityGroup}
                  onChange={(e) => setCapacityGroup(Number(e.target.value))}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={0}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={assign} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition">
                Zuweisen
              </button>
              <button
                onClick={() => setStudentsText(students.join("\n"))}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Liste aktualisieren
              </button>
              <button
                onClick={resetHistory}
                className="px-4 py-2 rounded-xl border border-red-400 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 transition"
              >
                Verlauf zurücksetzen
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={exportRepoReady} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                Exportieren (JSON)
              </button>
              <label className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                Importieren
                <input type="file" accept="application/json" onChange={(e) => importJSON(e.target.files[0])} style={{ display: "none" }} />
              </label>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
            <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Aktuelle Zuteilung</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Außenbereich ({outside.length})</h3>
                <ul className="mt-2 list-disc ml-5 text-gray-800 dark:text-gray-200">
                  {outside.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gruppenraum ({groupRoom.length})</h3>
                <ul className="mt-2 list-disc ml-5 text-gray-800 dark:text-gray-200">
                  {groupRoom.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Klassenzimmer ({classroom.length})</h3>
                <ul className="mt-2 list-disc ml-5 text-gray-800 dark:text-gray-200">
                  {classroom.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
            </div>

            <hr className="my-4 border-gray-300 dark:border-gray-700" />

            <h3 className="font-medium text-gray-700 dark:text-gray-300">Verlauf (Einsätze pro Bereich)</h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Außen</th>
                    <th className="py-2 px-3">Gruppe</th>
                    <th className="py-2 px-3">Klassenzimmer</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((name) => {
                    const row = history[name] || { outside: 0, group: 0, classroom: 0 };
                    return (
                      <tr key={name} className="even:bg-gray-50 dark:even:bg-gray-700">
                        <td className="py-2 px-3">{name}</td>
                        <td className="py-2 px-3">{row.outside}</td>
                        <td className="py-2 px-3">{row.group}</td>
                        <td className="py-2 px-3">{row.classroom}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <footer className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Hinweis: Die App speichert den Verlauf lokal (localStorage).
        </footer>
      </div>
    </div>
  );
}
