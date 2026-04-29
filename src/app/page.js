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
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const inputVal = val || input;
    
    switch(type) {
      case 'stats':
        const nums = inputVal.split(/[, \s\n]+/).map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
        if(nums.length === 0) return;
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const median = nums.length % 2 === 0 ? (nums[nums.length/2 - 1] + nums[nums.length/2]) / 2 : nums[Math.floor(nums.length/2)];
        const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
        const stdDev = Math.sqrt(variance);
        setOutput(`Count: ${nums.length} items\nMean (Avg): ${mean.toFixed(2)}\nMedian (Middle): ${median}\nMin/Max: ${nums[0]} / ${nums[nums.length-1]}\nStd Deviation: ${stdDev.toFixed(2)}`);
        break;
      case 'circle':
        const idx = keys.indexOf(input.toUpperCase());
        if(idx === -1) return;
        setOutput(`Key: ${input.toUpperCase()} Major\n- Perfect 4th: ${keys[(idx + 5) % 12]}\n- Perfect 5th: ${keys[(idx + 7) % 12]}\n- Rel. Minor: ${keys[(idx + 9) % 12]}m`);
        break;
      case 'harmonics':
        const v = parseFloat(inputVal);
        if(!v) return;
        let hList = `Fundamental: ${v} Hz\n`;
        for(let i=2; i<=5; i++) hList += `${i}. Harmonic: ${(v * i).toFixed(1)} Hz\n`;
        setOutput(hList);
        break;
      case 'acoustic':
        const w = parseFloat(input), l = parseFloat(input2), h_v = parseFloat(input3);
        const s = 2 * (w * l + l * h_v + w * h_v);
        setOutput(`Surface: ${s.toFixed(1)} m²\n- Absorp: ${(s * 0.18).toFixed(1)} m²\n- Diffus: ${(s * 0.07).toFixed(1)} m²`);
        break;
      case 'bpm':
        const ms = (60000 / parseFloat(inputVal)).toFixed(2);
        setOutput(`1/4: ${ms}ms | 1/8: ${(ms/2).toFixed(2)}ms`);
        break;
      default: break;
    }
  };

  const toolData = {
    "json-csv": { name: "JSON to CSV", how: "Paste JSON array.", why: "Data integration." },
    "curl-code": { name: "cURL to Code", how: "cURL to Fetch API.", why: "API testing." },
    "jwt-decoder": { name: "JWT Decoder", how: "Paste encoded JWT.", why: "Privacy focus." },
    "base64": { name: "Base64 Tool", how: "Encode/Decode text.", why: "Security." },
    "sql-format": { name: "SQL Formatter", how: "Beautify queries.", why: "Clarity." },
    "diff-checker": { name: "Diff Checker", how: "Compare two texts.", why: "Versions." },
    "markdown": { name: "Markdown Pre", how: "MD to HTML preview.", why: "Documentation." },
    "stats-calc": { 
        name: "Basic Statistics", 
        how: "Paste numbers separated by commas, spaces, or lines. (e.g., 10, 20.5, 30)", 
        why: "Mean (Avg) shows the overall level, Median shows the true middle (ignoring extremes), and Std Dev shows how much your data varies/spreads." 
    },
    "circle-fifths": { name: "Circle of Fifths", how: "Enter Key (e.g., C).", why: "Harmony & Mixing." },
    "harmonics-calc": { name: "Upper Harmonics", how: "Enter Freq (Hz).", why: "Analog Warmth." },
    "bpm-ms": { name: "BPM/Delay Calc", how: "BPM to timing.", why: "Effect precision." },
    "freq-note": { name: "Freq to Note", how: "Hz to Music Note.", why: "Sound tuning." },
    "acoustic-calc": { name: "Room Treatment", how: "Enter Room Dim (m).", why: "Studio acoustics." },
    "deg-rad": { name: "Degrees to Rad", how: "Angle to Radians.", why: "Game physics." },
    "hex-norm": { name: "Color Norm", how: "Hex to 0.0-1.0.", why: "Shader coding." },
    "aspect-ratio": { name: "Aspect Ratio", how: "Width & Height ratio.", why: "UI design." }
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
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col h-screen sticky top-0 px-4">
        <div className="py-8 px-4 border-b border-neutral-800 mb-4"><h1 className="text-xl font-bold text-white tracking-tighter">Converter<span className="text-emerald-500">Lab</span></h1></div>
        <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
          <NavGroup title="Dev Utilities" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Data & Stats Lab" items={["stats-calc"]} />
          <NavGroup title="Music Theory & Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev Lab" items={["deg-rad", "hex-norm", "aspect-ratio"]} />
        </div>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 md:hidden overflow-y-auto p-6 flex flex-col items-center">
          <button onClick={() => setIsMenuOpen(false)} className="text-emerald-500 mb-8 font-bold border border-emerald-500/20 px-6 py-2 rounded-full">✕ CLOSE</button>
          <NavGroup title="Dev Tools" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Data Lab" items={["stats-calc"]} />
          <NavGroup title="Music Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev" items={["deg-rad", "hex-norm", "aspect-ratio"]} />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-10 backdrop-blur-md">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold text-[10px] border border-emerald-500/20 px-3 py-1 rounded">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase tracking-widest italic">Analog heart, digital precision.</div>
          <h1 className="md:hidden font-bold text-white tracking-tighter">ConverterLab</h1>
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{toolData[activeTab].name}</h2>
          <p className="text-neutral-500 text-xs mb-8 italic">{toolData[activeTab].how}</p>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
            {["stats-calc", "circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "deg-rad", "hex-norm", "aspect-ratio", "acoustic-calc"].includes(activeTab) ? (
              <div className="space-y-4">
                {activeTab === "stats-calc" ? (
                  <textarea className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none h-32 focus:border-emerald-500 transition-colors" placeholder="Example: 12, 45.2, 67, 23..." value={input} onChange={(e) => setInput(e.target.value)} />
                ) : activeTab === "acoustic-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="W (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="L (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="H (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : (
                  <input type="text" placeholder="Enter value..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-3xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                )}
                
                <button onClick={() => calculateLogic(activeTab.split('-')[0], input)} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-900/20">PROCESS DATA</button>
                <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-lg whitespace-pre-wrap shadow-inner">{output || "Awaiting input..."}</pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500 transition-colors" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input..." />
                <textarea className="h-64 md:h-80 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Output..." />
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-12">
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Description</h3>
              <p className="text-neutral-400 leading-relaxed">{toolData[activeTab].why}</p>
            </div>
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Input Guide</h3>
              <p className="text-neutral-400 leading-relaxed">{toolData[activeTab].how}</p>
            </div>
          </div>
        </div>
        
        <footer className="p-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 px-6 md:px-12 gap-4 mt-auto">
          <div>© 2026 ConverterLab.io - Precision Tools by Cem Ülkü</div>
          <div className="flex gap-4"><a href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</a><a href="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</a></div>
        </footer>
      </main>
    </div>
  );
}