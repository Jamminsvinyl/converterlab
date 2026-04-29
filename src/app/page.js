"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [bpm, setBpm] = useState(120);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobil menü kontrolü

  const handleConvert = (actionType = "default") => {
    setError(""); setOutput("");
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
        const keywords = ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "JOIN"];
        let formatted = input.replace(/\s+/g, " ");
        keywords.forEach(key => formatted = formatted.replace(new RegExp(` ${key} `, "gi"), `\n${key} `));
        setOutput(formatted.trim());
      }
    } catch (e) { setError("Format error. Check your input."); }
  };

  const calculateBpm = (val) => {
    setBpm(val);
    const ms = (60000 / val).toFixed(2);
    setOutput(`1/4 Note: ${ms} ms\n1/8 Note: ${(ms/2).toFixed(2)} ms\n1/16 Note: ${(ms/4).toFixed(2)} ms`);
  };

  const toolData = {
    "json-csv": { name: "JSON to CSV", how: "Paste JSON array.", why: "Essential for data analysts." },
    "curl-code": { name: "cURL to Code", how: "Paste cURL command.", why: "Instant fetch snippet." },
    "jwt-decoder": { name: "JWT Decoder", how: "Paste encoded JWT.", why: "Secure inspection." },
    "base64": { name: "Base64 Tool", how: "Encode or decode strings.", why: "Handy for auth headers." },
    "sql-format": { name: "SQL Formatter", how: "Paste messy SQL.", why: "Improves readability." },
    "bpm-ms": { name: "BPM to MS", how: "Enter BPM.", why: "Precision for audio pros." }
  };

  const menuItems = Object.keys(toolData);

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      
      {/* SIDEBAR - Desktop */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-neutral-800"><h1 className="text-xl font-bold text-white">Converter<span className="text-emerald-500">Lab</span></h1></div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(id => (
            <button key={id} onClick={() => {setActiveTab(id); setInput(""); setOutput("");}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{toolData[id].name}</button>
          ))}
        </nav>
      </aside>

      {/* MOBILE HEADER & MENU */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 md:px-12 bg-neutral-900/30">
          <h1 className="text-lg font-bold text-white md:hidden">Converter<span className="text-emerald-500">Lab</span></h1>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-neutral-400 hover:text-white">
            {isMenuOpen ? "✕ Close" : "☰ Menu"}
          </button>
          <div className="hidden md:block text-[10px] text-neutral-700 tracking-widest uppercase italic">In the heart of analog, on the trace of the needle</div>
        </header>

        {/* MOBILE MENU OVERLAY */}
        {isMenuOpen && (
          <div className="md:hidden bg-neutral-900 border-b border-neutral-800 p-4 space-y-2">
            {menuItems.map(id => (
              <button key={id} onClick={() => {setActiveTab(id); setInput(""); setOutput(""); setIsMenuOpen(false);}} className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg">{toolData[id].name}</button>
            ))}
          </div>
        )}

        <div className="p-4 md:p-12 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{toolData[activeTab].name}</h2>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
              {activeTab === "bpm-ms" ? (
                <div className="space-y-6">
                  <input type="number" value={bpm} onChange={(e) => calculateBpm(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500" />
                  <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-base md:text-lg">{output || "Enter BPM to calculate..."}</pre>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input..." />
                    <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Output..." />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => handleConvert(activeTab === "base64" ? "encode" : "default")} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">Process</button>
                    {activeTab === "base64" && <button onClick={() => handleConvert("decode")} className="px-8 py-3 border border-emerald-600 text-emerald-500 rounded-xl">Decode</button>}
                    {output && <button onClick={() => navigator.clipboard.writeText(output)} className="ml-auto text-xs text-neutral-500 hover:text-white underline">Copy Result</button>}
                  </div>
                </>
              )}
            </div>

            {/* SEO & GUIDES */}
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
                <h3 className="text-emerald-500 font-bold mb-2 uppercase text-xs tracking-widest">How to use</h3>
                <p className="text-neutral-400 leading-relaxed">{toolData[activeTab].how}</p>
              </div>
              <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
                <h3 className="text-emerald-500 font-bold mb-2 uppercase text-xs tracking-widest">Why it matters</h3>
                <p className="text-neutral-400 leading-relaxed">{toolData[activeTab].why}</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 px-6 md:px-12 gap-4">
          <div>© 2026 ConverterLab.io - Precision Tools</div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-emerald-500 transition-colors">Terms</a>
            <a href="mailto:hello@converterlab.io" className="hover:text-emerald-500 transition-colors">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}