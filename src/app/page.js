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
  
  // Güvenlik Payı: API çökerse veya internet giderse diye varsayılan kurlar
  const [exchangeRates, setExchangeRates] = useState({ TRY: 33.0, EUR: 0.93, GBP: 0.79, USD: 1 });

  // 🌍 ÜCRETSİZ & KEY GEREKTİRMEYEN KUR API'Sİ (Sayfa açıldığında 1 kez çalışır)
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch((err) => console.log("Kur API bağlantı hatası, offline mod (varsayılan kurlar) devrede."));
  }, []);

  const calculateLogic = (type, val) => {
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const inputVal = val || input;
    
    switch(type) {
      case 'travel': // ✈️ KAPSAMLI SEYAHAT MOTORU
        const cityIndexData = { "london": 1.5, "new-york": 1.8, "tokyo": 1.6, "paris": 1.4, "berlin": 1.2, "istanbul": 0.8, "dubai": 1.4, "warsaw": 0.9, "amsterdam": 1.3, "rome": 1.2 };
        const cityMultiplier = cityIndexData[input.toLowerCase()] || 1.0; 
        const days = parseInt(input2) || 1;
        const hotelStars = parseInt(input3) || 3;
        
        // USD Bazlı Günlük Ortalama Maliyetler
        const baseHotelUSD = 80; 
        const baseMealsUSD = 50;
        const baseTransportUSD = 20;
        const baseRentalUSD = 50; 
        
        const starMultiplier = hotelStars === 5 ? 3.5 : hotelStars === 4 ? 1.8 : 1;
        const adjustedDailyUSD = (baseHotelUSD * starMultiplier + baseMealsUSD + baseTransportUSD) * cityMultiplier;
        
        let totalUSD = adjustedDailyUSD * days;
        if (hasCar) totalUSD += (baseRentalUSD * days * cityMultiplier * 0.8); 
        
        const totalBufferUSD = totalUSD * 1.10; // %10 Güvenlik Marjı
        const convertedRate = exchangeRates[targetCurrency] || 1;
        
        // Para Birimi Formatlayıcı
        const formatCurrency = (amount, curr) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: curr }).format(amount);
        
        setOutput(
          `✈️ TRAVEL EXPENSE REPORT\n` +
          `-----------------------------------\n` +
          `Destination: ${input ? input.toUpperCase() : "GLOBAL AVERAGE"}\n` +
          `Duration: ${days} days\n` +
          `Accommodation: ${hotelStars}★ Hotel\n` +
          `Car Rental: ${hasCar ? "Included" : "Excluded"}\n\n` +
          `💰 ESTIMATED TOTAL: ${formatCurrency(totalBufferUSD * convertedRate, targetCurrency)}\n` +
          `-----------------------------------\n` +
          `Base USD Est. (incl. 10% buffer): $${totalBufferUSD.toFixed(0)}\n` +
          `Current Live Rate: 1 USD = ${convertedRate.toFixed(2)} ${targetCurrency}\n\n` +
          `*Note: Includes Hotel, 3 Meals/day, and Local Transport. Formulated via global cost indices.`
        );
        break;

      case 'stats':
        const nums = inputVal.split(/[, \s\n]+/).map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
        if(nums.length === 0) { setOutput("Please enter valid numbers."); return; }
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const median = nums.length % 2 === 0 ? (nums[nums.length/2 - 1] + nums[nums.length/2]) / 2 : nums[Math.floor(nums.length/2)];
        const stdDev = Math.sqrt(nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length);
        setOutput(`Data Points: ${nums.length}\nMean (Average): ${mean.toFixed(2)}\nMedian (Middle): ${median}\nMin/Max: ${nums[0]} / ${nums[nums.length-1]}\nStandard Deviation: ${stdDev.toFixed(2)}`);
        break;

      case 'circle':
        const idx = keys.indexOf(input.toUpperCase());
        if(idx === -1) { setOutput("Invalid key. Try C, G#, Bb etc."); return; }
        setOutput(`Key: ${input.toUpperCase()} Major\n- Perfect 4th: ${keys[(idx + 5) % 12]}\n- Perfect 5th: ${keys[(idx + 7) % 12]}\n- Relative Minor: ${keys[(idx + 9) % 12]}m`);
        break;

      case 'harmonics':
        const v = parseFloat(inputVal);
        if(!v) return;
        let hList = `Fundamental Frequency: ${v} Hz\n`;
        for(let i=2; i<=6; i++) hList += `${i}. Harmonic: ${(v * i).toFixed(1)} Hz\n`;
        setOutput(hList + "\n*Crucial for generating analog warmth in synthesis.");
        break;

      case 'acoustic':
        const w = parseFloat(input), l = parseFloat(input2), h_v = parseFloat(input3);
        if(!w || !l || !h_v) { setOutput("Please enter all 3 dimensions."); return; }
        const s = 2 * (w * l + l * h_v + w * h_v);
        setOutput(`Total Room Surface Area: ${s.toFixed(1)} m²\n- Min. Absorption Needed: ${(s * 0.18).toFixed(1)} m²\n- Min. Diffusion Needed: ${(s * 0.07).toFixed(1)} m²`);
        break;

      case 'bpm':
        const ms = (60000 / parseFloat(inputVal)).toFixed(2);
        if(!ms || ms === "Infinity") return;
        setOutput(`Base BPM: ${inputVal}\n- 1/4 Note Delay: ${ms} ms\n- 1/8 Note Delay: ${(ms/2).toFixed(2)} ms\n- 1/16 Note Delay: ${(ms/4).toFixed(2)} ms`);
        break;

      case 'freq':
        const hz = parseFloat(inputVal);
        if(!hz || hz <= 0) return;
        const midi = 12 * (Math.log2(hz / 440)) + 69;
        const roundedMidi = Math.round(midi);
        const exactFreq = 440 * Math.pow(2, (roundedMidi - 69) / 12);
        const cents = Math.round(1200 * Math.log2(hz / exactFreq));
        setOutput(`Detected Note: ${keys[roundedMidi % 12]}${Math.floor(roundedMidi / 12) - 1}\nMIDI Note Number: ${roundedMidi}\nPerfect Pitch Frequency: ${exactFreq.toFixed(2)} Hz\nDetune: ${cents > 0 ? '+' : ''}${cents} cents\n\n*Zero detune means perfect tuning.`);
        break;

      case 'deg':
        const deg = parseFloat(inputVal);
        setOutput(`${deg} Degrees = ${(deg * Math.PI / 180).toFixed(4)} Radians`);
        break;

      case 'aspect':
        const numsAspect = inputVal.split(/[, \s\n]+/).map(Number).filter(n => !isNaN(n));
        if(numsAspect.length === 2) {
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(numsAspect[0], numsAspect[1]);
            setOutput(`Resolution: ${numsAspect[0]}x${numsAspect[1]}\nAspect Ratio: ${numsAspect[0]/divisor}:${numsAspect[1]/divisor}`);
        } else {
            setOutput("Enter Width and Height (e.g. 1920 1080)");
        }
        break;

      default: break;
    }
  };

  const toolData = {
    "travel-calc": { name: "Travel Expense Engine", how: "City (London), Days, Hotel Class.", why: "Instant global travel budgeting using live exchange rates and cost indices." },
    "stats-calc": { name: "Statistics Engine", how: "Paste numbers separated by spaces or commas.", why: "Mean, Median, and Standard Deviation analysis for data balancing." },
    "json-csv": { name: "JSON to CSV", how: "Paste JSON array.", why: "Data parsing and integration." },
    "curl-code": { name: "cURL to Code", how: "Paste cURL request.", why: "Rapid API endpoint testing." },
    "jwt-decoder": { name: "JWT Decoder", how: "Paste encoded JWT.", why: "Privacy-focused local token decoding." },
    "base64": { name: "Base64 Tool", how: "Paste text.", why: "Secure encoding/decoding." },
    "sql-format": { name: "SQL Formatter", how: "Paste raw SQL.", why: "Query readability and beautification." },
    "diff-checker": { name: "Diff Checker", how: "Paste Original and New text.", why: "Version control comparison." },
    "markdown": { name: "Markdown Preview", how: "Write MD text.", why: "Documentation rendering." },
    "circle-fifths": { name: "Circle of Fifths", how: "Enter Musical Key (e.g., C).", why: "Harmony planning and track mixing." },
    "harmonics-calc": { name: "Upper Harmonics", how: "Enter Frequency (Hz).", why: "Analog synthesis and overtone generation." },
    "bpm-ms": { name: "BPM to Delay", how: "Enter BPM (e.g., 120).", why: "Precise reverb and delay timing." },
    "freq-note": { name: "Freq to Note Analyzer", how: "Enter Hz (e.g., 440).", why: "Synth tuning and room resonance checking." },
    "acoustic-calc": { name: "Room Treatment", how: "Width, Length, Height (m).", why: "Calculating studio acoustic panel requirements." },
    "deg-rad": { name: "Degrees to Radians", how: "Enter Angle.", why: "Game physics and rotational math." },
    "aspect-ratio": { name: "Aspect Ratio", how: "Enter Width & Height (1920 1080).", why: "UI/UX design resolution matching." }
  };

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">{title}</div>
      {items.map(id => (
        <button key={id} onClick={() => {
            setActiveTab(id); setInput(""); setInput2(""); setInput3("3"); setHasCar(false); setOutput(""); setIsMenuOpen(false);
        }} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800'}`}>
            {toolData[id] ? toolData[id].name : id}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30">
      
      {/* MASAÜSTÜ SOL MENÜ */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col h-screen sticky top-0 px-4">
        <div className="py-8 px-4 border-b border-neutral-800 mb-4">
            <h1 className="text-xl font-bold text-white tracking-tighter italic">Converter<span className="text-emerald-500">Lab</span></h1>
        </div>
        <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
          <NavGroup title="Business & Data" items={["travel-calc", "stats-calc"]} />
          <NavGroup title="Developer Utilities" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Theory & Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev Lab" items={["deg-rad", "aspect-ratio"]} />
        </div>
      </aside>

      {/* MOBİL MENÜ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 md:hidden overflow-y-auto p-6 flex flex-col items-center">
          <button onClick={() => setIsMenuOpen(false)} className="text-emerald-500 mb-8 font-bold border border-emerald-500/20 px-6 py-2 rounded-full tracking-widest">✕ CLOSE MENU</button>
          <div className="w-full max-w-sm">
            <NavGroup title="Business & Data" items={["travel-calc", "stats-calc"]} />
            <NavGroup title="Dev Tools" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
            <NavGroup title="Music Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "acoustic-calc"]} />
            <NavGroup title="Game Dev" items={["deg-rad", "aspect-ratio"]} />
          </div>
        </div>
      )}

      {/* ANA EKRAN (SAĞ TARAF) */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* ÜST BAR */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-10 backdrop-blur-md">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold text-[10px] border border-emerald-500/20 px-3 py-1 rounded tracking-widest">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase tracking-widest font-mono italic">Analog heart, digital precision.</div>
          <h1 className="md:hidden font-bold text-white tracking-tighter">Converter<span className="text-emerald-500">Lab</span></h1>
        </header>

        {/* İÇERİK ALANI */}
        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{toolData[activeTab]?.name}</h2>
          <p className="text-neutral-500 text-xs mb-8 italic">{toolData[activeTab]?.how}</p>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
            
            {/* ÖZEL INPUT GEREKTİREN ARAÇLAR (HESAPLAYICILAR) */}
            {["travel-calc", "stats-calc", "circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "deg-rad", "aspect-ratio", "acoustic-calc"].includes(activeTab) ? (
              <div className="space-y-6">
                
                {/* 1. SEYAHAT MOTORU INPUTLARI */}
                {activeTab === "travel-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" placeholder="City (London, Istanbul...)" className="bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="Days" className="bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setInput2(e.target.value)} />
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setInput3(e.target.value)} value={input3}>
                      <option value="3">3★ Hotel (Economy)</option>
                      <option value="4">4★ Hotel (Business)</option>
                      <option value="5">5★ Hotel (Executive)</option>
                    </select>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setTargetCurrency(e.target.value)} value={targetCurrency}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <div className="flex items-center gap-3 p-4 border border-neutral-800 rounded-xl bg-black/50 lg:col-span-4">
                      <input type="checkbox" id="carRental" className="accent-emerald-500 w-5 h-5 cursor-pointer" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} />
                      <label htmlFor="carRental" className="text-neutral-400 cursor-pointer font-mono text-sm">Include Car Rental</label>
                    </div>
                  </div>
                
                {/* 2. AKUSTİK MOTORU INPUTLARI */}
                ) : activeTab === "acoustic-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="Width (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="Length (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="Height (m)" className="bg-black border border-neutral-800 rounded-xl p-4 text-xl font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                
                {/* 3. İSTATİSTİK INPUTU (BÜYÜK TEXTAREA) */}
                ) : activeTab === "stats-calc" ? (
                  <textarea className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none h-32 focus:border-emerald-500 transition-colors" placeholder="Example: 120, 150.5, 200, 45..." onChange={(e) => setInput(e.target.value)} />
                
                {/* 4. DİĞER STANDART INPUTLAR (TEK SATIR) */}
                ) : (
                  <input type="text" placeholder="Enter value here..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-colors" onChange={(e) => setInput(e.target.value)} />
                )}
                
                <button onClick={() => calculateLogic(activeTab.split('-')[0], input)} className="w-full md:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 tracking-wide uppercase">PROCESS DATA</button>
                <pre className="p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-sm md:text-lg whitespace-pre-wrap shadow-inner overflow-x-auto">{output || "Awaiting execution..."}</pre>
              </div>

            // METİN BAZLI ARAÇLAR (JSON, BASE64, SQL VB. İÇİN 2 EKRANLI YAPI)
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea className="h-64 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500 transition-colors" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your code or text here..." />
                <textarea className="h-64 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Result will appear here..." />
              </div>
            )}
          </div>
          
          {/* ALT AÇIKLAMA KARTLARI */}
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-12">
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50 hover:border-neutral-700 transition-colors">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Why it matters</h3>
              <p className="text-neutral-400 leading-relaxed">{toolData[activeTab]?.why}</p>
            </div>
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50 hover:border-neutral-700 transition-colors">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Data Privacy</h3>
              <p className="text-neutral-400 leading-relaxed">Processing runs entirely within your browser environment. Zero external data transmission (excluding live exchange rate fetching).</p>
            </div>
          </div>
        </div>
        
        {/* FOOTER */}
        <footer className="p-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 px-6 md:px-12 gap-4 mt-auto">
          <div className="font-mono">© 2026 ConverterLab.io - Built by Cem Ülkü</div>
          <div className="flex gap-6"><a href="/privacy" className="hover:text-emerald-500 transition-colors uppercase tracking-wider">Privacy</a><a href="/terms" className="hover:text-emerald-500 transition-colors uppercase tracking-wider">Terms</a></div>
        </footer>
      </main>
    </div>
  );
}