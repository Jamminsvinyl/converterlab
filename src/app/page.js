"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    setCsvOutput("");
    if (!jsonInput.trim()) {
      setError("Please enter JSON data to convert.");
      return;
    }
    try {
      let parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) parsedData = [parsedData];
      const headers = Object.keys(parsedData[0]);
      const csvRows = [headers.join(",")];
      for (const row of parsedData) {
        const values = headers.map(header => {
          const val = row[header] !== null && row[header] !== undefined ? row[header] : "";
          const escapedVal = String(val).replace(/"/g, '""');
          return `"${escapedVal}"`;
        });
        csvRows.push(values.join(","));
      }
      setCsvOutput(csvRows.join("\n"));
    } catch (err) {
      setError("Invalid JSON format. Check your syntax.");
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Converter<span className="text-emerald-500">Lab</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <button 
            onClick={() => setActiveTab("json-csv")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'json-csv' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-neutral-800 text-neutral-400'}`}
          >
            JSON to CSV
          </button>
          <div className="px-4 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-widest mt-4">Coming Soon</div>
          <button disabled className="w-full text-left px-4 py-2 text-neutral-600 cursor-not-allowed">cURL to Code</button>
          <button disabled className="w-full text-left px-4 py-2 text-neutral-600 cursor-not-allowed">JWT Decoder</button>
          <button disabled className="w-full text-left px-4 py-2 text-neutral-600 cursor-not-allowed">BPM to Milliseconds</button>
          <button disabled className="w-full text-left px-4 py-2 text-neutral-600 cursor-not-allowed">Base64 Image</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-neutral-800 flex items-center px-8 md:hidden">
           <h1 className="text-lg font-bold text-white">Converter<span className="text-emerald-500">Lab</span></h1>
        </header>

        <div className="p-8 flex-1">
          <div className="max-w-5xl mx-auto">
            {activeTab === "json-csv" && (
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">JSON to CSV Converter</h2>
                  <p className="text-neutral-400">Instantly transform your JSON arrays into clean CSV files.</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
                  {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm">{error}</div>}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <textarea 
                      className="h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono text-neutral-300 focus:outline-none focus:border-emerald-500"
                      placeholder="Paste your JSON here..."
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                    />
                    <textarea 
                      className="h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono text-emerald-400 focus:outline-none"
                      placeholder="CSV Output will appear here..."
                      value={csvOutput}
                      readOnly
                    />
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button onClick={handleConvert} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all active:scale-95">Convert</button>
                    {csvOutput && <button onClick={() => navigator.clipboard.writeText(csvOutput)} className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700">Copy Result</button>}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* FOOTER (AdSense Ready) */}
        <footer className="border-t border-neutral-800 p-8 bg-neutral-900/30">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <div>© 2026 ConverterLab.io - All utilities in one place.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-emerald-500 transition">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-500 transition">Terms of Service</a>
              <a href="#" className="hover:text-emerald-500 transition">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}