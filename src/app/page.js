"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("travel-calc");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("3");
  const [hasCar, setHasCar] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [output, setOutput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ TRY: 33.0, EUR: 0.93, USD: 1 });

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => { if (data && data.rates) setExchangeRates(data.rates); })
      .catch(() => console.log("Offline mode active."));
  }, []);

  const calculateLogic = (type, val) => {
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const inputVal = val || input;
    
    switch(type) {
      case 'travel':
        const cityIndex = { "london": 1.5, "new-york": 1.8, "tokyo": 1.6, "paris": 1.4, "berlin": 1.2, "istanbul": 0.8, "warsaw": 0.9, "thessaloniki": 0.85 };
        const multiplier = cityIndex[input.toLowerCase()] || 1.0;
        const days = parseInt(input2) || 1;
        const starMult = input3 === "5" ? 3.5 : input3 === "4" ? 1.8 : 1;
        const totalUSD = ((80 * starMult + 70) * days * multiplier) + (hasCar ? 50 * days : 0);
        const converted = totalUSD * (exchangeRates[targetCurrency] || 1);
        setOutput(`Estimated Budget: ${converted.toLocaleString()} ${targetCurrency}\n- Destination: ${input.toUpperCase()}\n- Duration: ${days} Days\n- Hotel: ${input3}★\n- Car Rental: ${hasCar ? "Included" : "Excluded"}\n\n*Live Rate: 1 USD = ${exchangeRates[targetCurrency]?.toFixed(2)} ${targetCurrency}`);
        break;
      case 'stats':
        const nums = inputVal.split(/[, \s\n]+/).map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
        if(nums.length === 0) return;
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const median = nums.length % 2 === 0 ? (nums[nums.length/2 - 1] + nums[nums.length/2]) / 2 : nums[Math.floor(nums.length/2)];
        const stdDev = Math.sqrt(nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length);
        setOutput(`Count: ${nums.length}\nMean: ${mean.toFixed(2)}\nMedian: ${median}\nMin/Max: ${nums[0]} / ${nums[nums.length-1]}\nStd Dev: ${stdDev.toFixed(2)}`);
        break;
      case 'freq':
        const hz = parseFloat(inputVal);
        const midi = 12 * (Math.log2(hz / 440)) + 69;
        const roundedMidi = Math.round(midi);
        const exactFreq = 440 * Math.pow(2, (roundedMidi - 69) / 12);
        const cents = Math.round(1200 * Math.log2(hz / exactFreq));
        setOutput(`Note: ${keys[roundedMidi % 12]}${Math.floor(roundedMidi / 12) - 1}\nDetune: ${cents > 0 ? '+' : ''}${cents} cents`);
        break;
      case 'bpm':
        const bpmMs = (60000 / parseFloat(inputVal)).toFixed(2);
        setOutput(`1/4: ${bpmMs}ms | 1/8: ${(bpmMs/2).toFixed(2)}ms | 1/16: ${(bpmMs/4).toFixed(2)}ms`);
        break;
      case 'acoustic':
        const area = 2 * (parseFloat(input) * parseFloat(input2) + parseFloat(input2) * parseFloat(input3) + parseFloat(input) * parseFloat(input3));
        setOutput(`Surface: ${area.toFixed(1)} m²\n- Absorption: ${(area * 0.18).toFixed(1)} m²\n- Diffusion: ${(area * 0.07).toFixed(1)} m²`);
        break;
      case 'circle':
        const cIdx = keys.indexOf(input.toUpperCase());
        if(cIdx === -1) return;
        setOutput(`Key: ${input.toUpperCase()}\n- 4th: ${keys[(cIdx + 5) % 12]}\n- 5th: ${keys[(cIdx + 7) % 12]}\n- Minor: ${keys[(cIdx + 9) % 12]}m`);
        break;
      default: setOutput(inputVal.toUpperCase()); break;
    }
  };

  const toolData = {
    "travel-calc": { name: "Travel Expense Engine", group: "Business", how: "City, Days, Hotel Class.", why: "Instant global travel budgeting." },
    "stats-calc": { name: "Statistics Engine", group: "Business", how: "Numbers (10, 20...)", why: "Data balancing & analysis." },
    "json-csv": { name: "JSON to CSV", group: "Dev", how: "Paste JSON.", why: "Data integration." },
    "curl-code": { name: "cURL to Code", group: "Dev", how: "Paste cURL.", why: "API testing." },
    "jwt-decoder": { name: "JWT Decoder", group: "Dev", how: "Paste JWT.", why: "Local decoding." },
    "base64": { name: "Base64 Tool", group: "Dev", how: "Paste text.", why: "Encoding." },
    "sql-format": { name: "SQL Formatter", group: "Dev", how: "Paste SQL.", why: "Readability." },
    "diff-checker": { name: "Diff Checker", group: "Dev", how: "Paste two texts.", why: "Version compare." },
    "markdown": { name: "Markdown Preview", group: "Dev", how: "MD text.", why: "Rendering." },
    "circle-fifths": { name: "Circle of Fifths", group: "Music", how: "Enter Key (C).", why: "Harmony." },
    "harmonics-calc": { name: "Upper Harmonics", group: "Music", how: "Enter Hz.", why: "Analog warmth." },
    "bpm-ms": { name: "BPM to Delay", group: "Music", how: "Enter BPM.", why: "Time FX." },
    "freq-note": { name: "Freq to Note", group: "Music", how: "Enter Hz.", why: "Tuning." },
    "acoustic-calc": { name: "Room Treatment", group: "Music", how: "W, L, H (m).", why: "Studio acoustic." },
    "deg-rad": { name: "Degrees to Rad", group: "Game", how: "Enter Angle.", why: "Physics." },
    "aspect-ratio": { name: "Aspect Ratio", group: "Game", how: "W & H.", why: "UI/UX Design." }
  };

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">{title}</div>
      {items.map(id => (
        <button key={id} onClick={() => {setActiveTab(id); setInput(""); setOutput(""); setIsMenuOpen(false);}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>{toolData[id]?.name}</button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col h-screen sticky top-0 px-4">
        <div className="py-8 px-4 border-b border-neutral-800 mb-4"><h1 className="text-xl font-bold text-white tracking-tighter italic">Converter<span className="text-emerald-500">Lab</span></h1></div>
        <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
          <NavGroup title="Business & Data" items={["travel-calc", "stats-calc"]} />
          <NavGroup title="Developer Utilities" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev Lab" items={["deg-rad", "aspect-ratio"]} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-10 backdrop-blur-md">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold border border-emerald-500/20 px-3 py-1 rounded text-xs tracking-widest">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase tracking-widest italic">Analog heart, digital precision.</div>
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-2">{toolData[activeTab]?.name}</h2>
          <p className="text-neutral-500 text-xs mb-8 italic">{toolData[activeTab]?.how}</p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl mb-8">
            {["travel-calc", "acoustic-calc", "stats-calc", "circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "deg-rad", "aspect-ratio"].includes(activeTab) ? (
              <div className="space-y-4">
                {activeTab === "travel-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="City" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="Days" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput2(e.target.value)} />
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput3(e.target.value)}><option value="3">3★</option><option value="4">4★</option><option value="5">5★</option></select>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setTargetCurrency(e.target.value)}><option value="USD">USD</option><option value="TRY">TRY</option><option value="EUR">EUR</option></select>
                    <div className="flex items-center gap-2 text-neutral-400"><input type="checkbox" onChange={(e) => setHasCar(e.target.checked)} /> Include Rental Car</div>
                  </div>
                ) : activeTab === "acoustic-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="W" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="L" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="H" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "stats-calc" ? (
                  <textarea className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none h-32" placeholder="10, 20, 30..." onChange={(e) => setInput(e.target.value)} />
                ) : (
                  <input type="text" placeholder="Enter value..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-3xl font-mono text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                )}
                <button onClick={() => calculateLogic(activeTab.split('-')[0])} className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all">PROCESS DATA</button>
                <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-sm md:text-lg whitespace-pre-wrap">{output || "Waiting for execution..."}</pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea className="h-64 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input..." />
                <textarea className="h-64 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Result..." />
              </div>
            )}
          </div>
        </div>
        <footer className="p-6 border-t border-neutral-800 text-[10px] text-neutral-600 text-center mt-auto italic">Analog heart, digital precision. © 2026 ConverterLab</footer>
      </main>
    </div>
  );
}