"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    setOutput("");
    if (!input.trim()) return;

    if (activeTab === "json-csv") {
      try {
        let data = JSON.parse(input);
        if (!Array.isArray(data)) data = [data];
        const headers = Object.keys(data[0]);
        const rows = [headers.join(","), ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(","))];
        setOutput(rows.join("\n"));
      } catch (e) { setError("Invalid JSON format."); }
    } 
    
    else if (activeTab === "curl-code") {
      try {
        // Basit bir cURL parser mantığı
        const urlMatch = input.match(/curl\s+["']?([^"'\s]+)["']?/);
        if (!urlMatch) throw new Error("Invalid cURL command.");
        
        const methodMatch = input.match(/-X\s+(\w+)/) || input.match(/--request\s+(\w+)/);
        const method = methodMatch ? methodMatch[1] : (input.includes("--data") ? "POST" : "GET");
        
        const jsCode = `fetch("${urlMatch[1]}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json"
  }
}).then(res => res.json())
  .then(data => console.log(data));`;
        
        setOutput(jsCode);
      } catch (e) { setError("Check your cURL syntax."); }
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold text-white tracking-tight">Converter<span className="text-emerald-500">Lab</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <button onClick={() => { setActiveTab("json-csv"); setInput(""); setOutput(""); }} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'json-csv' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-neutral-800'}`}>JSON to CSV</button>
          <button onClick={() => { setActiveTab("curl-code"); setInput(""); setOutput(""); }} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'curl-code' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-neutral-800'}`}>cURL to Code</button>
          <div className="px-4 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-widest mt-4 italic">BPM/MIDI Coming Soon</div>
        </nav>
        
        {/* ADSENSE PLACEHOLDER: SIDEBAR */}
        <div className="m-4 p-4 h-64 bg-neutral-800/20 border border-dashed border-neutral-700 rounded-lg flex items-center justify-center text-xs text-neutral-600">
          AdSpace - Sidebar
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {/* ADSENSE PLACEHOLDER: TOP BANNER */}
        <div className="w-full h-20 bg-neutral-900 border-b border-neutral-800 flex items-center justify-center text-xs text-neutral-600">
          AdSpace - Leaderboard
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">{activeTab === 'json-csv' ? 'JSON to CSV' : 'cURL to JavaScript'}</h2>
            <p className="text-neutral-400 mb-8">{activeTab === 'json-csv' ? 'Perfect for spreadsheets.' : 'Convert cURL commands to Fetch API instantly.'}</p>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl">
              {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Input</label>
                  <textarea className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono focus:border-emerald-500 outline-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder={activeTab === 'json-csv' ? 'Paste JSON array...' : 'Paste cURL command (curl https://api...)'} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Output</label>
                  <textarea className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly />
                </div>
              </div>

              {/* ADSENSE PLACEHOLDER: ABOVE BUTTON */}
              <div className="my-4 h-12 bg-neutral-800/10 border border-dashed border-neutral-800 rounded flex items-center justify-center text-[10px] text-neutral-700">
                In-Feed Ad Placeholder
              </div>

              <div className="mt-2 flex gap-4">
                <button onClick={handleConvert} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all active:scale-95">Convert Now</button>
                {output && <button onClick={() => navigator.clipboard.writeText(output)} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg">Copy to Clipboard</button>}
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-neutral-800 p-6 text-sm text-neutral-600 flex justify-between px-12 bg-black/20">
          <div>© 2026 ConverterLab.io</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-500">Privacy</a>
            <a href="#" className="hover:text-emerald-500">Terms</a>
          </div>
        </footer>
      </main>
    </div>
  );
}