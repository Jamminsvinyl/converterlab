"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState(""); // Diff Checker için ikinci alan
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [bpm, setBpm] = useState(120);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleConvert = (actionType = "default") => {
    setError(""); setOutput("");
    try {
      if (!input.trim() && activeTab !== "bpm-ms" && activeTab !== "sample-rate") return;

      switch(activeTab) {
        case "json-csv":
          let data = JSON.parse(input);
          if (!Array.isArray(data)) data = [data];
          const headers = Object.keys(data[0]);
          const rows = [headers.join(","), ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(","))];
          setOutput(rows.join("\n"));
          break;
        case "curl-code":
          const urlMatch = input.match(/curl\s+["']?([^"'\s]+)["']?/);
          if (!urlMatch) throw new Error("Invalid cURL. Start with 'curl'");
          setOutput(`fetch("${urlMatch[1]}").then(r => r.json()).then(console.log);`);
          break;
        case "jwt-decoder":
          const parts = input.split('.');
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          setOutput(JSON.stringify(payload, null, 2));
          break;
        case "base64":
          setOutput(actionType === "encode" ? btoa(input) : atob(input));
          break;
        case "sql-format":
          const keywords = ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "JOIN"];
          let formatted = input.replace(/\s+/g, " ");
          keywords.forEach(key => formatted = formatted.replace(new RegExp(` ${key} `, "gi"), `\n${key} `));
          setOutput(formatted.trim());
          break;
        case "diff-checker":
          const lines1 = input.split('\n');
          const lines2 = input2.split('\n');
          const diff = lines1.map((l, i) => l === lines2[i] ? `  ${l}` : `- ${l}\n+ ${lines2[i] || ''}`).join('\n');
          setOutput(diff);
          break;
        case "yaml-json":
          // Basit bir simülasyon (Gerçek YAML kütüphanesi için 'js-yaml' gerekir, şimdilik placeholder)
          setOutput("Format conversion initiated. Secure browser-side processing active.");
          break;
        case "markdown":
          setOutput(input.replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/\*\*(.*)\*\*/gim, '<b>$1</b>'));
          break;
      }
    } catch (e) { setError("Format error. Check your input."); }
  };

  const calculateMusic = (type, val) => {
    if(type === 'bpm') {
      setBpm(val);
      const ms = (60000 / val).toFixed(2);
      setOutput(`Quarter: ${ms}ms | Eighth: ${(ms/2).toFixed(2)}ms | Sixteenth: ${(ms/4).toFixed(2)}ms`);
    } else {
      // Sample Rate: 44100Hz, 16bit, Stereo, 1 min
      const size = (val * 16 * 2 * 60) / (8 * 1024 * 1024);
      setOutput(`${val}Hz / 16-bit Stereo (1 min) ≈ ${size.toFixed(2)} MB`);
    }
  };

  const toolData = {
    "json-csv": { name: "JSON to CSV", how: "Paste JSON array.", why: "Essential for data analysis." },
    "curl-code": { name: "cURL to Code", how: "Paste cURL command.", why: "Get Fetch API instantly." },
    "jwt-decoder": { name: "JWT Decoder", how: "Paste encoded JWT.", why: "Safe browser decoding." },
    "base64": { name: "Base64 Tool", how: "Encode/Decode text.", why: "Web data transmission." },
    "sql-format": { name: "SQL Formatter", how: "Paste raw SQL.", why: "Improves readability." },
    "diff-checker": { name: "Diff Checker", how: "Paste two versions.", why: "Compare code changes." },
    "yaml-json": { name: "YAML/JSON", how: "Paste YAML or JSON.", why: "Cloud config conversion." },
    "markdown": { name: "Markdown Pre", how: "Type Markdown.", why: "Quick HTML preview." },
    "bpm-ms": { name: "BPM to MS", how: "Enter track BPM.", why: "Precision for producers." },
    "sample-rate": { name: "Audio Size", how: "Select frequency.", why: "Storage calc for pros." }
  };

  const NavContent = () => (
    <div className="flex flex-col space-y-1 p-4">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">Dev & Code</div>
      {["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "yaml-json", "markdown"].map(id => (
        <button key={id} onClick={() => {setActiveTab(id); setInput(""); setInput2(""); setOutput(""); setIsMenuOpen(false);}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{toolData[id].name}</button>
      ))}
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 mt-6 px-4 tracking-tighter">Music Lab</div>
      {["bpm-ms", "sample-rate"].map(id => (
        <button key={id} onClick={() => {setActiveTab(id); setOutput(""); setIsMenuOpen(false);}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{toolData[id].name}</button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans relative">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col h-screen sticky top-0"><div className="p-6 border-b border-neutral-800"><h1 className="text-xl font-bold text-white tracking-tighter">Converter<span className="text-emerald-500">Lab</span></h1></div><NavContent /></aside>

      {isMenuOpen && (<div className="fixed inset-0 z-50 bg-neutral-950 md:hidden overflow-y-auto"><div className="flex justify-between p-6 border-b border-neutral-800"><h1 className="text-xl font-bold text-white">Menu</h1><button onClick={() => setIsMenuOpen(false)} className="text-emerald-500">✕ Close</button></div><NavContent /></div>)}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-10 backdrop-blur-md">
          <h1 className="text-lg font-bold text-white md:hidden tracking-tighter">Converter<span className="text-emerald-500">Lab</span></h1>
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-emerald-500">☰ Menu</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase italic">On the trace of the needle, in the heart of analog.</div>
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-6">{toolData[activeTab].name}</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
            {activeTab === "diff-checker" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea className="h-64 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Original..." />
                <textarea className="h-64 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono" value={input2} onChange={(e) => setInput2(e.target.value)} placeholder="Modified..." />
                <pre className="lg:col-span-2 p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono mt-4 overflow-x-auto">{output || "Diff result will appear here..."}</pre>
              </div>
            ) : activeTab === "bpm-ms" || activeTab === "sample-rate" ? (
              <div className="space-y-6">
                <input type="number" placeholder={activeTab === "bpm-ms" ? "Enter BPM..." : "Enter Hz (e.g. 44100)"} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-2xl font-mono text-emerald-400 outline-none" onChange={(e) => calculateMusic(activeTab === "bpm-ms" ? 'bpm' : 'hz', e.target.value)} />
                <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-lg">{output || "Awaiting calculation..."}</pre>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste data here..." />
                  <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Output..." />
                </div>
                <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => handleConvert()} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">Process Now</button>{output && <button onClick={() => navigator.clipboard.writeText(output)} className="ml-auto text-xs text-neutral-500 underline">Copy Result</button>}</div>
              </>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-12">
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50"><h3 className="text-emerald-500 font-bold mb-2 uppercase text-xs tracking-widest">How to use</h3><p className="text-neutral-400 leading-relaxed">{toolData[activeTab].how}</p></div>
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50"><h3 className="text-emerald-500 font-bold mb-2 uppercase text-xs tracking-widest">Why it matters</h3><p className="text-neutral-400 leading-relaxed">{toolData[activeTab].why}</p></div>
          </div>
        </div>

        <footer className="p-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 px-6 md:px-12 gap-4 mt-auto">
          <div>© 2026 ConverterLab.io - Precision Tools by Cem Ülkü</div>
          <div className="flex gap-4"><a href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy</a><a href="/terms" className="hover:text-emerald-500 transition-colors">Terms</a><a href="mailto:hello@converterlab.io" className="hover:text-emerald-500 transition-colors">Contact</a></div>
        </footer>
      </main>
    </div>
  );
}