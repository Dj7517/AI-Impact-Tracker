import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CATEGORIES = [
  { id: "data", label: "Data Analytics & Insights", color: "#2DD4BF" },
  { id: "deck", label: "Presentation Acceleration", color: "#60A5FA" },
  { id: "report", label: "Reporting & Process Automation", color: "#818CF8" },
  { id: "task", label: "Repetitive Task Elimination", color: "#F5A623" },
  { id: "ai", label: "AI & IBM BOB Enablement", color: "#C084FC" },
];

const SEED = [
  { id: 1, name: "Invoice-PO matching", category: "task", before: 12, after: 1, volume: 40 },
  { id: 2, name: "Weekly status deck build", category: "deck", before: 90, after: 10, volume: 4 },
  { id: 3, name: "Helpdesk ticket triage", category: "ai", before: 6, after: 0.5, volume: 120 },
];

export default function AIImpactTracker() {
  const [entries, setEntries] = useState(SEED);
  const [form, setForm] = useState({ name: "", category: "task", before: "", after: "", volume: "" });

  const withImpact = useMemo(
    () =>
      entries.map((e) => {
        const savedMinPerUnit = Math.max(0, (Number(e.before) || 0) - (Number(e.after) || 0));
        const hoursPerWeek = (savedMinPerUnit * (Number(e.volume) || 0)) / 60;
        return { ...e, hoursPerWeek };
      }),
    [entries]
  );

  const totalHoursPerWeek = withImpact.reduce((s, e) => s + e.hoursPerWeek, 0);
  const totalHoursPerYear = totalHoursPerWeek * 48;

  const chartData = withImpact
    .map((e) => ({
      name: e.name.length > 18 ? e.name.slice(0, 16) + "…" : e.name,
      hours: Math.round(e.hoursPerWeek * 10) / 10,
      color: CATEGORIES.find((c) => c.id === e.category)?.color || "#2DD4BF",
    }))
    .sort((a, b) => b.hours - a.hours);

  function addEntry() {
    if (!form.name || form.before === "" || form.after === "" || form.volume === "") return;
    setEntries((prev) => [
      ...prev,
      { id: Date.now(), ...form },
    ]);
    setForm({ name: "", category: "task", before: "", after: "", volume: "" });
  }

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#0B1524",
        color: "#EDEFF2",
        fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
        padding: "28px 20px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .aitracker-input {
          background: #0F1D33;
          border: 1px solid #223755;
          color: #EDEFF2;
          border-radius: 8px;
          padding: 8px 10px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .aitracker-input:focus { border-color: #2DD4BF; }
        .aitracker-card {
          background: linear-gradient(180deg, #101F38 0%, #0D1A30 100%);
          border: 1px solid #1D3153;
          border-radius: 14px;
        }
        .aitracker-btn {
          background: #2DD4BF;
          color: #06231F;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 16px;
          cursor: pointer;
          transition: transform 0.12s ease, background 0.12s ease;
        }
        .aitracker-btn:hover { background: #5EEAD4; transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#F5A623", fontWeight: 600, marginBottom: 6 }}>
          T&O BANGALORE · AI INNOVATION LAB
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>AI Impact Tracker</div>
        <div style={{ fontSize: 13.5, color: "#94A3B8", marginTop: 4, maxWidth: 560 }}>
          Log every automated task, see the hours it actually reclaims — closing the gap between deploying AI and proving it moved the business.
        </div>
      </div>

      {/* Big counter */}
      <div className="aitracker-card" style={{ padding: "20px 24px", marginBottom: 18, display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>HOURS RECLAIMED / WEEK</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 36, fontWeight: 600, color: "#2DD4BF" }}>
            {totalHoursPerWeek.toFixed(1)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>PROJECTED / YEAR</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 36, fontWeight: 600, color: "#F5A623" }}>
            {Math.round(totalHoursPerYear).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>INITIATIVES TRACKED</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 36, fontWeight: 600 }}>
            {entries.length}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="aitracker-card" style={{ padding: "18px 20px", marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#EDEFF2" }}>
          Hours saved / week by initiative
        </div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#1D3153" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={{ stroke: "#1D3153" }} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0F1D33", border: "1px solid #223755", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#EDEFF2" }}
                cursor={{ fill: "#ffffff08" }}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add new entry */}
      <div className="aitracker-card" style={{ padding: "18px 20px", marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Log a new automated task</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>TASK NAME</div>
            <input className="aitracker-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Expense report review" />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>AREA</div>
            <select className="aitracker-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>BEFORE (min)</div>
            <input className="aitracker-input" type="number" value={form.before} onChange={(e) => setForm({ ...form, before: e.target.value })} placeholder="12" />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>AFTER (min)</div>
            <input className="aitracker-input" type="number" value={form.after} onChange={(e) => setForm({ ...form, after: e.target.value })} placeholder="1" />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>VOLUME / WK</div>
            <input className="aitracker-input" type="number" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} placeholder="40" />
          </div>
          <button className="aitracker-btn" onClick={addEntry}>Add</button>
        </div>
      </div>

      {/* List */}
      <div className="aitracker-card" style={{ padding: "6px 0" }}>
        {withImpact
          .slice()
          .sort((a, b) => b.hoursPerWeek - a.hoursPerWeek)
          .map((e, i) => {
            const cat = CATEGORIES.find((c) => c.id === e.category);
            return (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderTop: i === 0 ? "none" : "1px solid #1D3153",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: cat?.color }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{cat?.label} · {e.before}min → {e.after}min · {e.volume}/wk</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "#2DD4BF", fontWeight: 600 }}>
                  {e.hoursPerWeek.toFixed(1)}h/wk
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
