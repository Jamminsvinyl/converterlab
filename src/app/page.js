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
    route: "GLOBAL", tradeType: "standard", freightMethod: "air", incoterm: "FOB", 
    val: "", curr: "USD", cartons: "1", l: "", w: "", h: "", weight: "", 
    frRate: "", originFee: "", duty: "20", sct: "0", vat: "20", ins: "", extra: ""
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
      // 🚢 GÜMRÜK VE LOJİSTİK MOTORU (NİHAİ 2026 VERSİYONU)
      case 'landed-cost': {
        const val = parseFloat(landedForm.val);
        const l = parseFloat(landedForm.l), w = parseFloat(landedForm.w), h = parseFloat(landedForm.h);
        const weightPerCtn = parseFloat(landedForm.weight);
        const cartons = parseInt(landedForm.cartons) || 1;
        
        const dutyRate = parseFloat(landedForm.duty) || 0;
        const sctRate = parseFloat(landedForm.sct) || 0;
        const vatRate = parseFloat(landedForm.vat) || 0;

        if (isNaN(val) || isNaN(l) || isNaN(w) || isNaN(h) || isNaN(weightPerCtn)) {
          setOutput("⚠️ ERROR: Goods Value, Box Dimensions (L,W,H), and Weight per Carton are mandatory fields.");
          return;
        }

        const totalKg = weightPerCtn * cartons;
        const totalCBM = (l * w * h * cartons) / 1000000;
        
        let chargeableWt = 0;
        let chargeableUnit = "";
        let volKg = 0;
        let transitDays = "";
        let dispatchNote = "";
        let defaultFrRate = 0;

        if (landedForm.freightMethod === "air") {
            volKg = (l * w * h * cartons) / 5000;
            chargeableWt = Math.max(totalKg, volKg);
            chargeableUnit = "kg";
            transitDays = "1 - 5 Days"; dispatchNote = "AWB cutoff is usually 24-48h prior to flight.";
            if (landedForm.route === "TR_EU") defaultFrRate = 4.5;
            else if (landedForm.route === "TR_US") defaultFrRate = 6.5;
            else if (landedForm.route === "CN_TR") defaultFrRate = 8.0;
            else defaultFrRate = 5.0;
        } else if (landedForm.freightMethod === "road") {
            volKg = (l * w * h * cartons) / 3000;
            chargeableWt = Math.max(totalKg, volKg);
            chargeableUnit = "kg";
            transitDays = "7 - 14 Days"; dispatchNote = "CMR requires booking 2-3 days in advance.";
            if (landedForm.route === "TR_EU") defaultFrRate = 1.5;
            else if (landedForm.route === "CN_TR") defaultFrRate = 3.5;
            else defaultFrRate = 2.0;
        } else if (landedForm.freightMethod === "sea") {
            chargeableWt = Math.max(totalCBM, totalKg / 1000);
            chargeableUnit = "CBM/Ton";
            transitDays = "20 - 45 Days"; dispatchNote = "B/L closing is usually 3-5 days before vessel.";
            if (landedForm.route === "TR_EU") defaultFrRate = 50;
            else if (landedForm.route === "TR_US") defaultFrRate = 120;
            else if (landedForm.route === "CN_TR") defaultFrRate = 80;
            else defaultFrRate = 100;
        }

        let autoNotes = [];
        let frRate = parseFloat(landedForm.frRate);
        if (isNaN(frRate) || frRate <= 0) {
            frRate = defaultFrRate;
            autoNotes.push(`• Freight Rate: Left blank. Auto-applied standard ${landedForm.freightMethod.toUpperCase()} rate of ${frRate} ${landedForm.curr} per ${chargeableUnit}.`);
        }

        let originFee = parseFloat(landedForm.originFee);
        if (landedForm.incoterm === "EXW" && (isNaN(originFee) || originFee < 0)) {
            originFee = 100;
            autoNotes.push(`• Origin Charges: Left blank for EXW. Auto-applied standard 100 ${landedForm.curr} for local transport/customs at origin.`);
        } else if (isNaN(originFee) || originFee < 0) {
            originFee = 0;
        }

        let insRate = parseFloat(landedForm.ins);
        if (isNaN(insRate)) { 
            insRate = 1.0; 
            autoNotes.push(`• Insurance: Left blank. Auto-applied ICC(A) standard 1.0% of Goods Value.`); 
        }
        
        let extra = parseFloat(landedForm.extra);
        if (isNaN(extra)) {
            if (landedForm.tradeType === "b2c") extra = 25.0;
            else if (landedForm.tradeType === "ata_carnet") extra = 250.0;
            else extra = 150.0;
            autoNotes.push(`• Local/Broker Fees: Left blank. Auto-applied ${extra} ${landedForm.curr} for standard destination clearance & storage.`);
        }

        let freightCost = chargeableWt * frRate;
        let insAmt = val * (insRate / 100);
        let cif = 0;
        let incotermNote = "";

        if (landedForm.incoterm === "CIF") {
            freightCost = 0; insAmt = 0; originFee = 0;
            cif = val;
            incotermNote = "* CIF selected: Freight and Insurance are assumed to be included in the Goods Value.\n";
        } else if (landedForm.incoterm === "FOB") {
            originFee = 0;
            cif = val + freightCost + insAmt;
            incotermNote = "* FOB selected: Origin charges are paid by shipper. Freight & Insurance added to CIF.\n";
        } else if (landedForm.incoterm === "EXW") {
            cif = val + originFee + freightCost + insAmt;
            incotermNote = "* EXW selected: Buyer pays all. Origin charges, Freight, and Insurance added to CIF.\n";
        }

        const dutyAmt = cif * (dutyRate / 100);
        const sctAmt = (cif + dutyAmt) * (sctRate / 100);
        const vatBase = cif + dutyAmt + sctAmt + extra; 
        const vatAmt = vatBase * (vatRate / 100);
        
        const totalLanded = cif + dutyAmt + sctAmt + vatAmt + extra;
        const curr = landedForm.curr;
        const fmt = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(amt);

        let b2cWarning = "";
        if (landedForm.tradeType === "b2c") {
            b2cWarning = `🚨 2026 B2C REGULATION WARNING 🚨\nPersonal import tax exemptions (De Minimis / 30 EUR limit) have been completely ABOLISHED. All B2C e-commerce imports are now subject to commercial tax brackets (e.g., 30% EU, 60% non-EU) plus applicable presentation & brokerage fees, regardless of the invoice value.\n==========================================\n`;
        }

        let ataWarning = "";
        if (landedForm.tradeType === "ata_carnet") {
            ataWarning = `🎟️ ATA CARNET (EXHIBITION / TEMP EXPORT)\nDuty, SCT, and VAT are exempted for temporary goods returning in their original state.\n==========================================\n`;
        }

        let autoFillText = "";
        if (autoNotes.length > 0) {
            autoFillText = `\n\n🤖 VIRTUAL BROKER NOTES (AUTO-FILLS)\n------------------------------------------\nTo prevent calculation failures, the system filled your blank fields with industry standards:\n${autoNotes.join('\n')}\n* For 100% exact quotes, please input the real rates provided by your forwarder.`;
        }

        let volumeText = landedForm.freightMethod === "sea" 
            ? `Total Volume  : ${totalCBM.toFixed(3)} CBM\nChargeable Wt : ${chargeableWt.toFixed(3)} CBM/Ton (W/M Rule)\n`
            : `Total Volume  : ${totalCBM.toFixed(3)} CBM\nVolumetric Wt : ${volKg.toFixed(2)} kg (Divisor: ${landedForm.freightMethod === "air" ? 5000 : 3000})\nChargeable Wt : ${chargeableWt.toFixed(2)} kg\n`;

        setOutput(
          `🚢 GLOBAL LANDED COST REPORT\n` +
          `==========================================\n` +
          b2cWarning + ataWarning +
          `📦 LOGISTICS & FREIGHT (Method: ${landedForm.freightMethod.toUpperCase()})\n` +
          `Route         : ${landedForm.route.replace('_', ' ➡️ ')}\n` +
          `Est. Transit  : ${transitDays}\n` +
          `Cartons       : ${cartons} (Dims: ${l}x${w}x${h} cm)\n` +
          `Total Weight  : ${totalKg.toFixed(2)} kg\n` + volumeText +
          `Freight Cost  : ${landedForm.incoterm === "CIF" ? "Included in Invoice" : fmt(freightCost) + " (" + fmt(frRate) + "/" + chargeableUnit + ")"}\n` +
          (landedForm.incoterm === "EXW" ? `Origin Fees   : ${fmt(originFee)}\n` : "") + `\n` +
          `🏦 CUSTOMS BASIS (CIF VALUE)\n` + incotermNote +
          `Goods Value   : ${fmt(val)}\n` +
          `Insurance     : ${landedForm.incoterm === "CIF" ? "Included" : fmt(insAmt) + " (" + insRate + "%)"}\n` +
          `CIF Matrah    : ${fmt(cif)}\n\n` +
          `⚖️ TAXES & DUTIES (Trade: ${landedForm.tradeType.toUpperCase()})\n` +
          (landedForm.tradeType === "ata_carnet" ? `Taxes Exempted for ATA Carnet.\nLocal/Broker  : ${fmt(extra)}\n` : 
          `Customs Duty  : ${fmt(dutyAmt)} (${dutyRate}% of CIF)\n` +
          `SCT (ÖTV)     : ${fmt(sctAmt)} (${sctRate}% of CIF+Duty)\n` +
          `Local/Broker  : ${fmt(extra)}\n` +
          `VAT Base      : ${fmt(vatBase)} (CIF+Duty+SCT+Local)\n` +
          `VAT Tax       : ${fmt(vatAmt)} (${vatRate}%)\n`) +
          `------------------------------------------\n` +
          `💰 TOTAL LANDED COST: ${fmt(totalLanded)}` + autoFillText
        );
        break;
      }

      // ✈️ TRAVEL CALC
      case 'travel-calc': {
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
        const formatCurrT = (amt, c) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: c }).format(amt);
        
        let hotelLabel = tHotelMult === 3.5 ? "5★ Executive" : tHotelMult === 1.8 ? "4★ Business" : "3★ Economy";
        let foodLabel = tFood === 150 ? "Fine Dining" : tFood === 70 ? "Medium/Standard" : "Budget/Fast Food";
        let transLabel = tTransport === 70 ? "Rent a Car" : tTransport === 50 ? "Taxi/Uber" : "Public Transport";

        setOutput(`✈️ TRAVEL EXPENSE REPORT\n==========================================\nLocation      : ${travelForm.destName}\nDuration      : ${tDays} Days\nAccommodation : ${hotelLabel}\nDaily Food    : ${foodLabel}\nLogistics     : ${transLabel}\n------------------------------------------\n💰 ESTIMATED BUDGET: ${formatCurrT(bufferTotalUSD * rate, travelForm.currency)}\n------------------------------------------\nAvg Daily Cost: ${formatCurrT((dailyUSD * 1.10) * rate, travelForm.currency)}\nLive Exch Rate: 1 USD = ${rate.toFixed(2)} ${travelForm.currency}\n\n*Includes 10% corporate safety margin.`);
        break;
      }

      // --- DEV TOOLS (Metin Motorları) ---
      case 'json-csv': {
        if (!input.trim()) { setOutput("⚠️ ERROR: Please paste a valid JSON array."); return; }
        try {
            let data = JSON.parse(input);
            if (!Array.isArray(data)) data = [data]; 
            if (data.length === 0) { setOutput("Empty Array."); return; }
            const keys = Object.keys(data[0]);
            let csvStr = keys.join(",") + "\n";
            data.forEach(row => {
                csvStr += keys.map(k => {
                    let cell = row[k] === null || row[k] === undefined ? "" : String(row[k]);
                    cell = cell.replace(/"/g, '""');
                    return `"${cell}"`;
                }).join(",") + "\n";
            });
            setOutput(csvStr);
        } catch(err) { setOutput("⚠️ ERROR: Invalid JSON format.\n" + err.message); }
        break;
      }

      case 'jwt-decoder': {
        if (!input.trim()) { setOutput("⚠️ ERROR: Please paste a JWT."); return; }
        try {
            const parts = input.split('.');
            if(parts.length !== 3) throw new Error("A JWT must have exactly 3 parts separated by dots.");
            const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            setOutput(`--- HEADER ---\n${JSON.stringify(header, null, 2)}\n\n--- PAYLOAD ---\n${JSON.stringify(payload, null, 2)}\n\n--- SIGNATURE ---\n[Hidden/Binary]`);
        } catch(err) { setOutput("⚠️ ERROR: Invalid JWT.\n" + err.message); }
        break;
      }

      case 'sql-format': {
        if (!input.trim()) { setOutput("⚠️ ERROR: Please paste a SQL query."); return; }
        let formatted = input.replace(/\s+/g, ' ')
          .replace(/\s*(SELECT|FROM|WHERE|INNER JOIN|LEFT JOIN|RIGHT JOIN|GROUP BY|ORDER BY|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM)\s*/gi, '\n\n$1\n  ')
          .replace(/,/g, ',\n  ')
          .replace(/ AND /gi, '\n  AND ')
          .replace(/ OR /gi, '\n  OR ');
        setOutput(formatted.trim());
        break;
      }

      case 'curl-code': {
        if (!input.trim().startsWith('curl')) { setOutput("⚠️ ERROR: Input must start with 'curl'."); return; }
        const urlMatch = input.match(/'(https?:\/\/[^']+)'/);
        const methodMatch = input.match(/-X\s+([A-Z]+)/);
        const headerMatches = [...input.matchAll(/-H\s+'([^']+)'/g)];
        const dataMatch = input.match(/--data-raw\s+'([^']+)'/);
        
        const method = methodMatch ? methodMatch[1] : 'GET';
        const url = urlMatch ? urlMatch[1] : 'API_URL_HERE';
        const body = dataMatch ? dataMatch[1] : '';
        
        let fetchCode = `fetch('${url}', {\n  method: '${method}',\n  headers: {`;
        headerMatches.forEach(h => {
            const [k, v] = h[1].split(': ');
            fetchCode += `\n    '${k}': '${v}',`;
        });
        fetchCode += `\n  }`;
        if (body) fetchCode += `,\n  body: JSON.stringify(${body})`;
        fetchCode += `\n})\n.then(res => res.json())\n.then(data => console.log(data))\n.catch(err => console.error(err));`;
        
        setOutput(`// Javascript Fetch Equivalent\n\n${fetchCode}`);
        break;
      }

      case 'diff-checker': {
        if (!input && !input2) { setOutput("⚠️ ERROR: Please paste Original and New text."); return; }
        const oldL = input.split('\n');
        const newL = input2.split('\n');
        let diffOut = "";
        let changes = 0;
        const maxL = Math.max(oldL.length, newL.length);
        for(let i=0; i<maxL; i++) {
            if (oldL[i] !== newL[i]) {
                changes++;
                if(oldL[i] !== undefined) diffOut += `🔴 [-] Line ${i+1}: ${oldL[i]}\n`;
                if(newL[i] !== undefined) diffOut += `🟢 [+] Line ${i+1}: ${newL[i]}\n`;
                diffOut += `\n`;
            }
        }
        if(changes === 0) setOutput("✅ Texts are 100% identical.");
        else setOutput(`⚠️ FOUND ${changes} LINE DIFFERENCE(S)\n==========================================\n\n${diffOut}`);
        break;
      }

      // --- GAME DEV MOTORLARI ---
      case 'pixel-perfect': {
        const bW = parseFloat(input); const bH = parseFloat(input2); const targetRatioStr = input3.trim() || "16:9";
        if (isNaN(bW) || isNaN(bH) || bW <= 0 || bH <= 0) { setOutput("⚠️ ERROR: Please enter a valid Base Width and Height (e.g., 1920 and 1080)."); return; }
        const ratioParts = targetRatioStr.split(':');
        if (ratioParts.length !== 2 || isNaN(parseFloat(ratioParts[0])) || isNaN(parseFloat(ratioParts[1]))) { setOutput("⚠️ ERROR: Target Ratio must be in 'W:H' format (e.g., 21:9 or 4:3)."); return; }
        
        const tRW = parseFloat(ratioParts[0]); const tRH = parseFloat(ratioParts[1]);
        const baseRatio = bW / bH; const targetRatio = tRW / tRH;

        let scaleResult = ""; let advice = "";
        if (Math.abs(baseRatio - targetRatio) < 0.01) {
            scaleResult = "🟢 Perfect Match!"; advice = "No scaling issues. UI will fit perfectly without distortion.";
        } else if (targetRatio > baseRatio) {
            scaleResult = "🟡 Pillarboxing Occurs (Black Bars on Left/Right)"; advice = "Target screen is WIDER than base UI (e.g. Ultrawide). Ensure UI elements are anchored to the edges (Left/Right).";
        } else {
            scaleResult = "🔴 Letterboxing Occurs (Black Bars on Top/Bottom)"; advice = "Target screen is TALLER than base UI (e.g. iPad 4:3). Make sure your top/bottom elements aren't anchored absolutely.";
        }
        setOutput(`🎮 PIXEL PERFECT UI SCALER\n==========================================\nBase Resolution : ${bW}x${bH} (Ratio: ${baseRatio.toFixed(3)})\nTarget Screen   : ${targetRatioStr} (Ratio: ${targetRatio.toFixed(3)})\n\n--- SCALE RESULT ---\n${scaleResult}\n\n💡 Dev Advice:\n${advice}`);
        break;
      }

      case 'shader-easing': {
        const xVal = parseFloat(input); const easeType = input2 || "smoothstep"; const exponent = parseFloat(input3) || 2;
        if (isNaN(xVal) || xVal < 0 || xVal > 1) { setOutput("⚠️ ERROR: Input X must be between 0.0 and 1.0."); return; }
        
        let yVal = 0;
        if (easeType === "smoothstep") yVal = xVal * xVal * (3.0 - 2.0 * xVal);
        else if (easeType === "pow") yVal = Math.pow(xVal, exponent);
        else if (easeType === "sine") yVal = Math.sin(xVal * Math.PI / 2); 

        const barLength = 30;
        const filled = Math.max(0, Math.min(barLength, Math.round(yVal * barLength)));
        const bar = "█".repeat(filled) + "░".repeat(barLength - filled);
        setOutput(`🔮 SHADER EASING VISUALIZER\n==========================================\nFunction : ${easeType.toUpperCase()}\nInput X  : ${xVal.toFixed(3)}\n\n--- MATH RESULT ---\nOutput Y : ${yVal.toFixed(4)}\n\nCurve Vis: [${bar}]`);
        break;
      }

      case 'dot-product': {
        const surfAngle = parseFloat(input); const lightAngle = parseFloat(input2);
        if (isNaN(surfAngle) || isNaN(lightAngle)) { setOutput("⚠️ ERROR: Please enter valid angles in degrees (e.g., 0 and 45)."); return; }
        
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
      }

      // --- MÜZİK MOTORLARI ---
      case 'freq-note': {
        const hz = parseFloat(input);
        if(isNaN(hz) || hz < 10 || hz > 20000) { setOutput("⚠️ ERROR: Frequency must be a valid number between 10 Hz and 20000 Hz."); return; }
        const midi = 12 * (Math.log2(hz / 440)) + 69;
        const roundedMidi = Math.round(midi);
        const exactFreq = 440 * Math.pow(2, (roundedMidi - 69) / 12);
        const cents = Math.round(1200 * Math.log2(hz / exactFreq));
        setOutput(`Detected Note: ${keysSharp[roundedMidi % 12]}${Math.floor(roundedMidi / 12) - 1}\nMIDI Note Number: ${roundedMidi}\nPerfect Pitch Freq: ${exactFreq.toFixed(2)} Hz\nDetune: ${cents > 0 ? '+' : ''}${cents} Cents`);
        break;
      }

      case 'bpm-ms': {
        const bpmVal = parseFloat(input);
        if(isNaN(bpmVal) || bpmVal <= 0 || bpmVal > 999) { setOutput("⚠️ ERROR: BPM must be a positive number between 1 and 999."); return; }
        const bpmMs = (60000 / bpmVal).toFixed(2);
        setOutput(`1/4 Note (Quarter): ${bpmMs} ms\n1/8 Note (Eighth): ${(bpmMs/2).toFixed(2)} ms\n1/16 Note (Sixteenth): ${(bpmMs/4).toFixed(2)} ms`);
        break;
      }

      case 'acoustic-calc': {
        const acW = parseFloat(input), acL = parseFloat(input2);
        let acH = parseFloat(input3);
        let autoHNote = "";

        if(isNaN(acW) || isNaN(acL) || acW <= 0 || acL <= 0) { 
            setOutput("⚠️ ERROR: Room Width and Length are mandatory fields (> 0 meters)."); return; 
        }
        if(isNaN(acH) || acH <= 0) {
            acH = 2.8;
            autoHNote = "\n\n💡 AUTO-ESTIMATE APPLIED:\nCeiling height left blank. System defaulted to standard 2.8 meters.";
        }
        const area = 2 * (acW * acL + acL * acH + acW * acH);
        setOutput(`Total Room Surface Area: ${area.toFixed(1)} m²\n\n--- MINIMUM TREATMENT REQUIREMENTS ---\nAbsorption Panels (18%): ${(area * 0.18).toFixed(1)} m²\nDiffusion Panels (7%): ${(area * 0.07).toFixed(1)} m²${autoHNote}`);
        break;
      }

      case 'circle-fifths': {
        const cleanNote = input.trim().charAt(0).toUpperCase() + input.trim().slice(1).toLowerCase();
        const noteMap = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
        const rootIdx = noteMap[cleanNote];
        if(rootIdx === undefined) { setOutput("⚠️ ERROR: Invalid note format. Please enter a valid root note (e.g. C, F#, Bb, Eb)."); return; }
        const subdominant = keysSharp[(rootIdx + 5) % 12];
        const dominant = keysSharp[(rootIdx + 7) % 12];
        const relMinor = keysSharp[(rootIdx + 9) % 12];
        setOutput(`ROOT KEY: ${keysSharp[rootIdx]} Major / ${cleanNote !== keysSharp[rootIdx] ? '('+cleanNote+' Major)' : ''}\n==========================================\nPerfect 4th (Subdominant) : ${subdominant} Major\nPerfect 5th (Dominant)    : ${dominant} Major\nRelative Minor Scale      : ${relMinor} Minor (${relMinor}m)\n\n*Use these chords for foundational harmonic progressions.`);
        break;
      }

      case 'pitch-shift': {
        const origBpm = parseFloat(input); const semitones = parseFloat(input2);
        if(isNaN(origBpm) || origBpm <= 0) { setOutput("⚠️ ERROR: Original BPM must be a positive number."); return; }
        if(isNaN(semitones)) { setOutput("⚠️ ERROR: Semitone shift must be a valid number (e.g., 3 or -2)."); return; }
        const newBpm = origBpm * Math.pow(2, semitones / 12);
        setOutput(`Original BPM: ${origBpm}\nPitch Shift: ${semitones > 0 ? '+' : ''}${semitones} Semitones\n\n--- REPITCH RESULT ---\nNew Target BPM: ${newBpm.toFixed(2)}\n\n*Pitching a sample UP speeds it up. Pitching it DOWN slows it down.`);
        break;
      }

      case 'note-freq': {
        const noteRegex = /^([a-gA-G])([#b]?)(-?\d+)$/;
        const match = input.trim().match(noteRegex);
        if(!match) { setOutput("⚠️ ERROR: Invalid format. Please enter a Note and Octave (e.g., C4, F#3, Bb2)."); return; }
        const nLetter = match[1].toUpperCase(); const nAccidental = match[2].toLowerCase(); const nOctave = parseInt(match[3]);
        const nMap = { "C":0, "D":2, "E":4, "F":5, "G":7, "A":9, "B":11 };
        let baseMidi = nMap[nLetter];
        if(nAccidental === '#') baseMidi += 1;
        if(nAccidental === 'b') baseMidi -= 1;
        const finalMidi = baseMidi + ((nOctave + 1) * 12);
        const finalFreq = 440 * Math.pow(2, (finalMidi - 69) / 12);
        setOutput(`Input Note: ${nLetter}${nAccidental}${nOctave}\nMIDI Note Number: ${finalMidi}\n\n--- FREQUENCY RESULT ---\nExact Frequency: ${finalFreq.toFixed(2)} Hz\n\n*A4 is standard tuning reference at 440 Hz.`);
        break;
      }

      default: 
        setOutput("Ready to process..."); 
        break;
    }
  };

  const toolData = {
    // 💼 BİZNES & DATA
    "travel-calc": { name: "Travel Expense Engine", how: "Select options from dropdowns. Range: 1-365 Days.", why: "Instant, algorithm-based corporate travel budget estimations." },
    "landed-cost": { name: "Global Landed Cost", how: "Select Route/Incoterm. Enter Val/Dims. Blank fields will auto-estimate.", why: "AI-assisted broker simulator for EXW/FOB/CIF, W/M CBM Sea rules, and 2026 B2C taxes." },
    
    // 💻 GELİŞTİRİCİ
    "json-csv": { name: "JSON to CSV", how: "Paste raw JSON array text.", why: "Rapid data integration and database parsing." },
    "curl-code": { name: "cURL to Code", how: "Paste a cURL request from terminal/postman.", why: "Instant API endpoint testing and JS code conversion." },
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
                
                {/* 🚢 GLOBAL LANDED COST UI - MASTER SEVİYE */}
                {activeTab === "landed-cost" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* SATIR 1: ROTA VE METODLAR */}
                    <div className="md:col-span-1">
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, route: e.target.value})}>
                        <option value="GLOBAL">🌍 Global (Standard)</option>
                        <option value="TR_EU">🇹🇷 TR ➡️ 🇪🇺 EU / UK</option>
                        <option value="TR_US">🇹🇷 TR ➡️ 🇺🇸 US</option>
                        <option value="CN_TR">🇨🇳 CN ➡️ 🇹🇷 TR</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Route for auto-estimates</p>
                    </div>
                    <div className="md:col-span-1">
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, tradeType: e.target.value})}>
                        <option value="standard">📦 Standard Trade</option>
                        <option value="ata_carnet">🎟️ ATA Carnet</option>
                        <option value="b2c">🛒 B2C (E-Commerce)</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Customs logic / B2C tax</p>
                    </div>
                    <div className="md:col-span-1">
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, freightMethod: e.target.value})}>
                        <option value="air">✈️ Air Freight (IATA)</option>
                        <option value="sea">🚢 Sea Freight (W/M)</option>
                        <option value="road">🚛 Road Freight</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Transport & Divisor</p>
                    </div>
                    <div className="md:col-span-1">
                      <select value={landedForm.incoterm} className="w-full bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, incoterm: e.target.value})}>
                        <option value="FOB">FOB (Free on Board)</option>
                        <option value="EXW">EXW (Ex Works)</option>
                        <option value="CIF">CIF (Cost, Ins, Freight)</option>
                      </select>
                      <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Incoterm (CIF Basis)</p>
                    </div>

                    {/* SATIR 2: FİYAT VE KİLO */}
                    <div className="md:col-span-2 flex gap-2">
                      <div className="flex-1">
                        <input value={landedForm.val} type="number" min="0" step="any" placeholder="Invoice Goods Value *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, val: e.target.value})} />
                        <p className="text-[10px] text-neutral-500 mt-1 ml-2">Total item value (Req)</p>
                      </div>
                      <div>
                        <select className="h-[54px] bg-black border border-neutral-800 rounded-xl p-2 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, curr: e.target.value})}>
                          <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="TRY">TRY</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <input value={landedForm.cartons} type="number" min="1" step="1" placeholder="Total Cartons" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, cartons: e.target.value})} />
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Qty multiplier (Def: 1)</p>
                    </div>
                    <div>
                      <input value={landedForm.weight} type="number" min="0" step="any" placeholder="Wt/Ctn (kg) *" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, weight: e.target.value})} />
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Weight per carton (Req)</p>
                    </div>

                    {/* SATIR 3: EBATLAR VE NAKLİYE GİRDİLERİ */}
                    <div className="md:col-span-1 lg:col-span-2 grid grid-cols-3 gap-2">
                        <div>
                          <input value={landedForm.l} type="number" min="0" step="any" placeholder="L(cm)*" className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 text-center" onChange={(e) => setLandedForm({...landedForm, l: e.target.value})} />
                          <p className="text-[9px] text-neutral-600 text-center mt-1">Length</p>
                        </div>
                        <div>
                          <input value={landedForm.w} type="number" min="0" step="any" placeholder="W(cm)*" className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 text-center" onChange={(e) => setLandedForm({...landedForm, w: e.target.value})} />
                          <p className="text-[9px] text-neutral-600 text-center mt-1">Width</p>
                        </div>
                        <div>
                          <input value={landedForm.h} type="number" min="0" step="any" placeholder="H(cm)*" className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 text-center" onChange={(e) => setLandedForm({...landedForm, h: e.target.value})} />
                          <p className="text-[9px] text-neutral-600 text-center mt-1">Height</p>
                        </div>
                    </div>
                    <div>
                      <input value={landedForm.frRate} type="number" min="0" step="any" placeholder="Freight Rate" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, frRate: e.target.value})} />
                      <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Rate/kg or CBM. Blank = Auto.</p>
                    </div>
                    <div>
                      <input value={landedForm.originFee} type="number" min="0" step="any" placeholder="Origin Fees" disabled={landedForm.incoterm !== "EXW"} className={`w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 ${landedForm.incoterm !== "EXW" ? 'opacity-30' : ''}`} onChange={(e) => setLandedForm({...landedForm, originFee: e.target.value})} />
                      <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Only for EXW. Blank = Auto.</p>
                    </div>

                    {/* SATIR 4: VERGİLER */}
                    <div>
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, duty: e.target.value})}>
                        <option value="20">Duty: Standard 20%</option>
                        <option value="0">Duty: EU Origin 0%</option>
                        <option value="30">Duty: B2C EU 30%</option>
                        <option value="60">Duty: B2C Non-EU 60%</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Customs Tax %</p>
                    </div>
                    <div>
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, sct: e.target.value})}>
                        <option value="0">SCT (ÖTV): 0%</option>
                        <option value="20">SCT (ÖTV): 20%</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Special Consumption Tax</p>
                    </div>
                    <div>
                      <select className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, vat: e.target.value})}>
                        <option value="20">VAT 20%</option><option value="10">VAT 10%</option><option value="1">VAT 1%</option><option value="0">VAT 0%</option>
                      </select>
                      <p className="text-[10px] text-neutral-500 mt-1 ml-2">Value Added Tax %</p>
                    </div>
                    <div>
                      <input value={landedForm.extra} type="number" min="0" step="any" placeholder="Local Extra Fees" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setLandedForm({...landedForm, extra: e.target.value})} />
                      <p className="text-[10px] text-emerald-600/70 mt-1 ml-2">Broker/Storage. Blank = Auto.</p>
                    </div>
                  </div>

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

                ) : activeTab === "pitch-shift" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={input} type="number" min="1" step="any" placeholder="Original BPM (e.g. 120)" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                    <input value={input2} type="number" step="1" placeholder="Semitones (+ or -) e.g. -2, 3" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} />
                  </div>

                ) : ["circle-fifths", "note-freq"].includes(activeTab) ? (
                  <input value={input} type="text" placeholder={toolData[activeTab]?.how} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xl md:text-2xl font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />

                ) : (
                  <input value={input} type="number" min="0" step="any" placeholder={toolData[activeTab]?.how} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xl md:text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} />
                )}
                
                <button onClick={() => calculateLogic(activeTab)} className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-900/20 uppercase text-sm tracking-widest">PROCESS DATA</button>
                <pre className="p-4 md:p-6 bg-black rounded-xl border border-neutral-800 text-emerald-500 font-mono text-xs md:text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">{output || "Awaiting execution..."}</pre>
              </div>

            // 💻 GELİŞTİRİCİ ARAÇLARI (TEXTAREA)
            ) : (
              <div className="space-y-6">
                {activeTab === "diff-checker" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea value={input} className="h-48 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} placeholder="Original Text (Left)..." />
                    <textarea value={input2} className="h-48 bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" onChange={(e) => setInput2(e.target.value)} placeholder="New Text (Right)..." />
                  </div>
                ) : (
                  <textarea value={input} className="h-48 w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono outline-none focus:border-emerald-500" onChange={(e) => setInput(e.target.value)} placeholder={toolData[activeTab]?.how} />
                )}
                
                <button onClick={() => calculateLogic(activeTab)} className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-900/20 uppercase text-sm tracking-widest">PROCESS DATA</button>
                
                <textarea value={output} className="h-64 w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-mono text-emerald-400 outline-none" readOnly placeholder="Result will appear here..." />
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