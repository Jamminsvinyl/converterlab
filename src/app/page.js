"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [output, setOutput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const calculateLogic = (type, val) => {
    const v = parseFloat(val);
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    
    switch(type) {
      case 'circle': // Circle of Fifths & Relatives
        const idx = keys.indexOf(input.toUpperCase());
        if(idx === -1) return;
        const perfect4th = keys[(idx + 5) % 12];
        const perfect5th = keys[(idx + 7) % 12];
        const relativeMinor = keys[(idx + 9) % 12];
        setOutput(`Key: ${input.toUpperCase()} Major\n- Perfect 4th: ${perfect4th}\n- Perfect 5th: ${perfect5th}\n- Relative Minor: ${relativeMinor}m\n- Compatible for mixing: ${perfect4th}, ${perfect5th}, ${relativeMinor}m`);
        break;
      case 'harmonics': // Upper Harmonics Calculator
        if(!v) return;
        let hList = `Fundamental: ${v} Hz\n`;
        for(let i=2; i<=8; i++) {
          hList += `${i}. Harmonic: ${(v * i).toFixed(1)} Hz (${i === 2 || i === 4 || i === 8 ? 'Octave' : 'Overtone'})\n`;
        }
        setOutput(hList + "\n*Harmonics are the secret to analog warmth.");
        break;
      case 'acoustic':
        const w = parseFloat(input), l = parseFloat(input2), h_val = parseFloat(input3);
        const surfaceArea = 2 * (w * l + l * h_val + w * h_val);
        setOutput(`Total: ${surfaceArea.toFixed(1)} m²\n- Absorption: ${(surfaceArea * 0.18).toFixed(1)} m²\n- Diffusion: ${(surfaceArea * 0.07).toFixed(1)} m²\n- Corners: 4-8 Bass Traps`);
        break;
      case 'bpm':
        const ms = (60000 / v).toFixed(2);
        setOutput(`1/4: ${ms}ms | 1/8: ${(ms/2).toFixed(2)}ms | 1/16: ${(ms/4).toFixed(2)}ms`);
        break;
      case 'freq':
        const h = 12 * (Math.log2(v / 440)) + 69;
        setOutput(`Note: ${keys[Math.round(h) % 12]}${Math.floor(Math.round(h) / 12) - 1}`);
        break;
      default:
        // Diğer matematiksel dönüşümler buraya gelecek
        break;
    }
  };

  const toolData = {
    "json-csv": { name: "JSON to CSV", how: "Paste JSON array.", why: "Data tasks." },
    "curl-code": { name: "cURL to Code", how: "cURL to Fetch API.", why: "API testing." },
    "jwt-decoder": { name: "JWT Decoder", how: "Decode tokens locally.", why: "Privacy." },
    "base64": { name: "Base64 Tool", how: "Encode/Decode text.", why: "Security." },
    "sql-format": { name: "SQL Formatter", how: "Beautify queries.", why: "Clarity." },
    "diff-checker": { name: "Diff Checker", how: "Compare texts.", why: "Versions." },
    "markdown": { name: "Markdown Pre", how: "MD to HTML preview.", why: "Docs." },
    "bpm-ms": { name: "BPM/Delay Calc", how: "BPM to timing.", why: "Mixing." },
    "circle-fifths": { name: "Circle of Fifths", how: "Enter Key (e.g. C).", why: "Harmony." },
    "harmonics-calc": { name: "Upper Harmonics", how: "Enter Freq (Hz).", why: "Analog Warmth." },
    "freq-note": { name: "Freq to Note", how: "Hz to Note.", why: "Tuning." },
    "pitch-shift": { name: "Pitch vs Time", how: "Semitone ratio.", why: "Sampling." },
    "acoustic-calc": { name: "Room Treatment", how: "Enter Room Dim.", why: "Studio." },
    "deg-rad": { name: "Degrees to Rad", how: "Angle to Rad.", why: "Game Dev." },
    "hex-norm": { name: "Color Norm", how: "Hex to 0-1.", why: "Shaders." },
    "aspect-ratio": { name: "Aspect Ratio", how: "W & H ratio.", why: "UI Design." }
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
        <div className="py-8 px-4 border-b border-neutral-800 mb-4"><h1 className="text-xl font-bold text-white tracking-tighter italic">Converter<span className="text-emerald-500">Lab</span></h1></div>
        <div className="flex-1 overflow-y-auto pb-8">
          <NavGroup title="Dev Utilities" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Theory & Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "pitch-shift", "acoustic-calc"]} />
          <NavGroup title="Game Dev Lab" items={["deg-rad", "hex-norm", "aspect-ratio"]} />
        </div>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 md:hidden overflow-y-auto p-6 flex flex-col items-center">
          <button onClick={() => setIsMenuOpen(false)} className="text-emerald-500 mb-8 font-bold border border-emerald-500/20 px-6 py-2 rounded-full tracking-widest">✕ CLOSE</button>
          <NavGroup title="Dev Tools" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "pitch-shift", "acoustic-calc"]} />
          <NavGroup title="Game Dev" items={["deg-rad", "hex-norm", "aspect-ratio"]} />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-10 backdrop-blur-md">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold text-[10px] border border-emerald-500/20 px-3 py-1 rounded tracking-widest">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase tracking-widest italic">Analog heart, digital precision.</div>
          <h1 className="md:hidden font-bold text-white tracking-tighter">ConverterLab</h1>
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">{toolData[activeTab].name}</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
            {["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "pitch-shift", "deg-rad", "hex-norm", "aspect-ratio", "acoustic-calc"].includes(activeTab) ? (
              <div className="space-y-4">
                {activeTab === "circle-fifths" ? (
                  <input type="text" placeholder="Key (e.g. C, G#, Eb)..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-2xl font-mono text-emerald-400 outline-none" onChange={(e) => {setInput(e.target.value); calculateLogic('circle', '0');}} />
                ) : activeTab === "acoustic-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="W (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="L (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="H (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : (
                  <input type="number" step="any" placeholder="Enter value..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-3xl font-mono text-emerald-400 outline-none" onChange={(e) => calculateLogic(activeTab.split('-')[0], e.target.value)} />
                )}
                
                {activeTab === "acoustic-calc" && <button onClick={() => calculateLogic('acoustic', '0')} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all">Calculate</button>}
                
                <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-lg whitespace-pre-wrap">{output || "Waiting for data..."}</pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste content..." />
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
          <div>© 2026 ConverterLab.io - Theoretical Precision</div>
          <div className="flex gap-4"><a href="/privacy" className="hover:text-emerald-500">Privacy</a><a href="/terms" className="hover:text-emerald-500">Terms</a><a href="mailto:hello@converterlab.io" className="hover:text-emerald-500">Contact</a></div>
        </footer>
      </main>
    </div>
  );
}