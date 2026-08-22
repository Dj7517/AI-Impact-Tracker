import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CATEGORIES = [
  { id: "data", label: "Data Analytics & Insights", color: "#2DD4BF" },
  { id: "deck", label: "Presentation Acceleration", color: "#60A5FA" },
  { id: "report", label: "Reporting & Process Automation", color: "#818CF8" },
  { id: "task", label: "Repetitive Task Elimination", color: "#F5A623" },
  { id: "ai", label: "AI & IBM BOB Enablement", color: "#C084FC" },
];

const SEED = [
  { id: 1, name: "Invoice-PO matching", category: "task", before: 12, after: 1, volume: 40, submittedBy: "Procurement", team: "Procurement / AP" },
  { id: 2, name: "Weekly status deck build", category: "deck", before: 90, after: 10, volume: 4, submittedBy: "T&O", team: "T&O" },
  { id: 3, name: "Helpdesk ticket triage", category: "ai", before: 6, after: 0.5, volume: 120, submittedBy: "CIO", team: "CIO" },
];

const STORAGE_KEY = "ai-impact-tracker-entries";
const RATE_KEY = "ai-impact-tracker-hourly-rate";

export default function AIImpactTracker() {
  const [entries, setEntries] = useState(null); // null = loading
  const [hourlyRate, setHourlyRate] = useState(25);
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'submit'
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ name: "", category: "task", team: "", before: "", after: "", volume: "" });
  const [saving, setSaving] = useState(false);

  // Load from shared storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        setEntries(result ? JSON.parse(result.value) : SEED);
      } catch (e) {
        // key doesn't exist yet -> seed it
        setEntries(SEED);
        try {
          await window.storage.set(STORAGE_KEY, JSON.stringify(SEED), true);
        } catch (e2) {
          console.error("Failed to seed storage", e2);
        }
      }
      try {
        const r = await window.storage.get(RATE_KEY, true);
        if (r) setHourlyRate(Number(JSON.parse(r.value)) || 25);
      } catch (e) {
        // no rate set yet, keep default
      }
    })();
  }, []);

  async function persist(newEntries) {
    setEntries(newEntries);
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(newEntries), true);
      if (!result) throw new Error("no result");
      return true;
    } catch (e) {
      console.error("Storage save failed", e);
      return false;
    }
  }

  const withImpact = useMemo(
    () =>
      (entries || []).map((e) => {
        const savedMinPerUnit = Math.max(0, (Number(e.before) || 0) - (Number(e.after) || 0));
        const hoursPerWeek = (savedMinPerUnit * (Number(e.volume) || 0)) / 60;
        return { ...e, hoursPerWeek };
      }),
    [entries]
  );

  const totalHoursPerWeek = withImpact.reduce((s, e) => s + e.hoursPerWeek, 0);
  const totalHoursPerYear = totalHoursPerWeek * 48;
  const totalValuePerYear = totalHoursPerYear * hourlyRate;

  const chartData = withImpact
    .map((e) => ({
      name: e.name.length > 18 ? e.name.slice(0, 16) + "…" : e.name,
      hours: Math.round(e.hoursPerWeek * 10) / 10,
      color: CATEGORIES.find((c) => c.id === e.category)?.color || "#2DD4BF",
    }))
    .sort((a, b) => b.hours - a.hours);

  async function submitEntry() {
    if (!form.name || form.before === "" || form.after === "" || form.volume === "") {
      setStatus("Please fill in task name, before, after, and volume.");
      return;
    }
    setSaving(true);
    setStatus("");
    const newEntry = { id: Date.now(), ...form };
    const newEntries = [...(entries || []), newEntry];
    const ok = await persist(newEntries);
    setSaving(false);
    if (ok) {
      setStatus("Submitted — visible on the Management dashboard now.");
      setForm({ name: "", category: "task", team: "", before: "", after: "", volume: "" });
    } else {
      setStatus("Something went wrong saving this. Please try again.");
    }
  }

  async function updateRate(v) {
    setHourlyRate(v);
    try {
      await window.storage.set(RATE_KEY, JSON.stringify(v), true);
    } catch (e) {
      console.error("Failed to save rate", e);
    }
  }

  async function resetData() {
    const ok = await persist(SEED);
    if (ok) setStatus("Data reset to sample entries.");
  }

  const isLoading = entries === null;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#0B1524",
        color: "#EDEFF2",
        fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
        padding: "24px 20px 40px",
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
        .aitracker-btn:disabled { opacity: 0.5; cursor: default; transform: none; }
        .aitracker-tab {
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #223755;
          background: transparent;
          color: #94A3B8;
        }
        .aitracker-tab.active {
          background: #2DD4BF;
          color: #06231F;
          border-color: #2DD4BF;
        }
        .aitracker-ghost-btn {
          background: transparent;
          border: 1px solid #223755;
          color: #94A3B8;
          border-radius: 8px;
          font-size: 12px;
          padding: 7px 12px;
          cursor: pointer;
        }
        .aitracker-ghost-btn:hover { border-color: #2DD4BF; color: #2DD4BF; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#F5A623", fontWeight: 600, marginBottom: 6 }}>
            T&O BANGALORE · AI INNOVATION LAB
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>AI Impact Tracker</div>
          <div style={{ fontSize: 13.5, color: "#94A3B8", marginTop: 4, maxWidth: 520 }}>
            Employees submit automated tasks here. Everything is saved to a shared database and rolls up into the management dashboard below.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`aitracker-tab ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
            Management Dashboard
          </button>
          <button className={`aitracker-tab ${view === "submit" ? "active" : ""}`} onClick={() => setView("submit")}>
            Employee Submission
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="aitracker-card" style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
          Loading shared data…
        </div>
      )}

      {!isLoading && view === "submit" && (
        <EmployeeView
          form={form}
          setForm={setForm}
          onSubmit={submitEntry}
          saving={saving}
          status={status}
        />
      )}

      {!isLoading && view === "dashboard" && (
        <ManagementView
          withImpact={withImpact}
          chartData={chartData}
          totalHoursPerWeek={totalHoursPerWeek}
          totalHoursPerYear={totalHoursPerYear}
          totalValuePerYear={totalValuePerYear}
          hourlyRate={hourlyRate}
          onRateChange={updateRate}
          onReset={resetData}
          entryCount={(entries || []).length}
        />
      )}
    </div>
  );
}

function EmployeeView({ form, setForm, onSubmit, saving, status }) {
  return (
    <div className="aitracker-card" style={{ padding: "22px 24px", maxWidth: 520 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Submit an automated task</div>
      <div style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 18 }}>
        Anyone on any team can log a task here — it's saved centrally and shows up on the Management Dashboard immediately.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>TASK NAME</div>
          <input className="aitracker-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Expense report review" />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>YOUR TEAM</div>
          <input className="aitracker-input" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="e.g. GRE, CIO, Q2C, Procurement, CDO" />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 4 }}>AREA OF SUPPORT</div>
          <select className="aitracker-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
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
        </div>
        <button className="aitracker-btn" onClick={onSubmit} disabled={saving} style={{ marginTop: 6 }}>
          {saving ? "Saving…" : "Submit initiative"}
        </button>
        {status && (
          <div style={{ fontSize: 12.5, color: status.includes("wrong") ? "#F87171" : "#2DD4BF", marginTop: 2 }}>{status}</div>
        )}
      </div>
    </div>
  );
}

function ManagementView({ withImpact, chartData, totalHoursPerWeek, totalHoursPerYear, totalValuePerYear, hourlyRate, onRateChange, onReset, entryCount }) {
  return (
    <>
      {/* Big counters */}
      <div className="aitracker-card" style={{ padding: "20px 24px", marginBottom: 18, display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>HOURS RECLAIMED / WEEK</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 34, fontWeight: 600, color: "#2DD4BF" }}>
            {totalHoursPerWeek.toFixed(1)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>PROJECTED / YEAR</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 34, fontWeight: 600, color: "#F5A623" }}>
            {Math.round(totalHoursPerYear).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>VALUE GENERATED / YEAR</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 34, fontWeight: 600, color: "#818CF8" }}>
            ${Math.round(totalValuePerYear).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>INITIATIVES</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 34, fontWeight: 600 }}>
            {entryCount}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Assumed rate ($/hr)</div>
          <input
            className="aitracker-input"
            style={{ width: 70 }}
            type="number"
            value={hourlyRate}
            onChange={(e) => onRateChange(Number(e.target.value) || 0)}
          />
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

      {/* List */}
      <div className="aitracker-card" style={{ padding: "6px 0", marginBottom: 12 }}>
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
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>
                      {cat?.label}{e.team ? ` · ${e.team}` : ""} · {e.before}min → {e.after}min · {e.volume}/wk
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "#2DD4BF", fontWeight: 600 }}>
                  {e.hoursPerWeek.toFixed(1)}h/wk
                </div>
              </div>
            );
          })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="aitracker-ghost-btn" onClick={onReset}>Reset to sample data</button>
      </div>
    </>
  );
}
