"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("landed-cost");
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [output, setOutput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ TRY: 33.0, EUR: 0.93, GBP: 0.79, USD: 1 });

  const [travelForm, setTravelForm] = useState({
    destVal: "1.0", destName: "Global Average", days: "1", hotel: "1", food: "70", transport: "15", currency: "USD"
  });

  const initLandedForm = {
    route: "TR_EU", tradeType: "standard", freightMethod: "air", val: "", curr: "USD", l: "", w: "", h: "", weight: "", frRate: "", duty: "20", vat: "20", ins: "", extra: ""
  };
  const [landedForm, setLandedForm] = useState(initLandedForm);

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
    const keysSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    
    switch(type) {
      // 🚢 GÜMRÜK VE LOJİSTİK MOTORU
      case 'landed':
        const val = parseFloat(landedForm.val);
        const l = parseFloat(landedForm.l), w = parseFloat(landedForm.w), h = parseFloat(landedForm.h);
        const kg = parseFloat(landedForm.weight);
        
        let dutyRate = parseFloat(landedForm.duty) || 0;
        let vatRate = parseFloat(landedForm.vat) || 0;

        if (isNaN(val) || isNaN(l) || isNaN(w) || isNaN(h) || isNaN(kg)) {
          setOutput("⚠️ ERROR: Goods Value, Box Dimensions (L,W,H), and Actual Weight are mandatory fields.");
          return;
        }

        let autoNotes = [];
        let frRate = parseFloat(landedForm.frRate);
        let transitDays = "";
        let dispatchNote = "";

        if (landedForm.freightMethod === "air") {
            transitDays = "1 - 5 Days";
            dispatchNote = "Airway Bill (AWB) cutoff is usually 24-48h prior to flight departure.";
            if (isNaN(frRate) || frRate <= 0) {
                if (landedForm.route === "TR_EU") frRate = 4.5;
                else if (landedForm.route === "TR_US") frRate = 6.5;
                else if (landedForm.route === "CN_TR") frRate = 8.0;
                else frRate = 5.0;
            }
        } else if (landedForm.freightMethod === "sea") {
            transitDays = "20 - 45 Days";
            dispatchNote = "Bill of Lading (B/L) closing is usually 3-5 days before vessel departure.";
            if (isNaN(frRate) || frRate <= 0) {
                if (landedForm.route === "TR_EU") frRate = 0.5;
                else if (landedForm.route === "TR_US") frRate = 1.2;
                else if (landedForm.route === "CN_TR") frRate = 0.8;
                else frRate = 1.0;
            }
        } else if (landedForm.freightMethod === "road") {
            transitDays = "7 - 14 Days";
            dispatchNote = "CMR/Truck dispatch requires booking and loading 2-3 days in advance.";
            if (isNaN(frRate) || frRate <= 0) {
                if (landedForm.route === "TR_EU") frRate = 1.5;
                else if (landedForm.route === "TR_US") { frRate = 6.5; transitDays = "N/A (Use Air/Sea)"; }
                else if (landedForm.route === "CN_TR") { frRate = 3.5; transitDays = "18 - 25 Days"; }
                else frRate = 2.0;
            }
        }

        if (isNaN(parseFloat(landedForm.frRate)) || parseFloat(landedForm.frRate) <= 0) {
             autoNotes.push(`• Freight Rate: Estimated at ${frRate} ${landedForm.curr}/kg based on ${landedForm.freightMethod.toUpperCase()} freight for the selected route.`);
        }

        let insRate = parseFloat(landedForm.ins);
        if (isNaN(insRate)) {
            insRate = 1.0;
            autoNotes.push(`• Insurance: Defaulted to industry standard 1.0% of Goods Value.`);
        }
        
        let extra = parseFloat(landedForm.extra);
        if (isNaN(extra)) {
            if (landedForm.tradeType === "b2c") extra = 5.0;
            else if (landedForm.tradeType === "ata_carnet") extra = 250.0;
            else extra = 150.0;
            autoNotes.push(`• Extra Fees: Estimated at ${extra} ${landedForm.curr} for standard ${landedForm.tradeType.toUpperCase()} customs clearance & storage.`);
        }

        let tradeMsg = `🏦 CUSTOMS BASIS (CIF VALUE)\n`;
        if (landedForm.tradeType === "ata_carnet") {
            dutyRate = 0;
            vatRate = 0;
            tradeMsg = `🎟️ ATA CARNET (EXHIBITION / TEMP EXPORT) APPLIED\n* Duty & VAT are exempted for temporary exhibition goods returning in original state.\n\n🏦 CUSTOMS BASIS (CIF VALUE)\n`;
        }

        const insAmt = val * (insRate / 100);
        const volKg = (l * w * h) / 5000;
        const chargeableKg = Math.max(kg, volKg);
        const freightCost = chargeableKg * frRate;
        const cif = val + freightCost + insAmt;
        const dutyAmt = cif * (dutyRate / 100);
        const vatBase = cif + dutyAmt; 
        const vatAmt = vatBase * (vatRate / 100);
        const totalLanded = cif + dutyAmt + vatAmt + extra;

        const curr = landedForm.curr;
        const fmt = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(amt);

        let warnMsg = "";
        if (dutyRate >= 30 && val > 30 && landedForm.tradeType === "b2c" && (curr === "EUR" || curr === "USD")) {
          warnMsg = "\n⚠️ WARNING: B2C personal imports above 30 EUR/USD limit may be subject to commercial customs procedures in TR.";
        }

        let autoFillText = "";
        if (autoNotes.length > 0) {
            autoFillText = `\n\n💡 AUTO-ESTIMATES APPLIED\n------------------------------------------\nSince some fields were left blank, the system applied standard industry estimates:\n${autoNotes.join('\n')}\n* For exact results, input real quotes from your forwarder.`;
        }

        setOutput(
          `🚢 GLOBAL LANDED COST REPORT\n` +
          `==========================================\n` +
          `⏱️ TRANSIT & LOGISTICS\n` +
          `Method        : ${landedForm.freightMethod.toUpperCase()} FREIGHT\n` +
          `Est. Transit  : ${transitDays}\n` +
          `Dispatch Rule : ${dispatchNote}\n\n` +
          `📦 FREIGHT CALCULATION (Route: ${landedForm.route.replace('_', ' ➡️ ')})\n` +
          `Dimensions    : ${l}x${w}x${h} cm\n` +
          `Actual Weight : ${kg.toFixed(2)} kg\n` +
          `Volumetric Wt : ${volKg.toFixed(2)} kg (IATA Divisor: 5000)\n` +
          `Chargeable Wt : ${chargeableKg.toFixed(2)} kg\n` +
          `Freight Cost  : ${fmt(freightCost)} (${fmt(frRate)}/kg)\n\n` +
          tradeMsg +
          `Goods Value   : ${fmt(val)}\n` +
          `Insurance     : ${fmt(insAmt)} (${insRate}% of Goods)\n` +
          `CIF Matrah    : ${fmt(cif)}\n\n` +
          `⚖️ TAXES & DUTIES\n` +
          `Customs Duty  : ${fmt(dutyAmt)} (${dutyRate}% of CIF)\n` +
          `VAT Base      : ${fmt(vatBase)} (CIF + Duty)\n` +
          `VAT Tax       : ${fmt(vatAmt)} (${vatRate}%)\n` +
          `Broker/Extra  : ${fmt(extra)}\n` +
          `------------------------------------------\n` +
          `💰 TOTAL LANDED COST: ${fmt(totalLanded)}\n` + warnMsg + autoFillText
        );
        break;

      // ✈️ SEYAHAT MOTORU
      case 'travel':
        const tDays = parseInt(travelForm.days);
        if(!tDays || tDays <= 0 || tDays > 365) { setOutput("⚠️ ERROR: Duration must be between 1 and 365 days."); return; }
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

      // 🎮 GAME DEV MOTORLARI
      case 'pixel':
        const bW = parseFloat(input);
        const bH = parseFloat(input2);
        const targetRatioStr = input3.trim() || "16:9";
        
        if (isNaN(bW) || isNaN(bH) || bW <= 0 || bH <= 0) {
            setOutput("⚠️ ERROR: Please enter a valid Base Width and Height (e.g., 1920 and 1080)."); return;
        }
        
        const ratioParts = targetRatioStr.split(':');
        if (ratioParts.length !== 2 || isNaN(parseFloat(ratioParts[0])) || isNaN(parseFloat(ratioParts[1]))) {
            setOutput("⚠️ ERROR: Target Ratio must be in 'W:H' format (e.g., 21:9 or 4:3)."); return;
        }
        
        const tRW = parseFloat(ratioParts[0]);
        const tRH = parseFloat(ratioParts[1]);
        const baseRatio = bW / bH;
        const targetRatio = tRW / tRH;

        let scaleResult = "";
        let advice = "";
        
        if (Math.abs(baseRatio - targetRatio) < 0.01) {
            scaleResult = "🟢 Perfect Match!";
            advice = "No scaling issues. UI will fit perfectly without distortion.";
        } else if (targetRatio > baseRatio) {
            scaleResult = "🟡 Pillarboxing Occurs (Black Bars on Left/Right)";
            advice = "Target screen is WIDER than base UI (e.g. Ultrawide). Ensure UI elements are anchored to the edges (Left/Right).";
        } else {
            scaleResult = "🔴 Letterboxing Occurs (Black Bars on Top/Bottom)";
            advice = "Target screen is TALLER than base UI (e.g. iPad 4:3). Make sure your top/bottom elements aren't anchored absolutely.";
        }
        
        setOutput(`🎮 PIXEL PERFECT UI SCALER\n==========================================\nBase Resolution : ${bW}x${bH} (Ratio: ${baseRatio.toFixed(3)})\nTarget Screen   : ${targetRatioStr} (Ratio: ${targetRatio.toFixed(3)})\n\n--- SCALE RESULT ---\n${scaleResult}\n\n💡 Dev Advice:\n${advice}`);
        break;

      case 'shader':
        const xVal = parseFloat(input);
        const easeType = input2 || "smoothstep";
        const exponent = parseFloat(input3) || 2;
        
        if (isNaN(xVal) || xVal < 0 || xVal > 1) {
            setOutput("⚠️ ERROR: Input X must be between 0.0 and 1.0."); return;
        }
        
        let yVal = 0;
        if (easeType === "smoothstep") {
            yVal = xVal * xVal * (3.0 - 2.0 * xVal);
        } else if (easeType === "pow") {
            yVal = Math.pow(xVal, exponent);
        } else if (easeType === "sine") {
            yVal = Math.sin(xVal * Math.PI / 2); 
        }

        const barLength = 30;
        const filled = Math.max(0, Math.min(barLength, Math.round(yVal * barLength)));
        const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

        setOutput(`🔮 SHADER EASING VISUALIZER\n==========================================\nFunction : ${easeType.toUpperCase()}\nInput X  : ${xVal.toFixed(3)}\n\n--- MATH RESULT ---\nOutput Y : ${yVal.toFixed(4)}\n\nCurve Vis: [${bar}]`);
        break;

      case 'dot':
        const surfAngle = parseFloat(input);
        const lightAngle = parseFloat(input2);
        if (isNaN(surfAngle) || isNaN(lightAngle)) {
            setOutput("⚠️ ERROR: Please enter valid angles in degrees (e.g., 0 and 45)."); return;
        }
        
        const diffRad = (lightAngle - surfAngle) * (Math.PI / 180);
        const dotProd = Math.cos(diffRad);
        const brightness = Math.max(0, dotProd);

        let lightDesc = "";
        if (brightness > 0.9) lightDesc = "☀️ Direct Hit (Max Brightness / Specular)";
        else if (brightness > 0.4) lightDesc = "🌤️ Half Lit (Diffuse Area)";
        else if (brightness > 0.0) lightDesc = "⛅ Penumbra (Shadow Edge)";
        else lightDesc = "🌑 Dark (Self-shadowed / Backface)";

        setOutput(`🔦 VECTOR DOT PRODUCT (LIGHTING)\n==========================================\nSurface Normal Angle : ${surfAngle}°\nLight Source Angle   : ${lightAngle}°\n\n--- CALCULATION ---\nDot Product (Cos θ)  : ${dotProd.toFixed(4)}\nClamped Brightness   : ${brightness.toFixed(4)}\n\n💡 Shader State:\n${lightDesc}\n\n*Note: In shaders, dot(N, L) < 0 means the light hits the back of the object.`);
        break;

      // 🎶 MÜZİK MOTORLARI
      case 'freq':
        const hz = parseFloat(input);
        if(isNaN(hz) || hz < 10 || hz > 20000) { setOutput("⚠️ ERROR: Frequency must be a valid number between 10 Hz and 20000 Hz."); return; }
        const midi = 12 * (Math.log2(hz / 440)) + 69;
        const roundedMidi = Math.round(midi);
        const exactFreq = 440 * Math.pow(2, (roundedMidi - 69) / 12);
        const cents = Math.round(1200 * Math.log2(hz / exactFreq));
        setOutput(`Detected Note: ${keysSharp[roundedMidi % 12]}${Math.floor(roundedMidi / 12) - 1}\nMIDI Note Number: ${roundedMidi}\nPerfect Pitch Freq: ${exactFreq.toFixed(2)} Hz\nDetune: ${cents > 0 ? '+' : ''}${cents} Cents`);
        break;

      case 'bpm':
        const bpmVal = parseFloat(input);
        if(isNaN(bpmVal) || bpmVal <= 0 || bpmVal > 999) { setOutput("⚠️ ERROR: BPM must be a positive number between 1 and 999."); return; }
        const bpmMs = (60000 / bpmVal).toFixed(2);
        setOutput(`1/4 Note (Quarter): ${bpmMs} ms\n1/8 Note (Eighth): ${(bpmMs/2).toFixed(2)} ms\n1/16 Note (Sixteenth): ${(bpmMs/4).toFixed(2)} ms`);
        break;

      case 'acoustic':
        const acW = parseFloat(input), acL = parseFloat(input2);
        let acH = parseFloat(input3);
        let autoHNote = "";

        if(isNaN(acW) || isNaN(acL) || acW <= 0 || acL <= 0) { 
            setOutput("⚠️ ERROR: Room Width and Length are mandatory fields (> 0 meters)."); return; 
        }

        // AKUSTİK MOTORU İÇİN AKILLI TAHMİN (AUTO-ESTIMATE)
        if(isNaN(acH) || acH <= 0) {
            acH = 2.8;
            autoHNote = "\n\n💡 AUTO-ESTIMATE APPLIED:\nCeiling height left blank. System defaulted to standard 2.8 meters.";
        }

        const area = 2 * (acW * acL + acL * acH + acW * acH);
        setOutput(`Total Room Surface Area: ${area.toFixed(1)} m²\n\n--- MINIMUM TREATMENT REQUIREMENTS ---\nAbsorption Panels (18%): ${(area * 0.18).toFixed(1)} m²\nDiffusion Panels (7%): ${(area * 0.07).toFixed(1)} m²${autoHNote}`);
        break;

      case 'circle':
        const cleanNote = input.trim().charAt(0).toUpperCase() + input.trim().slice(1).toLowerCase();
        const noteMap = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
        const rootIdx = noteMap[cleanNote];
        if(rootIdx === undefined) { setOutput("⚠️ ERROR: Invalid note format. Please enter a valid root note (e.g. C, F#, Bb, Eb)."); return; }
        const subdominant = keysSharp[(rootIdx + 5) % 12];
        const dominant = keysSharp[(rootIdx + 7) % 12];
        const relMinor = keysSharp[(rootIdx + 9) % 12];
        setOutput(`ROOT KEY: ${keysSharp[rootIdx]} Major / ${cleanNote !== keysSharp[rootIdx] ? '('+cleanNote+' Major)' : ''}\n==========================================\nPerfect 4th (Subdominant) : ${subdominant} Major\nPerfect 5th (Dominant)    : ${dominant} Major\nRelative Minor Scale      : ${relMinor} Minor (${relMinor}m)\n\n*Use these chords for foundational harmonic progressions.`);
        break;

      case 'pitch':
        const origBpm = parseFloat(input);
        const semitones = parseFloat(input2);
        if(isNaN(origBpm) || origBpm <= 0) { setOutput("⚠️ ERROR: Original BPM must be a positive number."); return; }
        if(isNaN(semitones)) { setOutput("⚠️ ERROR: Semitone shift must be a valid number (e.g., 3 or -2)."); return; }
        const newBpm = origBpm * Math.pow(2, semitones / 12);
        setOutput(`Original BPM: ${origBpm}\nPitch Shift: ${semitones > 0 ? '+' : ''}${semitones} Semitones\n\n--- REPITCH RESULT ---\nNew Target BPM: ${newBpm.toFixed(2)}\n\n*Pitching a sample UP speeds it up. Pitching it DOWN slows it down.`);
        break;

      case 'note-freq':
        const noteRegex = /^([a-gA-G])([#b]?)(-?\d+)$/;
        const match = input.trim().match(noteRegex);
        if(!match) { setOutput("⚠️ ERROR: Invalid format. Please enter a Note and Octave (e.g., C4, F#3, Bb2)."); return; }
        const nLetter = match[1].toUpperCase();
        const nAccidental = match[2].toLowerCase();
        const nOctave = parseInt(match[3]);
        const nMap = { "C":0, "D":2, "E":4, "F":5, "G":7, "A":9, "B":11 };
        let baseMidi = nMap[nLetter];
        if(nAccidental === '#') baseMidi += 1;
        if(nAccidental === 'b') baseMidi -= 1;
        const finalMidi = baseMidi + ((nOctave + 1) * 12);
        const finalFreq = 440 * Math.pow(2, (finalMidi - 69) / 12);
        setOutput(`Input Note: ${nLetter}${nAccidental}${nOctave}\nMIDI Note Number: ${finalMidi}\n\n--- FREQUENCY RESULT ---\nExact Frequency: ${finalFreq.toFixed(2)} Hz\n\n*A4 is standard tuning reference at 440 Hz.`);
        break;

      default: 
        setOutput("Ready to process..."); 
        break;
    }
  };

  const toolData = {
    // 💼 BİZNES & DATA
    "travel-calc": { name: "Travel Expense Engine", how: "Select options from dropdowns. Range: 1-365 Days.", why: "Instant, algorithm-based corporate travel budget estimations." },
    "landed-cost": { name: "Global Landed Cost", how: "Select Route/Trade Type. Enter Value & Wt. Blank fields auto-estimate.", why: "AI-assisted broker simulator for transit times, CIF duties, and ATA Carnets." },
    
    // 💻 GELİŞTİRİCİ
    "json-csv": { name: "JSON to CSV", how: "Paste raw JSON array text.", why: "Rapid data integration and database parsing." },
    "curl-code": { name: "cURL to Code", how: "Paste a cURL request from terminal/postman.", why: "Instant API endpoint testing and code conversion." },
    "jwt-decoder": { name: "JWT Decoder", how: "Paste encoded JWT string.", why: "Privacy-focused token decoding. No server calls are made." },
    "sql-format": { name: "SQL Formatter", how: "Paste unformatted SQL queries.", why: "Enhances query readability and standardizes formatting." },
    "diff-checker": { name: "Diff Checker", how: "Paste Original text (left) & New text (right).", why: "Immediate version control and code comparison." },
    
    // 🎶 MÜZİK LAB
    "circle-fifths": { name: "Circle of Fifths", how: "Enter Root Note (e.g. C, F#, Db, Bb). String Input.", why: "Calculates perfect 4th, 5th, and relative minor keys for harmony." },
    "pitch-shift": { name: "Pitch Shift BPM", how: "Enter Original BPM (e.g. 120) and Shift in Semitones (+/-).", why: "Calculates the exact new BPM of an audio sample when re-pitched." },
    "note-freq": { name: "Note to Frequency", how: "Enter Note and Octave (e.g. C4, F#3, Bb2). String Input.", why: "Identifies the Hertz (Hz) value of a specific MIDI note for LFO design." },
    "bpm-ms": { name: "BPM to Delay", how: "Enter track tempo (Range: 1 - 999 BPM).", why: "Calculates precise millisecond (ms) timings for delay/reverb effects." },
    "freq-note": { name: "Freq to Note Analyzer", how: "Enter pitch frequency (Range: 10 - 20000 Hz).", why: "Detects nearest MIDI note and detune in cents for kick drum tuning." },
    "acoustic-calc": { name: "Room Treatment", how: "Enter W/L. Leave Height blank for 2.8m standard.", why: "Calculates surface area and minimum acoustic panel requirements." },
    
    // 🎮 GAME DEV (PREMIUM)
    "pixel-perfect": { name: "Pixel UI Scaler", how: "Enter Base W/H and Target Ratio (e.g. 21:9).", why: "Calculates letterboxing to prevent UI stretching on ultrawide screens." },
    "shader-easing": { name: "Shader Easing Vis", how: "Select function & enter X (0.0 to 1.0).", why: "Instantly test math curves (Smoothstep, Pow) for smooth animations." },
    "dot-product": { name: "Vector Dot Product", how: "Enter Surface Angle & Light Angle (Degrees).", why: "Simulates shader lighting math based on surface normals." }
  };

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-neutral-600 uppercase mb-2 px-4 tracking-tighter">{title}</div>
      {items.map(id => (
        <button key={id} onClick={() => {
            setActiveTab(id); 
            setInput(""); setInput2(""); setInput3(""); 
            setOutput(""); 
            setLandedForm(initLandedForm);
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
          {/* MENÜ TERTEMİZ: GEREKSİZLER ATILDI */}
          <NavGroup title="Business & Data" items={["travel-calc", "landed-cost"]} />
          <NavGroup title="Developer Tools" items={["json-csv", "curl-code", "jwt-decoder", "sql-format", "diff-checker"]} />
          <NavGroup title="Music Lab" items={["circle-fifths", "pitch-shift", "note-freq", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev" items={["pixel-perfect", "shader-easing", "dot-product"]} />
        </div>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-white tracking-tighter italic">Converter<span className="text-emerald-500">Lab</span></h1>
            <button onClick={() => setIsMenuOpen(false)} className="text-emerald-500 font-bold border border-emerald-500/20 px-4 py-2 rounded-full text-xs">✕ CLOSE</button>
          </div>
          <NavGroup title="Business & Data" items={["travel-calc", "landed-cost"]} />
          <NavGroup title="Dev Tools" items={["json-csv", "curl-code", "jwt-decoder", "sql-format", "diff-checker"]} />
          <NavGroup title="Music Lab" items={["circle-fifths", "pitch-shift", "note-freq", "bpm-ms", "freq-note", "acoustic-calc"]} />
          <NavGroup title="Game Dev" items={["pixel-perfect", "shader-easing", "dot-product"]} />
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
            {["travel-calc", "landed-cost", "acoustic-calc", "circle-fifths", "pitch-shift", "note-freq", "bpm-ms", "freq-note", "pixel-perfect", "shader-easing", "dot-product"].includes(activeTab) ? (
              <div className="space-y-6">
                
                {/* 🚢 GLOBAL LANDED COST UI */}
                {activeTab === "landed-cost" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    <div className="md:col-span-1 lg:col-span-2">
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, route: e.target.value})}>
                        <option value="TR_EU">🇹🇷 TR ➡️ 🇪🇺 EU / 🇬🇧 UK (Export)</option>
                        <option value="TR_US">🇹🇷 TR ➡️ 🇺🇸 US (Export)</option>
                        <option value="CN_TR">🇨🇳 CN ➡️ 🇹🇷 TR (Import)</option>
                        <option value="GLOBAL">🌍 Global ➡️ Global (Standard)</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Select route for auto-freight estimation.</p>
                    </div>
                    
                    <div className="md:col-span-1">
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, tradeType: e.target.value})}>
                        <option value="standard">📦 Standard Trade</option>
                        <option value="ata_carnet">🎟️ ATA Carnet</option>
                        <option value="b2c">🛒 B2C Personal</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Customs logic.</p>
                    </div>

                    <div className="md:col-span-1">
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, freightMethod: e.target.value})}>
                        <option value="air">✈️ Air Freight</option>
                        <option value="sea">🚢 Sea Freight</option>
                        <option value="road">🚛 Road Freight</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Transport method.</p>
                    </div>

                    <div className="md:col-span-1 lg:col-span-2 flex gap-2">
                      <div className="flex-1">
                        <input value={landedForm.val} type="number" min="0" step="any" placeholder="Goods Value *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, val: e.target.value})} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">FOB Invoice value (Req).</p>
                      </div>
                      <div>
                        <select className="h-[54px] bg-black border border-neutral-800 rounded-xl p-2 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, curr: e.target.value})}>
                          <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="TRY">TRY</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <input value={landedForm.weight} type="number" min="0" step="any" placeholder="Actual Weight *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, weight: e.target.value})} />
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Gross weight in kg (Req).</p>
                    </div>

                    <div>
                      <input value={landedForm.frRate} type="number" min="0" step="any" placeholder="Freight Rate" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, frRate: e.target.value})} />
                      <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Rate/kg. Leave blank for auto.</p>
                    </div>

                    <div className="md:col-span-1 lg:col-span-1 grid grid-cols-3 gap-2">
                        <input value={landedForm.l} type="number" min="0" step="any" placeholder="L*" className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 text-center" onChange={(e) => setLandedForm({...landedForm, l: e.target.value})} />
                        <input value={landedForm.w} type="number" min="0" step="any" placeholder="W*" className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 text-center" onChange={(e) => setLandedForm({...landedForm, w: e.target.value})} />
                        <input value={landedForm.h} type="number" min="0" step="any" placeholder="H*" className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 text-center" onChange={(e) => setLandedForm({...landedForm, h: e.target.value})} />
                    </div>

                    <div>
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, duty: e.target.value})}>
                        <option value="20">Duty: Gen. Import 20%</option>
                        <option value="0">Duty: EU Origin 0%</option>
                        <option value="30">Duty: B2C EU 30%</option>
                        <option value="60">Duty: B2C Other 60%</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Customs tax %.</p>
                    </div>
                    
                    <div>
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, vat: e.target.value})}>
                        <option value="20">VAT 20%</option><option value="10">VAT 10%</option><option value="1">VAT 1%</option><option value="0">VAT 0%</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Value added tax %.</p>
                    </div>

                    <div>
                      <input value={landedForm.ins} type="number" min="0" step="any" placeholder="Insurance %" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, ins: e.target.value})} />
                      <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Leave blank to use standard 1%.</p>
                    </div>

                    <div className="md:col-span-1 lg:col-span-2">
                      <input value={landedForm.extra} type="number" min="0" step="any" placeholder="Extra Fees" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, extra: e.target.value})} />
                      <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Broker/Storage amt. Blank = Auto.</p>
                    </div>
                  </div>

                {/* 🎮 GAME DEV ARAÇLARI UI */}
                ) : activeTab === "pixel-perfect" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input value={input} type="number" min="1" step="1" placeholder="Base W (e.g. 1920) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Base Canvas Width (Req)</p>
                    </div>
                    <div>
                        <input value={input2} type="number" min="1" step="1" placeholder="Base H (e.g. 1080) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Base Canvas Height (Req)</p>
                    </div>
                    <div>
                        <input value={input3} type="text" placeholder="Target Ratio (e.g. 21:9)" className="w-full bg-black border border-neutral-800 rounded-xl p-4 font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                        <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Leave blank for default 16:9</p>
                    </div>
                  </div>

                ) : activeTab === "shader-easing" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input value={input} type="number" min="0" max="1" step="0.01" placeholder="Input X (0.0 to 1.0) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Time or Base Value (Req)</p>
                    </div>
                    <div>
                        <select value={input2} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)}>
                            <option value="smoothstep">Smoothstep(0,1,x)</option>
                            <option value="pow">Pow(x, Exp)</option>
                            <option value="sine">Sine Ease-Out</option>
                        </select>
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Easing Function</p>
                    </div>
                    <div>
                        <input value={input3} type="number" step="0.1" placeholder="Pow Exponent (e.g. 2)" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Only used if Pow selected</p>
                    </div>
                  </div>

                ) : activeTab === "dot-product" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input value={input} type="number" step="any" placeholder="Surface Angle (Deg, e.g. 90) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Direction surface is facing (Req)</p>
                    </div>
                    <div>
                        <input value={input2} type="number" step="any" placeholder="Light Angle (Deg, e.g. 45) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Direction of incoming light (Req)</p>
                    </div>
                  </div>

                // ✈️ TRAVEL
                ) : activeTab === "travel-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => { const selected = destinations.find(d => d.val === e.target.value); setTravelForm({...travelForm, destVal: e.target.value, destName: selected.name}); }}>
                      {destinations.map(d => <option key={d.name} value={d.val}>{d.name}</option>)}
                    </select>
                    <div className="flex border border-neutral-800 rounded-xl bg-black overflow-hidden focus-within:border-emerald-500">
                      <span className="p-4 text-neutral-500 text-sm flex items-center bg-neutral-900/50">Days</span>
                      <input type="number" min="1" max="365" className="w-full bg-transparent p-4 text-base font-mono text-emerald-400 outline-none" value={travelForm.days} onChange={(e) => setTravelForm({...travelForm, days: e.target.value})} />
                    </div>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, currency: e.target.value})}>
                      <option value="USD">💵 USD</option><option value="EUR">💶 EUR</option><option value="TRY">₺ TRY</option><option value="GBP">£ GBP</option>
                    </select>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, hotel: e.target.value})}>
                      <option value="1">🏨 3★ Economy</option><option value="1.8">🏨 4★ Business</option><option value="3.5">🏨 5★ Executive</option>
                    </select>
                    <select defaultValue="70" className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, food: e.target.value})}>
                      <option value="30">🍔 Fast Food</option><option value="70">🍽️ Standard</option><option value="150">🍷 Fine Dining</option>
                    </select>
                    <select className="bg-black border border-neutral-800 rounded-xl p-4 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setTravelForm({...travelForm, transport: e.target.value})}>
                      <option value="15">🚇 Public Transport</option><option value="50">🚕 Taxi / Uber</option><option value="70">🚗 Rent a Car</option>
                    </select>
                  </div>

                // 🎸 AKUSTİK (AKILLI TAHMİN)
                ) : activeTab === "acoustic-calc" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input value={input} type="number" min="0.1" step="0.1" placeholder="Width (m) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Room width (Req).</p>
                    </div>
                    <div>
                        <input value={input2} type="number" min="0.1" step="0.1" placeholder="Length (m) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Room length (Req).</p>
                    </div>
                    <div>
                        <input value={input3} type="number" min="0.1" step="0.1" placeholder="Height (m)" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput3(e.target.value)} />
                        <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Leave blank for standard 2.8m.</p>
                    </div>
                  </div>

                // 🎛️ BPM PITCH
                ) : activeTab === "pitch-shift" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={input} type="number" min="1" step="any" placeholder="Original BPM (e.g. 120)" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" step="1" placeholder="Semitones (+ or -) e.g. -2, 3" className="bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                  </div>

                // 📝 STRING GİRDİLERİ
                ) : ["circle-fifths", "note-freq"].includes(activeTab) ? (
                  <input value={input} type="text" placeholder={toolData[activeTab]?.how} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xl md:text-2xl font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />

                // 🔢 STANDART SAYI GİRDİLERİ
                ) : (
                  <input value={input} type="number" min="0" step="any" placeholder={toolData[activeTab]?.how} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xl md:text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                )}
                
                <button onClick={() => calculateLogic(activeTab.split('-')[0])} className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-900/20 uppercase text-sm tracking-widest">PROCESS DATA</button>
                <pre className="p-4 md:p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-xs md:text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">{output || "Awaiting execution..."}</pre>
              </div>

            // 💻 GELİŞTİRİCİ ARAÇLARI (TEXTAREA)
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
        
        <footer className="p-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 px-6 md:px-12 gap-4 mt-auto font-mono">
          <div>Analog heart, digital precision. © 2026 ConverterLab</div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-emerald-500 transition-colors uppercase tracking-wider">Privacy Policy</a>
            <a href="/terms" className="hover:text-emerald-500 transition-colors uppercase tracking-wider">Terms of Use</a>
          </div>
        </footer>

      </main>
    </div>
  );
}