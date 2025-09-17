import React, { useEffect, useState } from "react";

export default function App() {
  const [studentsText, setStudentsText] = useState("");
  const [students, setStudents] = useState([]);
  const [capacityOutside, setCapacityOutside] = useState(3);
  const [capacityGroup, setCapacityGroup] = useState(3);
  const [outside, setOutside] = useState([]);
  const [groupRoom, setGroupRoom] = useState([]);
  const [classroom, setClassroom] = useState([]);
  const [history, setHistory] = useState({});

  const STORAGE_KEY = "schueler_zuteilung_state_v1";

  useEffect(() => {
    const arr = studentsText.split(/\r?\n/).map(s => s.trim()).filter(s => s);
    setStudents(Array.from(new Set(arr)));
  }, [studentsText]);

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

  const assign = () => {
    if (!students.length) return;

    const shuffled = [...students].sort(() => Math.random() - 0.5);

    const outsideSel = shuffled.slice(0, capacityOutside);
    const remaining = shuffled.slice(capacityOutside);
    const groupSel = remaining.slice(0, capacityGroup);
    const rest = remaining.slice(capacityGroup);

    setOutside(outsideSel);
    setGroupRoom(groupSel);
    setClassroom(rest);

    const newHistory = {};
    outsideSel.forEach(n => newHistory[n] = { outside:1, group:0, classroom:0 });
    groupSel.forEach(n => newHistory[n] = { outside:0, group:1, classroom:0 });
    rest.forEach(n => newHistory[n] = { outside:0, group:0, classroom:1 });

    setHistory(newHistory);
    persist(newHistory);
  };

  const resetHistory = () => { setHistory({}); localStorage.removeItem(STORAGE_KEY); };
  const exportJSON = () => { const blob = new Blob([JSON.stringify({students,capacityOutside,capacityGroup,history},null,2)], {type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="schueler_zuteilung.json"; a.click(); URL.revokeObjectURL(url); };
  const importJSON = file => { const reader = new FileReader(); reader.onload = e => { try { const parsed = JSON.parse(e.target.result); if(parsed.students) setStudentsText(parsed.students.join("\n")); if(parsed.capacityOutside) setCapacityOutside(parsed.capacityOutside); if(parsed.capacityGroup) setCapacityGroup(parsed.capacityGroup); if(parsed.history){ setHistory(parsed.history); persist(parsed.history); } } catch(e){ alert("Fehler: "+e.message); } }; reader.readAsText(file); };

  return (
    <div className="app-container">
      <div className="app-inner">
        <header className="app-header" style={{textAlign:"center", marginBottom:"20px"}}>
          <h1>Schüler-Zuteilung</h1>
          <p>Konfiguriere Schüler, Kapazitäten und weise zufällig zu</p>
        </header>

        <main class
