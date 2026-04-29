"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [bpm, setBpm] = useState(120);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleConvert = (actionType = "default") => {
    setError(""); setOutput("");
    try {
      if (!input.trim() && !["bpm-ms", "sample-rate", "freq-note", "pitch-shift"].includes(activeTab)) return;

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
          setOutput(`fetch("${urlMatch ? urlMatch[1] : 'url'}").then(r => r.json()).then(console.log);`);
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
          const l1 = input.split('\n'), l2 = input2.split('\n');
          setOutput(l1.map((l, i) => l === l2[i] ? `  ${l}` : `- ${l}\n+ ${l2[i] || ''}`).join('\n'));
          break;
        case "markdown":
          setOutput(input.replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*)\*\*/gim, '<b>$1</b>'));
          break;
      }
    } catch (e) { setError("Analysis failed. Check input format."); }
  };

  const calculateMusic = (type, val) => {
    const v = parseFloat(val);
    if (!v) return;
    switch(type) {
      case 'bpm':
        const ms = (60000 / v).toFixed(2);
        setOutput(`1/4: ${ms}ms | 1/8: ${(ms/2).toFixed(2)}ms | 1/16: ${(ms/4).toFixed(2)}ms\nPre-Delay: ${(ms/32).toFixed(2)}ms`);
        break;
      case 'freq':
        const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const h = 12 * (Math.log2(v / 440)) + 69;
        const note = notes[Math.round(h) % 12];
        const octave = Math.floor(Math.round(h) / 12) - 1;
        setOutput(`Note: ${note}${octave} | MIDI: ${Math.round(h)}`);
        break;
      case 'pitch':
        const shift = Math.pow(2, v / 12);
        setOutput(`Frequency Multiplier: ${shift.toFixed(4)}x\nLength Change: ${(100/shift).toFixed(2)}%`);
        break;
      case 'sample':
        const size = (v * 16 * 2 * 60) / (8 * 1024 * 1024);
        setOutput(`${v}Hz 16-bit Stereo (1 min) ≈ ${size.toFixed(2)} MB`);
        break;
    }
  };

  const toolData = {
    "json-csv": { name: "JSON to CSV", how: "Convert JSON arrays to CSV.", why: "Data integration." },
    "curl-code": { name: "cURL to Code", how: "Turn cURL into Fetch API.", why: "Frontend speed." },
    "jwt-decoder": { name: "JWT Decoder", how: "Decode tokens locally.", why: "Privacy focus." },
    "base64": { name: "Base64 Tool", how: "Encode/Decode strings.", why: "Safe transmission." },
    "sql-format": { name: "SQL Formatter", how: "Beautify SQL queries.", why: "Code clarity." },
    "diff-checker": { name: "Diff Checker", how: "Compare two text blocks.", why: "Version control." },
    "markdown": { name: "Markdown Preview", how: "Preview MD to HTML.", why: "Docs writing." },
    "bpm-ms": { name: "BPM/Delay Calc", how: "BPM to milliseconds.", why: "Effect timing." },
    "freq-note": { name: "Freq to Note", how: "Hz to Musical Note.", why: "Sound tuning." },
    "pitch-shift": { name: "Pitch vs Time", how: "Semitone to speed ratio.", why: "Sampling & Vinyl." },
    "sample-rate": { name: "Audio Size", how: "Calc digital audio weight.", why: "Storage planning." }
  };

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">{title}</div>
      {items.map(id => (
        <button key={id} onClick={() => {setActiveTab(id); setInput(""); setOutput(""); setIsMenuOpen(false);}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{toolData[id].name}</button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans relative">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-neutral-800"><h1 className="text-xl font-bold text-white">Converter<span className="text-emerald-500">Lab</span></h1></div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavGroup title="Developer Utilities" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music & Audio Lab" items={["bpm-ms", "freq-note", "pitch-shift", "sample-rate"]} />
        </div>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 md:hidden overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
            <h1 className="text-xl font-bold text-white">Tools Menu</h1>
            <button onClick={() => setIsMenuOpen(false)} className="text-emerald-500 text-xl">✕</button>
          </div>
          <NavGroup title="Dev Tools" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Lab" items={["bpm-ms", "freq-note", "pitch-shift", "sample-rate"]} />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-10 backdrop-blur-md">
          <h1 className="text-lg font-bold text-white md:hidden">Converter<span className="text-emerald-500">Lab</span></h1>
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold border border-emerald-500/20 px-3 py-1 rounded">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase italic">In the heart of analog, on the trace of the needle.</div>
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-6">{toolData[activeTab].name}</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
            {["bpm-ms", "freq-note", "pitch-shift", "sample-rate"].includes(activeTab) ? (
              <div className="space-y-6">
                <input type="number" step="any" placeholder="Enter value..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => calculateMusic(activeTab.split('-')[0], e.target.value)} />
                <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-lg whitespace-pre-wrap">{output || "Waiting for input..."}</pre>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder={activeTab === "diff-checker" ? "Original text..." : "Input..."} />
                  {activeTab === "diff-checker" ? (
                    <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" value={input2} onChange={(e) => setInput2(e.target.value)} placeholder="Modified text..." />
                  ) : (
                    <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Output..." />
                  )}
                </div>
                {activeTab === "diff-checker" && <pre className="w-full p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono mt-4 overflow-x-auto text-xs">{output}</pre>}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => handleConvert(activeTab === "base64" ? "encode" : "default")} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all">PROCESS</button>
                  {activeTab === "base64" && <button onClick={() => handleConvert("decode")} className="px-8 py-3 border border-emerald-600 text-emerald-500 rounded-xl">DECODE</button>}
                </div>
              </>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-12">
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">How to use</h3>
              <p className="text-neutral-400 leading-relaxed italic">{toolData[activeTab].how}</p>
            </div>
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Why it matters</h3>
              <p className="text-neutral-400 leading-relaxed italic">{toolData[activeTab].why}</p>
            </div>
          </div>
        </div>

        <footer className="p-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 px-6 md:px-12 gap-4 mt-auto bg-neutral-900/20">
          <div>© 2026 ConverterLab.io - Built for Precision</div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-emerald-500">Privacy Policy</a>
            <a href="/terms" className="hover:text-emerald-500">Terms of Service</a>
            <a href="mailto:hello@converterlab.io" className="hover:text-emerald-500 transition-colors">Contact</a>
          </div>
        </footer>
      </main>
    </div>
  );
}