"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("travel-calc");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [output, setOutput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ TRY: 33.0, EUR: 0.93, GBP: 0.79, USD: 1 });

  // ✈️ TRAVEL EXPENSE HAFIZASI
  const [travelForm, setTravelForm] = useState({
    destVal: "1.0", destName: "Global Average", days: "1", hotel: "1", food: "70", transport: "15", currency: "USD"
  });

  const destinations = [
    { name: "🌍 Global Average", val: "1.0" },
    { name: "🇹🇷 TR - Istanbul", val: "0.8" },
    { name: "🇹🇷 TR - Ankara / Izmir", val: "0.7" },
    { name: "🇺🇸 US - New York", val: "1.8" },
    { name: "🇺🇸 US - General", val: "1.3" },
    { name: "🇬🇧 UK - London", val: "1.6" },
    { name: "🇫🇷 FR - Paris", val: "1.4" },
    { name: "🇩🇪 DE - Berlin / Munich", val: "1.2" },
    { name: "🇳🇱 NL - Amsterdam", val: "1.4" },
    { name: "🇦🇪 AE - Dubai", val: "1.5" },
    { name: "🇯🇵 JP - Tokyo", val: "1.6" },
    { name: "🇵🇱 PL - Warsaw", val: "0.9" },
    { name: "🇬🇷 GR - Thessaloniki", val: "0.85" }
  ];

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
  }, [isMenuOpen]);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => { if (data && data.rates) setExchangeRates(data.rates); })
      .catch(() => console.log("Offline mode: Using default rates."));
  }, []);

  const calculateLogic = (type, val) => {
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const inputVal = val || input;
    
    switch(type) {
      case 'travel':
        const tDays = parseInt(travelForm.days) || 1;
        const tIndex = parseFloat(travelForm.destVal);
        const tHotelMult = parseFloat(travelForm.hotel);
        const tFood = parseFloat(travelForm.food);
        const tTransport = parseFloat(travelForm.transport);
        const dailyUSD = ((80 * tHotelMult) + tFood + tTransport) * tIndex;
        const totalUSD = dailyUSD * tDays;
        const bufferTotalUSD = totalUSD * 1.10; 
        const rate = exchangeRates[travelForm.currency] || 1;
        const formatCurr = (amt, c) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: c }).format(amt);
        let hotelLabel = tHotelMult === 3.5 ? "5★ Executive" : tHotelMult === 1.8 ? "4★ Business" : "3★ Economy";
        let foodLabel = tFood === 150 ? "Fine Dining" : tFood === 70 ? "Medium" : "Budget/Fast";
        let transLabel = tTransport === 70 ? "Rent a Car" : tTransport === 50 ? "Taxi/Uber" : "Public Transport";

        setOutput(`✈️ CORPORATE TRAVEL EXPENSE REPORT\n==========================================\nLocation      : ${travelForm.destName}\nDuration      : ${tDays} Days\nAccommodation : ${hotelLabel}\nDaily Food    : ${foodLabel}\nLogistics     : ${transLabel}\n------------------------------------------\n💰 ESTIMATED BUDGET: ${formatCurr(bufferTotalUSD * rate, travelForm.currency)}\n------------------------------------------\nAvg Daily Cost: ${formatCurr((dailyUSD * 1.10) * rate, travelForm.currency)}\nLive Exch Rate: 1 USD = ${rate.toFixed(2)} ${travelForm.currency}\n\n*Includes 10% safety margin.`);
        break;

      case 'stats':
        const nums = inputVal.split(/[, \s\n]+/).map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
        if(nums.length === 0) { setOutput("Please enter valid numbers."); return; }
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const median = nums.length % 2 === 0 ? (nums[nums.length/2 - 1] + nums[nums.length/2]) / 2 : nums[Math.floor(nums.length/2)];
        const stdDev = Math.sqrt(nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length);
        setOutput(`Count: ${nums.length}\nMean: ${mean.toFixed(2)}\nMedian: ${median}\nMin/Max: ${nums[0]} / ${nums[nums.length-1]}\nStd Dev: ${stdDev.toFixed(2)}`);
        break;

      case 'freq':
        const hz = parseFloat(inputVal);
        if(!hz) return;
        const midi = 12 * (Math.log2(hz / 440)) + 69;
        const exactFreq = 440 * Math.pow(2, (Math.round(midi) - 69) / 12);
        const cents = Math.round(1200 * Math.log2(hz / exactFreq));
        setOutput(`Note: ${keys[Math.round(midi) % 12]}${Math.floor(Math.round(midi) / 12) - 1}\nDetune: ${cents > 0 ? '+' : ''}${cents} cents`);
        break;

      case 'bpm':
        const bpmMs = (60000 / parseFloat(inputVal)).toFixed(2);
        if(!bpmMs || bpmMs === "Infinity") return;
        setOutput(`1/4 Delay: ${bpmMs}ms | 1/8: ${(bpmMs/2).toFixed(2)}ms | 1/16: ${(bpmMs/4).toFixed(2)}ms`);
        break;

      case 'acoustic':
        const area = 2 * (parseFloat(input) * parseFloat(input2) + parseFloat(input2) * parseFloat(input3) + parseFloat(input) * parseFloat(input3));
        if(!area || isNaN(area)) return;
        setOutput(`Surface: ${area.toFixed(1)} m²\n- Absorption: ${(area * 0.18).toFixed(1)} m²\n- Diffusion: ${(area * 0.07).toFixed(1)} m²`);
        break;

      case 'circle':
        const cIdx = keys.indexOf(input.toUpperCase());
        if(cIdx === -1) return;
        setOutput(`Key: ${input.toUpperCase()} Major\n- 4th: ${keys[(cIdx + 5) % 12]}\n- 5th: ${keys[(cIdx + 7) % 12]}\n- Minor: ${keys[(cIdx + 9) % 12]}m`);
        break;
        
      case 'harmonics':
        const v = parseFloat(inputVal);
        if(!v) return;
        let hList = `Fundamental: ${v} Hz\n`;
        for(let i=2; i<=6; i++) hList += `${i}. Harmonic: ${(v * i).toFixed(1)} Hz\n`;
        setOutput(hList);
        break;

      // 🎮 GAME DEV: YENİ ARAÇLAR (MANTIK)
      case 'deg':
        const deg = parseFloat(inputVal);
        if(isNaN(deg)) { setOutput("Please enter a valid angle."); return; }
        setOutput(`${deg} Degrees = ${(deg * Math.PI / 180).toFixed(4)} Radians\n\n*Unity/Unreal Math functions usually expect Radians.`);
        break;

      case 'aspect':
        const w = parseFloat(input), h = parseFloat(input2), nw = parseFloat(input3);
        if(!w || !h) { setOutput("Enter Original Width and Height."); return; }
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const div = gcd(w, h);
        let out = `Original Resolution: ${w} x ${h}\nAspect Ratio: ${w/div}:${h/div}\nRatio Decimal: ${(w/h).toFixed(4)}`;
        if(nw) {
            const nh = (h / w) * nw;
            out += `\n\n--- UI SCALED ---\nNew Width: ${nw}\nNew Height: ${Math.round(nh)} (Exact: ${nh.toFixed(2)})`;
        }
        setOutput(out);
        break;

      case 'hex':
        let hex = inputVal.replace("#", "").trim();
        if(hex.length === 3) hex = hex.split('').map(c => c+c).join('');
        if(hex.length !== 6) { setOutput("Enter a valid 6-digit Hex (e.g. FF5733)"); return; }
        const r = parseInt(hex.substring(0,2), 16), g = parseInt(hex.substring(2,4), 16), b = parseInt(hex.substring(4,6), 16);
        setOutput(`Standard RGB: rgb(${r}, ${g}, ${b})\n\n--- SHADER CODE (0.0 - 1.0) ---\nvec4(${(r/255).toFixed(3)}f, ${(g/255).toFixed(3)}f, ${(b/255).toFixed(3)}f, 1.000f)`);
        break;

      case 'fps':
        const fps = parseFloat(input), frames = parseFloat(input2);
        if(!fps || !frames) { setOutput("Enter Target FPS and Frame count."); return; }
        const ms = (frames / fps) * 1000;
        setOutput(`Target FPS: ${fps}\nFrame Count: ${frames}\n\n--- DURATION ---\nMilliseconds: ${ms.toFixed(2)} ms\nSeconds: ${(ms/1000).toFixed(4)} s`);
        break;

      case 'lerp':
        const start = parseFloat(input), end = parseFloat(input2), t = parseFloat(input3);
        if(isNaN(start) || isNaN(end) || isNaN(t)) { setOutput("Enter Start, End, and Time(t)."); return; }
        const res = start + (end - start) * t;
        setOutput(`Lerp (Linear Interpolation)\nStart: ${start} | End: ${end} | Time (t): ${t}\n\n--- RESULT ---\nCurrent Value: ${res.toFixed(4)}`);
        break;

      default: 
        setOutput("Ready to process..."); 
        break;
    }
  };

  // 🛠️ YENİ TOOL VERİLERİ (AÇIKLAMALAR EKLENDİ)
  const toolData = {
    "travel-calc": { name: "Travel Expense Engine", how: "Select destination, duration, and preferences.", why: "Corporate grade travel budget estimations." },
    "stats-calc": { name: "Statistics Engine", how: "Numbers (e.g. 10, 20...)", why: "Data balancing & analysis." },
    "json-csv": { name: "JSON to CSV", how: "Paste JSON array.", why: "Data integration." },
    "curl-code": { name: "cURL to Code", how: "Paste cURL request.", why: "API testing." },
    "jwt-decoder": { name: "JWT Decoder", how: "Paste encoded JWT.", why: "Privacy-focused token decoding." },
    "base64": { name: "Base64 Tool", how: "Paste text.", why: "Secure encoding/decoding." },
    "sql-format": { name: "SQL Formatter", how: "Paste raw SQL.", why: "Query readability." },
    "diff-checker": { name: "Diff Checker", how: "Paste two texts.", why: "Version control comparison." },
    "markdown": { name: "Markdown Preview", how: "Write MD text.", why: "Documentation rendering." },
    "circle-fifths": { name: "Circle of Fifths", how: "Enter Key (e.g. C).", why: "Harmony planning." },
    "harmonics-calc": { name: "Upper Harmonics", how: "Enter Hz.", why: "Analog warmth synthesis." },
    "bpm-ms": { name: "BPM to Delay", how: "Enter BPM.", why: "Precise effect timing." },
    "freq-note": { name: "Freq to Note", how: "Enter Hz.", why: "Synth tuning & acoustics." },
    "acoustic-calc": { name: "Room Treatment", how: "W, L, H (m).", why: "Studio acoustic planning." },
    // 🎮 YENİ GAME DEV AÇIKLAMALARI
    "deg-rad": { name: "Degrees to Radians", how: "Enter Angle (e.g. 180).", why: "Game engines use radians for vector and rotation math." },
    "aspect-calc": { name: "Resolution Scaler", how: "Enter Original W&H, and Target Width.", why: "Pixel-perfect UI scaling for different monitor aspect ratios." },
    "hex-shader": { name: "Color to Shader (0-1)", how: "Enter Hex code (e.g. FF5733).", why: "Game engines and shaders require colors in normalized 0.0 - 1.0 format." },
    "fps-ms": { name: "Frame Timing (FPS)", how: "Enter Target FPS and Frame Count.", why: "Crucial for hitstun, animation durations, and network tick rates." },
    "lerp-calc": { name: "Lerp Calculator", how: "Enter Start(A), End(B) and Time(t).", why: "Linear interpolation is the backbone of smooth movement and camera tracking." }
  };

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">{title}</div>
      {items.map(id => (
        <button key={id} onClick={() => {setActiveTab(id); setInput(""); setInput2(""); setInput3(""); setOutput(""); setIsMenuOpen(false);}} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800 active:bg-neutral-700'}`}>{toolData[id]?.name}</button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30">
      
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col h-screen sticky top-0 px-4">
        <div className="py-8 px-4 border-b border-neutral-800 mb-4"><h1 className="text-xl font-bold text-white tracking-tighter italic">Converter<span className="text-emerald-500">Lab</span></h1></div>
        <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
          <NavGroup title="Business & Data" items={["travel-calc", "stats-calc"]} />
          <NavGroup title="Developer Tools" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev" items={["deg-rad", "aspect-calc", "hex-shader", "fps-ms", "lerp-calc"]} /> {/* YENİ MENÜ */}
        </div>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-white tracking-tighter italic">Converter<span className="text-emerald-500">Lab</span></h1>
            <button onClick={() => setIsMenuOpen(false)} className="text-emerald-500 font-bold border border-emerald-500/20 px-4 py-2 rounded-full text-xs">✕ CLOSE</button>
          </div>
          <NavGroup title="Business & Data" items={["travel-calc", "stats-calc"]} />
          <NavGroup title="Dev Tools" items={["json-csv", "curl-code", "jwt-decoder", "base64", "sql-format", "diff-checker", "markdown"]} />
          <NavGroup title="Music Lab" items={["circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev" items={["deg-rad", "aspect-calc", "hex-shader", "fps-ms", "lerp-calc"]} /> {/* YENİ MENÜ */}
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/30 sticky top-0 z-50 backdrop-blur-md">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-emerald-500 font-bold border border-emerald-500/20 px-3 py-2 rounded text-[10px] tracking-widest active:scale-95 transition-transform">MENU</button>
          <div className="hidden md:block text-[10px] text-neutral-700 uppercase tracking-widest italic font-mono">Analog heart, digital precision.</div>
          <h1 className="md:hidden font-bold text-white tracking-tighter text-sm">Converter<span className="text-emerald-500">Lab</span></h1>
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{toolData[activeTab]?.name}</h2>
          <p className="text-neutral-500 text-[10px] md:text-xs mb-8 italic">{toolData[activeTab]?.how}</p>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl mb-8">
            {/* 🛠️ TÜM HESAPLAYICILAR BURAYA EKLENDİ */}
            {["travel-calc", "acoustic-calc", "stats-calc", "circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "deg-rad", "aspect-calc", "hex-shader", "fps-ms", "lerp-calc"].includes(activeTab) ? (
              <div className="space-y-6">
                
                {activeTab === "travel-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => { const selected = destinations.find(d => d.val === e.target.value); setTravelForm({...travelForm, destVal: e.target.value, destName: selected.name}); }}>
                      {destinations.map(d => <option key={d.name} value={d.val}>{d.name}</option>)}
                    </select>
                    <div className="flex border border-neutral-800 rounded-xl bg-black overflow-hidden focus-within:border-emerald-500">
                      <span className="p-4 text-neutral-500 text-sm flex items-center bg-neutral-900/50">Days</span>
                      <input type="number" min="1" className="w-full bg-transparent p-4 text-base font-mono text-emerald-400 outline-none" value={travelForm.days} onChange={(e) => setTravelForm({...travelForm, days: e.target.value})} />
                    </div>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, currency: e.target.value})}>
                      <option value="USD">💵 USD</option><option value="EUR">💶 EUR</option><option value="TRY">₺ TRY</option><option value="GBP">£ GBP</option>
                    </select>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, hotel: e.target.value})}>
                      <option value="1">🏨 3★ Economy</option><option value="1.8">🏨 4★ Business</option><option value="3.5">🏨 5★ Executive</option>
                    </select>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, food: e.target.value})}>
                      <option value="30">🍔 Fast Food</option><option value="70" selected>🍽️ Standard</option><option value="150">🍷 Fine Dining</option>
                    </select>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, transport: e.target.value})}>
                      <option value="15">🚇 Public Transport</option><option value="50">🚕 Taxi / Uber</option><option value="70">🚗 Rent a Car</option>
                    </select>
                  </div>
                ) : activeTab === "acoustic-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="W" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="L" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="H" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "aspect-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="Old Width (1920)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="Old Height (1080)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="Target Width (e.g. 800)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "fps-ms" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" placeholder="Target FPS (e.g. 60)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="Frames (e.g. 12)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                  </div>
                ) : activeTab === "lerp-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="Start (A)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input type="number" placeholder="End (B)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input type="number" placeholder="Time (t: 0-1)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "stats-calc" ? (
                  <textarea className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none h-32 focus:border-emerald-500" placeholder="Paste data (10, 20, 30...)" onChange={(e) => setInput(e.target.value)} />
                ) : (
                  <input type="text" placeholder={toolData[activeTab]?.how || "Enter value..."} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xl md:text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                )}
                
                <button onClick={() => calculateLogic(activeTab.split('-')[0])} className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-900/20 uppercase text-sm tracking-widest">PROCESS DATA</button>
                <pre className="p-4 md:p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-xs md:text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">{output || "Awaiting execution..."}</pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea className="h-48 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste data here..." />
                <textarea className="h-48 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" value={output} readOnly placeholder="Result..." />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-sm mb-12">
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Why it matters</h3>
              <p className="text-neutral-400 leading-relaxed">{toolData[activeTab]?.why}</p>
            </div>
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Input Guide</h3>
              <p className="text-neutral-400 leading-relaxed">{toolData[activeTab]?.how}</p>
            </div>
          </div>
          
        </div>
        <footer className="p-6 border-t border-neutral-800 text-[10px] text-neutral-600 text-center mt-auto italic font-mono">Analog heart, digital precision. © 2026 ConverterLab</footer>
      </main>
    </div>
  );
}