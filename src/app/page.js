"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("travel-calc");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = "3";
  const [hasCar, setHasCar] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [output, setOutput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ TRY: 33.0, EUR: 0.93, USD: 1 });

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => { if (data && data.rates) setExchangeRates(data.rates); })
      .catch((err) => console.log("Offline mode: Using default rates."));
  }, []);

  const calculateLogic = (type, val) => {
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const inputVal = val || input;
    
    switch(type) {
      case 'travel':
        const cityIndex = { "london": 1.5, "new-york": 1.8, "tokyo": 1.6, "paris": 1.4, "berlin": 1.2, "istanbul": 0.8, "warsaw": 0.9, "thessaloniki": 0.85 };
        const multiplier = cityIndex[input.toLowerCase()] || 1.0;
        const days = parseInt(input2) || 1;
        const hotelStars = parseInt(input3) || 3;
        const starMultiplier = hotelStars === 5 ? 3.5 : hotelStars === 4 ? 1.8 : 1;
        const totalUSD = ((80 * starMultiplier + 70) * days * multiplier) + (hasCar ? 50 * days : 0);
        const converted = totalUSD * (exchangeRates[targetCurrency] || 1);
        setOutput(`Estimated Budget: ${converted.toLocaleString()} ${targetCurrency}\n- Destination: ${input.toUpperCase()}\n- Hotel: ${hotelStars}★\n- Includes Buffer & Car: ${hasCar ? "Yes" : "No"}`);
        break;
      case 'stats':
        const nums = inputVal.split(/[, \s\n]+/).map(Number).filter(n => !isNaN(n));
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        setOutput(`Mean: ${mean.toFixed(2)} | Count: ${nums.length}`);
        break;
      case 'freq':
        const hz = parseFloat(inputVal);
        const midi = 12 * (Math.log2(hz / 440)) + 69;
        setOutput(`Note: ${keys[Math.round(midi) % 12]}${Math.floor(Math.round(midi) / 12) - 1}`);
        break;
      default: break;
    }
  };

  const toolData = {
    "travel-calc": { name: "Travel Expense Engine", how: "Enter City, Days, Hotel Class.", why: "Global travel budgeting with live rates." },
    "stats-calc": { name: "Statistics Engine", how: "Numbers (10, 20...)", why: "Data balancing." },
    "json-csv": { name: "JSON to CSV", how: "Paste JSON.", why: "Integration." },
    "freq-note": { name: "Freq to Note", how: "Enter Hz.", why: "Tuning." }
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
          <NavGroup title="Utilities" items={["json-csv", "freq-note"]} />
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold border border-emerald-500/20 px-3 py-1 rounded text-xs">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase tracking-widest italic">Analog heart, digital precision.</div>
        </header>
        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-6">{toolData[activeTab]?.name}</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl mb-8">
            {activeTab === "travel-calc" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="City (London, Istanbul...)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput(e.target.value)} />
                <input type="number" placeholder="Days" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput2(e.target.value)} />
                <select className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setInput3(e.target.value)}><option value="3">3★</option><option value="4">4★</option><option value="5">5★</option></select>
                <select className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none" onChange={(e) => setTargetCurrency(e.target.value)}><option value="USD">USD</option><option value="TRY">TRY</option><option value="EUR">EUR</option></select>
                <div className="flex items-center gap-2 px-2 text-neutral-400"><input type="checkbox" onChange={(e) => setHasCar(e.target.checked)} /> Include Rental Car</div>
              </div>
            ) : (
              <input type="text" placeholder="Enter data..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 mb-4 outline-none" onChange={(e) => setInput(e.target.value)} />
            )}
            <button onClick={() => calculateLogic(activeTab.split('-')[0])} className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl transition-all">PROCESS DATA</button>
            <pre className="mt-6 p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 whitespace-pre-wrap">{output || "Waiting for execution..."}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}