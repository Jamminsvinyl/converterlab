"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [bpm, setBpm] = useState(120);

  const handleConvert = (actionType = "default") => {
    setError("");
    setOutput("");
    try {
      if (!input.trim() && activeTab !== "bpm-ms") return;

      if (activeTab === "json-csv") {
        let data = JSON.parse(input);
        if (!Array.isArray(data)) data = [data];
        const headers = Object.keys(data[0]);
        const rows = [headers.join(","), ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(","))];
        setOutput(rows.join("\n"));
      } 
      else if (activeTab === "curl-code") {
        const urlMatch = input.match(/curl\s+["']?([^"'\s]+)["']?/);
        if (!urlMatch) throw new Error("Invalid cURL. Start with 'curl'");
        setOutput(`fetch("${urlMatch[1]}").then(r => r.json()).then(console.log);`);
      }
      else if (activeTab === "jwt-decoder") {
        const parts = input.split('.');
        if (parts.length !== 3) throw new Error("Invalid JWT.");
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        setOutput(JSON.stringify(payload, null, 2));
      }
      else if (activeTab === "base64") {
        setOutput(actionType === "encode" ? btoa(input) : atob(input));
      }
      else if (activeTab === "sql-format") {
        const keywords = ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "JOIN", "LEFT JOIN", "GROUP BY", "ORDER BY"];
        let formatted = input.replace(/\s+/g, " ");
        keywords.forEach(key => formatted = formatted.replace(new RegExp(` ${key} `, "gi"), `\n${key} `));
        setOutput(formatted.trim());
      }
      else if (activeTab === "cron-gen") {
        setOutput("0 0 * * * (Example: Every day at midnight)");
      }
    } catch (e) { setError("Format error. Please check your input."); }
  };

  // Music Lab Calculation
  const calculateBpm = (val) => {
    setBpm(val);
    const ms = (60000 / val).toFixed(2);
    setOutput(`1/4 Note (Quarter): ${ms} ms\n1/8 Note (Eighth): ${(ms/2).toFixed(2)} ms\n1/16 Note (Sixteenth): ${(ms/4).toFixed(2)} ms`);
  };

  const tabs = {
    "dev": [
      { id: "json-csv", name: "JSON to CSV" },
      { id: "curl-code", name: "cURL to Code" },
      { id: "jwt-decoder", name: "JWT Decoder" },
      { id: "base64", name: "Base64 Tool" },
      { id: "sql-format", name: "SQL Formatter" },
      { id: "cron-gen", name: "Cron Generator" }
    ],
    "music": [
      { id: "bpm-ms", name: "BPM to MS" }
    ]
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold text-white">Converter<span className="text-emerald-500">Lab</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">Developer Tools</div>
          {tabs.dev.map(t => (
            <button key={t.id} onClick={() => {setActiveTab(t.id); setInput(""); setOutput("");}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === t.id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{t.name}</button>
          ))}
          <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 mt-6 px-4 tracking-tighter">Music Lab</div>
          {tabs.music.map(t => (
            <button key={t.id} onClick={() => {setActiveTab(t.id); setInput(""); setOutput("");}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === t.id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{t.name}</button>
          ))}
        </nav>
        <div className="m-4 p-4 h-48 bg-neutral-800/10 border border-dashed border-neutral-800 rounded flex items-center justify-center text-[10px] text-neutral-700 text-center uppercase tracking-widest">AdSpace Sidebar</div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="w-full h-20 border-b border-neutral-800 flex items-center justify-center text-[10px] text-neutral-700 uppercase tracking-[0.2em]">AdSpace Top Banner</div>
        <div className="p-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 capitalize">{activeTab.replace('-', ' ')}</h2>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
              {activeTab === "bpm-ms" ? (
                <div className="space-y-6">
                  <label className="block text-sm font-medium text-neutral-400">Enter BPM (Tempo)</label>
                  <input type="number" value={bpm} onChange={(e) => calculateBpm(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-lg p-4 text-2xl font-mono text-emerald-400 outline-none focus:border-emerald-500" />
                  <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono">{output || "Calculation will appear here..."}</pre>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <textarea className="h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input goes here..." />
                    <textarea className="h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Output..." />
                  </div>
                  <div className="mt-6 flex gap-3 items-center">
                    {activeTab === "base64" ? (
                      <>
                        <button onClick={() => handleConvert("encode")} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all active:scale-95">Encode</button>
                        <button onClick={() => handleConvert("decode")} className="px-6 py-2 border border-emerald-600 text-emerald-500 rounded-lg">Decode</button>
                      </>
                    ) : (
                      <button onClick={() => handleConvert()} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all active:scale-95">Run Tool</button>
                    )}
                    {output && <button onClick={() => navigator.clipboard.writeText(output)} className="ml-auto text-xs text-neutral-500 hover:text-white underline">Copy to Clipboard</button>}
                  </div>
                </>
              )}
            </div>
            <div className="mt-8 h-12 border border-dashed border-neutral-800 rounded flex items-center justify-center text-[10px] text-neutral-700 uppercase tracking-widest">In-Feed Advertisement</div>
          </div>
        </div>
        <footer className="p-6 border-t border-neutral-800 flex justify-between items-center text-[10px] text-neutral-600 px-12">
          <div>© 2026 ConverterLab.io</div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-emerald-500">Privacy</a>
            <a href="/terms" className="hover:text-emerald-500">Terms</a>
            <a href="mailto:hello@converterlab.io" className="hover:text-emerald-500">Contact</a>
          </div>
        </footer>
      </main>
    </div>
  );
}