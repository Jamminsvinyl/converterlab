"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState(""); // Oda yüksekliği için
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const calculateLogic = (type, val) => {
    const v = parseFloat(val);
    if (!v && v !== 0 && type !== 'acoustic') return;

    switch(type) {
      case 'bpm':
        const ms = (60000 / v).toFixed(2);
        setOutput(`1/4: ${ms}ms | 1/8: ${(ms/2).toFixed(2)}ms | 1/16: ${(ms/4).toFixed(2)}ms`);
        break;
      case 'freq':
        const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const h = 12 * (Math.log2(v / 440)) + 69;
        setOutput(`Note: ${notes[Math.round(h) % 12]}${Math.floor(Math.round(h) / 12) - 1}`);
        break;
      case 'acoustic':
        const w = parseFloat(input), l = parseFloat(input2), h_val = parseFloat(input3);
        if(!w || !l || !h_val) return;
        const surfaceArea = 2 * (w * l + l * h_val + w * h_val);
        const abs = (surfaceArea * 0.18).toFixed(1);
        const diff = (surfaceArea * 0.07).toFixed(1);
        setOutput(`Total Surface: ${surfaceArea.toFixed(1)} m²\n\n- Absorption: ${abs} m² (Sidewalls/Ceiling)\n- Diffusion: ${diff} m² (Back Wall)\n- Bass Traps: 4-8 Corners (Full Height)\n- Mirror Points: 60cm x 120cm Panels (Min 4 units)`);
        break;
      case 'deg':
        setOutput(`Radians: ${(v * (Math.PI / 180)).toFixed(6)} rad`);
        break;
      case 'aspect':
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const width = parseInt(input), height = parseInt(val);
        const common = gcd(width, height);
        setOutput(`Ratio: ${width/common}:${height/common}`);
        break;
      case 'hex':
        const r = parseInt(input.slice(1,3), 16) / 255;
        const g = parseInt(input.slice(3,5), 16) / 255;
        const b = parseInt(input.slice(5,7), 16) / 255;
        setOutput(`Normalized: ${r.toFixed(3)}f, ${g.toFixed(3)}f, ${b.toFixed(3)}f`);
        break;
    }
  };

  const toolData = {
    "json-csv": { name: "JSON to CSV", how: "Paste JSON.", why: "Data tasks." },
    "curl-code": { name: "cURL to Code", how: "cURL to Fetch.", why: "API testing." },
    "jwt-decoder": { name: "JWT Decoder", how: "Decode tokens.", why: "Privacy." },
    "base64": { name: "Base64 Tool", how: "Encode/Decode.", why: "Data safety." },
    "sql-format": { name: "SQL Formatter", how: "Beautify SQL.", why: "Readability." },
    "diff-checker": { name: "Diff Checker", how: "Compare texts.", why: "Version control." },
    "markdown": { name: "Markdown Pre", how: "MD to HTML.", why: "Docs." },
    "bpm-ms": { name: "BPM/Delay Calc", how: "BPM to MS.", why: "Effect timing." },
    "freq-note": { name: "Freq to Note", how: "Hz to Music Note.", why: "Sound tuning." },
    "pitch-shift": { name: "Pitch vs Time", how: "Speed change calc.", why: "Sampling." },
    "acoustic-calc": { name: "Room Treatment", how: "Enter Room Dim (m).", why: "Studio acoustics." },
    "deg-rad": { name: "Degrees to Rad", how: "Deg to Radians.", why: "Game physics." },
    "hex-norm": { name: "Color Normalizer", how: "Hex to 0.0-1.0.", why: "Shaders." },
    "aspect-ratio": { name: "Aspect Ratio", how: "W & H ratio.", why: "UI design." }
  };

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">{title}</div>
      {items.map(id => (
        <button key={id} onClick={() => {setActiveTab(id); setInput(""); setInput2(""); setInput3(""); setOutput(""); setIsMenuOpen(false);}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{toolData[id].name}</button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans relative">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col h-screen sticky top-0 px-4">
        <div className="py-8 px-4 border-b border-neutral-800 mb-4"><h1 className="text-xl font-bold text-white tracking-tighter">Converter<span className="text-emerald-500">Lab</span></h1></div>
        <div className="flex-1 overflow-y-auto pb-8">
          <NavGroup title="Dev Utilities" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Lab" items={["bpm-ms", "freq-note", "pitch-shift", "acoustic-calc"]} />
          <NavGroup title="Game Dev Lab" items={["deg-rad", "hex-norm", "aspect-ratio"]} />
        </div>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 md:hidden overflow-y-auto p-6 flex flex-col items-center">
          <button onClick={() => setIsMenuOpen(false)} className="text-emerald-500 mb-8 font-bold border border-emerald-500/20 px-6 py-2 rounded-full">✕ CLOSE MENU</button>
          <NavGroup title="Dev Tools" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Lab" items={["bpm-ms", "freq-note", "pitch-shift", "acoustic-calc"]} />
          <NavGroup title="Game Dev" items={["deg-rad", "hex-norm", "aspect-ratio"]} />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-10 backdrop-blur-md">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold text-xs border border-emerald-500/20 px-3 py-1 rounded">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase tracking-widest italic">Analog heart, digital precision.</div>
          <h1 className="md:hidden font-bold text-white tracking-tighter">ConverterLab</h1>
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">{toolData[activeTab].name}</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
            {["bpm-ms", "freq-note", "pitch-shift", "deg-rad", "hex-norm", "aspect-ratio", "acoustic-calc"].includes(activeTab) ? (
              <div className="space-y-4">
                {activeTab === "acoustic-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="number" placeholder="Width (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="Length (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="Height (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : (
                  <>
                    {(activeTab === "aspect-ratio" || activeTab === "hex-norm") && <input type="text" placeholder={activeTab === "hex-norm" ? "#FFFFFF" : "Width..."} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none mb-2" onChange={(e) => setInput(e.target.value)} />}
                    <input type="number" step="any" placeholder="Enter value..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-3xl font-mono text-emerald-400 outline-none" onChange={(e) => calculateLogic(activeTab.split('-')[0], e.target.value)} />
                  </>
                )}
                <div className="mt-4"><button onClick={() => activeTab === "acoustic-calc" ? calculateLogic('acoustic', '0') : null} className={`px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all ${activeTab !== 'acoustic-calc' && 'hidden'}`}>Calculate Treatment</button></div>
                <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-lg whitespace-pre-wrap">{output || "Awaiting dimensions..."}</pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste content here..." />
                <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Result..." />
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-12">
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50"><h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">How to use</h3><p className="text-neutral-400 italic">{toolData[activeTab].how}</p></div>
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50"><h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Why it matters</h3><p className="text-neutral-400 italic">{toolData[activeTab].why}</p></div>
          </div>
        </div>
        <footer className="p-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 px-6 md:px-12 gap-4 mt-auto">
          <div>© 2026 ConverterLab.io - Professional Suite</div>
          <div className="flex gap-4"><a href="/privacy" className="hover:text-emerald-500">Privacy</a><a href="/terms" className="hover:text-emerald-500">Terms</a><a href="mailto:hello@converterlab.io" className="hover:text-emerald-500">Contact</a></div>
        </footer>
      </main>
    </div>
  );
}