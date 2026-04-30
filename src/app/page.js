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

  // ✈️ TRAVEL EXPENSE STATE
  const [travelForm, setTravelForm] = useState({
    destVal: "1.0", destName: "Global Average", days: "1", hotel: "1", food: "70", transport: "15", currency: "USD"
  });

  const destinations = [
    { name: "🌍 Global Average", val: "1.0" },
    { name: "🇹🇷 TR - Istanbul", val: "0.8" },
    { name: "🇺🇸 US - New York", val: "1.8" },
    { name: "🇺🇸 US - General", val: "1.3" },
    { name: "🇬🇧 UK - London", val: "1.6" },
    { name: "🇫🇷 FR - Paris", val: "1.4" },
    { name: "🇩🇪 DE - Berlin / Munich", val: "1.2" },
    { name: "🇳🇱 NL - Amsterdam", val: "1.4" },
    { name: "🇦🇪 AE - Dubai", val: "1.5" },
    { name: "🇯🇵 JP - Tokyo", val: "1.6" }
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

  const calculateLogic = (type) => {
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    
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
        let foodLabel = tFood === 150 ? "Fine Dining" : tFood === 70 ? "Medium/Standard" : "Budget/Fast Food";
        let transLabel = tTransport === 70 ? "Rent a Car" : tTransport === 50 ? "Taxi/Uber" : "Public Transport";

        setOutput(`✈️ TRAVEL EXPENSE REPORT\n==========================================\nLocation      : ${travelForm.destName}\nDuration      : ${tDays} Days\nAccommodation : ${hotelLabel}\nDaily Food    : ${foodLabel}\nLogistics     : ${transLabel}\n------------------------------------------\n💰 ESTIMATED BUDGET: ${formatCurr(bufferTotalUSD * rate, travelForm.currency)}\n------------------------------------------\nAvg Daily Cost: ${formatCurr((dailyUSD * 1.10) * rate, travelForm.currency)}\nLive Exch Rate: 1 USD = ${rate.toFixed(2)} ${travelForm.currency}\n\n*Includes 10% corporate safety margin.`);
        break;

      case 'stats':
        const nums = input.split(/[, \s\n]+/).map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
        if(nums.length === 0) { setOutput("Please enter valid numeric data."); return; }
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const median = nums.length % 2 === 0 ? (nums[nums.length/2 - 1] + nums[nums.length/2]) / 2 : nums[Math.floor(nums.length/2)];
        const stdDev = Math.sqrt(nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length);
        setOutput(`Data Points: ${nums.length}\nMean (Avg): ${mean.toFixed(2)}\nMedian: ${median}\nMin/Max: ${nums[0]} / ${nums[nums.length-1]}\nStandard Deviation: ${stdDev.toFixed(2)}`);
        break;

      case 'freq':
        const hz = parseFloat(input);
        if(!hz || hz <= 0) { setOutput("Please enter a valid positive frequency (e.g., 440)."); return; }
        const midi = 12 * (Math.log2(hz / 440)) + 69;
        const roundedMidi = Math.round(midi);
        const exactFreq = 440 * Math.pow(2, (roundedMidi - 69) / 12);
        const cents = Math.round(1200 * Math.log2(hz / exactFreq));
        setOutput(`Detected Note: ${keys[roundedMidi % 12]}${Math.floor(roundedMidi / 12) - 1}\nMIDI Note Number: ${roundedMidi}\nPerfect Pitch Freq: ${exactFreq.toFixed(2)} Hz\nDetune: ${cents > 0 ? '+' : ''}${cents} Cents`);
        break;

      case 'bpm':
        const bpmMs = (60000 / parseFloat(input)).toFixed(2);
        if(!bpmMs || bpmMs === "Infinity" || bpmMs <= 0) { setOutput("Please enter a valid BPM (e.g., 120)."); return; }
        setOutput(`1/4 Note (Quarter): ${bpmMs} ms\n1/8 Note (Eighth): ${(bpmMs/2).toFixed(2)} ms\n1/16 Note (Sixteenth): ${(bpmMs/4).toFixed(2)} ms`);
        break;

      case 'acoustic':
        const area = 2 * (parseFloat(input) * parseFloat(input2) + parseFloat(input2) * parseFloat(input3) + parseFloat(input) * parseFloat(input3));
        if(!area || isNaN(area) || area <= 0) { setOutput("Please enter valid dimensions in meters."); return; }
        setOutput(`Total Room Surface Area: ${area.toFixed(1)} m²\n\n--- MINIMUM TREATMENT REQUIREMENTS ---\nAbsorption Panels (18%): ${(area * 0.18).toFixed(1)} m²\nDiffusion Panels (7%): ${(area * 0.07).toFixed(1)} m²`);
        break;

      case 'circle':
        const cIdx = keys.indexOf(input.toUpperCase());
        if(cIdx === -1) { setOutput("Invalid key. Please enter a root note like C, F#, Bb."); return; }
        setOutput(`Key: ${input.toUpperCase()} Major\n- Perfect 4th (Subdominant): ${keys[(cIdx + 5) % 12]}\n- Perfect 5th (Dominant): ${keys[(cIdx + 7) % 12]}\n- Relative Minor: ${keys[(cIdx + 9) % 12]}m`);
        break;
        
      case 'harmonics':
        const v = parseFloat(input);
        if(!v || v <= 0) { setOutput("Enter a base frequency in Hz."); return; }
        let hList = `Fundamental (1st): ${v} Hz\n`;
        for(let i=2; i<=6; i++) hList += `Harmonic ${i}: ${(v * i).toFixed(1)} Hz\n`;
        setOutput(hList);
        break;

      case 'deg':
        const deg = parseFloat(input);
        if(isNaN(deg)) { setOutput("Please enter a valid angle in degrees."); return; }
        setOutput(`${deg} Degrees = ${(deg * Math.PI / 180).toFixed(4)} Radians\n\n*Note: Unity/Unreal Math functions usually expect Radians.`);
        break;

      case 'aspect':
        const w = parseFloat(input), h = parseFloat(input2), nw = parseFloat(input3);
        if(!w || !h) { setOutput("Enter Original Width and Height in pixels."); return; }
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const div = gcd(w, h);
        let out = `Original Resolution: ${w} x ${h} px\nAspect Ratio: ${w/div}:${h/div}\nRatio Decimal: ${(w/h).toFixed(4)}`;
        if(nw) {
            const nh = (h / w) * nw;
            out += `\n\n--- UI SCALED RESOLUTION ---\nNew Width: ${nw} px\nNew Height: ${Math.round(nh)} px (Exact: ${nh.toFixed(2)})`;
        }
        setOutput(out);
        break;

      case 'hex':
        let hex = input.replace("#", "").trim();
        if(hex.length === 3) hex = hex.split('').map(c => c+c).join('');
        if(hex.length !== 6) { setOutput("Enter a valid 6-digit Hex code (e.g., FF5733)"); return; }
        const r = parseInt(hex.substring(0,2), 16), g = parseInt(hex.substring(2,4), 16), b = parseInt(hex.substring(4,6), 16);
        setOutput(`Standard RGB: rgb(${r}, ${g}, ${b})\n\n--- SHADER CODE (Normalized 0.0 - 1.0) ---\nvec4(${(r/255).toFixed(3)}f, ${(g/255).toFixed(3)}f, ${(b/255).toFixed(3)}f, 1.000f)`);
        break;

      case 'fps':
        const fps = parseFloat(input), frames = parseFloat(input2);
        if(!fps || !frames) { setOutput("Enter Target FPS and Frame count."); return; }
        const ms = (frames / fps) * 1000;
        setOutput(`Target Engine Speed: ${fps} FPS\nAnimation Frame Count: ${frames} frames\n\n--- DURATION ---\nMilliseconds: ${ms.toFixed(2)} ms\nSeconds: ${(ms/1000).toFixed(4)} s`);
        break;

      case 'lerp':
        const start = parseFloat(input), end = parseFloat(input2), t = parseFloat(input3);
        if(isNaN(start) || isNaN(end) || isNaN(t)) { setOutput("Enter Start, End, and Time(t)."); return; }
        const res = start + (end - start) * t;
        setOutput(`Lerp (Linear Interpolation)\nStart Point (A): ${start}\nEnd Point (B): ${end}\nTime/Alpha (t): ${t}\n\n--- RESULT ---\nCurrent Interpolated Value: ${res.toFixed(4)}`);
        break;

      case 'fov':
        const hFov = parseFloat(input), aw = parseFloat(input2), ah = parseFloat(input3);
        if(!hFov || !aw || !ah) { setOutput("Please enter Horizontal FOV, Aspect Width, and Height."); return; }
        const vFov = 2 * Math.atan( Math.tan(hFov * Math.PI / 360) * (ah / aw) ) * 180 / Math.PI;
        setOutput(`Horizontal FOV: ${hFov}°\nScreen Aspect Ratio: ${aw}:${ah}\n\n--- RESULT ---\nVertical FOV: ${vFov.toFixed(2)}°\n\n*Many 3D engines (Unity) require Vertical FOV for camera setup.`);
        break;

      case 'tex-mem':
        const tw = parseFloat(input), th = parseFloat(input2), bpp = parseFloat(input3);
        if(!tw || !th || !bpp) { setOutput("Please enter Width, Height, and Bits per Pixel."); return; }
        const bytes = tw * th * (bpp / 8);
        const mb = bytes / 1024 / 1024;
        setOutput(`Texture Map: ${tw} x ${th} px\nColor Depth: ${bpp}-Bit\n\n--- VRAM MEMORY USAGE ---\nMegabytes: ${mb.toFixed(4)} MB\nKilobytes: ${(bytes/1024).toFixed(2)} KB\nBytes: ${bytes.toLocaleString()} bytes`);
        break;

      default: 
        setOutput("Ready to process..."); 
        break;
    }
  };

  // 🛠️ TOOL METADATA (TAMAMEN GÜNCELLENDİ VE ÖLÇÜ BİRİMLERİ EKLENDİ)
  const toolData = {
    "travel-calc": { name: "Travel Expense Engine", how: "Select options from dropdowns. Calculates in 4 currencies.", why: "Instant, algorithm-based corporate travel budget estimations." },
    "stats-calc": { name: "Statistics Engine", how: "Enter comma or space-separated numbers (e.g., 10.5, 20, 35).", why: "Mean, Median, and Standard Deviation for rapid data balancing." },
    "json-csv": { name: "JSON to CSV", how: "Paste raw JSON array text.", why: "Data integration and parsing." },
    "curl-code": { name: "cURL to Code", how: "Paste a cURL request from terminal/postman.", why: "Rapid API endpoint testing and conversion." },
    "jwt-decoder": { name: "JWT Decoder", how: "Paste encoded JWT string.", why: "Privacy-focused local token decoding. No data sent to server." },
    "base64": { name: "Base64 Tool", how: "Paste regular text or Base64 string.", why: "Secure data encoding/decoding for web transmission." },
    "sql-format": { name: "SQL Formatter", how: "Paste unformatted SQL queries.", why: "Enhances query readability and standardizes formatting." },
    "diff-checker": { name: "Diff Checker", how: "Paste Original text on the left, New text on the right.", why: "Immediate version control and code comparison." },
    "markdown": { name: "Markdown Preview", how: "Write Markdown formatting text.", why: "Real-time documentation rendering." },
    "circle-fifths": { name: "Circle of Fifths", how: "Enter Musical Key as note name (e.g., C, F#, Bb).", why: "Calculates subdominant/dominant relations for harmony planning." },
    "harmonics-calc": { name: "Upper Harmonics", how: "Enter base frequency in Hertz (Hz) (e.g., 55, 440).", why: "Identifies mathematical overtones for analog warmth synthesis." },
    "bpm-ms": { name: "BPM to Delay", how: "Enter track tempo in BPM (Beats Per Minute) (e.g., 120).", why: "Calculates precise millisecond (ms) timings for delay/reverb effects." },
    "freq-note": { name: "Freq to Note", how: "Enter pitch frequency in Hertz (Hz) (e.g., 440.5).", why: "Detects nearest MIDI note and detune in cents for synth/kick tuning." },
    "acoustic-calc": { name: "Room Treatment", how: "Enter Width, Length, and Height in Meters (m).", why: "Calculates total surface area (m²) and minimum acoustic panel requirements." },
    // 🎮 GAME DEV TOOLS
    "deg-rad": { name: "Degrees to Radians", how: "Enter rotation angle in Degrees (e.g., 90, 180).", why: "Game engines use Radians for vector math and Quaternions." },
    "aspect-calc": { name: "Resolution Scaler", how: "Enter original Width/Height (px) and Target Width (px).", why: "Maintains aspect ratio for pixel-perfect UI scaling across monitors." },
    "hex-shader": { name: "Color to Shader (0-1)", how: "Enter 6-digit Hex color code (e.g., #FF5733).", why: "Shaders and engine materials require colors in normalized 0.0 - 1.0 float format." },
    "fps-ms": { name: "Frame Timing (FPS)", how: "Enter Engine FPS (e.g., 60) and total Frames (e.g., 12).", why: "Calculates hitstun, animation durations, and network tick rates in milliseconds." },
    "lerp-calc": { name: "Lerp Calculator", how: "Enter Start(A), End(B) points, and Time/Alpha(t: 0.0 - 1.0).", why: "Linear interpolation is the backbone of smooth movement and camera tracking." },
    "fov-calc": { name: "FOV Converter", how: "Enter Horizontal FOV (Deg), and Aspect Ratio (e.g. 16, 9).", why: "Converts Horizontal FOV to Vertical FOV required by Unity/Unreal cameras." },
    "tex-mem": { name: "Texture VRAM Calc", how: "Enter Width (px), Height (px), and Color Bits/Pixel (e.g., 32).", why: "Estimates the raw VRAM memory footprint (MB) of uncompressed textures." }
  };

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">{title}</div>
      {items.map(id => (
        <button key={id} onClick={() => {
            setActiveTab(id); 
            setInput(""); 
            setInput2(""); 
            setInput3(""); 
            setOutput(""); 
            setIsMenuOpen(false);
          }} 
          className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800 active:bg-neutral-700'}`}>
          {toolData[id]?.name}
        </button>
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
          <NavGroup title="Game Dev" items={["deg-rad", "aspect-calc", "hex-shader", "fps-ms", "lerp-calc", "fov-calc", "tex-mem"]} />
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
          <NavGroup title="Game Dev" items={["deg-rad", "aspect-calc", "hex-shader", "fps-ms", "lerp-calc", "fov-calc", "tex-mem"]} />
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
            {["travel-calc", "acoustic-calc", "stats-calc", "circle-fifths", "harmonics-calc", "bpm-ms", "freq-note", "deg-rad", "aspect-calc", "hex-shader", "fps-ms", "lerp-calc", "fov-calc", "tex-mem"].includes(activeTab) ? (
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
                    <input value={input} type="number" placeholder="Width (m) e.g. 4" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" placeholder="Length (m) e.g. 5.5" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input value={input3} type="number" placeholder="Height (m) e.g. 2.8" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "aspect-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={input} type="number" placeholder="Orig Width (px) e.g. 1920" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" placeholder="Orig Height (px) e.g. 1080" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input value={input3} type="number" placeholder="Target Width (px) e.g. 800" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "fps-ms" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={input} type="number" placeholder="Target FPS (e.g. 60)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" placeholder="Frame Count (e.g. 12)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                  </div>
                ) : activeTab === "lerp-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={input} type="number" placeholder="Start Val (A) e.g. 0" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" placeholder="End Val (B) e.g. 100" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input value={input3} type="number" placeholder="Time/Alpha (t) e.g. 0.5" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "fov-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={input} type="number" placeholder="Horiz. FOV (Deg) e.g. 90" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" placeholder="Aspect Width (e.g. 16)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input value={input3} type="number" placeholder="Aspect Height (e.g. 9)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "tex-mem" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={input} type="number" placeholder="Width (px) e.g. 2048" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" placeholder="Height (px) e.g. 2048" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                    <input value={input3} type="number" placeholder="Bits/Pixel (e.g. 32)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                  </div>
                ) : activeTab === "stats-calc" ? (
                  <textarea value={input} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none h-32 focus:border-emerald-500" placeholder="E.g. 10.5, 20.3, 45, 90..." onChange={(e) => setInput(e.target.value)} />
                ) : (
                  <input value={input} type="text" placeholder={toolData[activeTab]?.how || "Enter value..."} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xl md:text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                )}
                
                <button onClick={() => calculateLogic(activeTab.split('-')[0])} className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-900/20 uppercase text-sm tracking-widest">PROCESS DATA</button>
                <pre className="p-4 md:p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-xs md:text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">{output || "Awaiting execution..."}</pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea value={input} className="h-48 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} placeholder="Paste data here..." />
                <textarea value={output} className="h-48 md:h-96 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" readOnly placeholder="Result..." />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-sm mb-12">
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Why it matters</h3>
              <p className="text-neutral-400 leading-relaxed">{toolData[activeTab]?.why}</p>
            </div>
            <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/50">
              <h3 className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Input Guide & Units</h3>
              <p className="text-neutral-400 leading-relaxed">{toolData[activeTab]?.how}</p>
            </div>
          </div>
          
        </div>
        <footer className="p-6 border-t border-neutral-800 text-[10px] text-neutral-600 text-center mt-auto italic font-mono">Analog heart, digital precision. © 2026 ConverterLab</footer>
      </main>
    </div>
  );
}