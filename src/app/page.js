"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("json-csv");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = (actionType = "default") => {
    setError("");
    setOutput("");
    if (!input.trim()) return;

    try {
      // 1. JSON to CSV
      if (activeTab === "json-csv") {
        let data = JSON.parse(input);
        if (!Array.isArray(data)) data = [data];
        const headers = Object.keys(data[0]);
        const rows = [headers.join(","), ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(","))];
        setOutput(rows.join("\n"));
      } 
      
      // 2. cURL to Code
      else if (activeTab === "curl-code") {
        const urlMatch = input.match(/curl\s+["']?([^"'\s]+)["']?/);
        if (!urlMatch) throw new Error("Invalid cURL command. Make sure it starts with 'curl'.");
        
        const methodMatch = input.match(/-X\s+(\w+)/) || input.match(/--request\s+(\w+)/);
        const method = methodMatch ? methodMatch[1] : (input.includes("--data") ? "POST" : "GET");
        
        const jsCode = `fetch("${urlMatch[1]}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json"
  }
}).then(res => res.json())
  .then(data => console.log(data));`;
        
        setOutput(jsCode);
      }

      // 3. JWT Decoder
      else if (activeTab === "jwt-decoder") {
        const parts = input.split('.');
        if (parts.length !== 3) throw new Error("Invalid JWT format. A valid JWT has 3 parts separated by dots.");
        
        const decodeBase64Url = (str) => {
          str = str.replace(/-/g, '+').replace(/_/g, '/');
          return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        };

        const header = JSON.parse(decodeBase64Url(parts[0]));
        const payload = JSON.parse(decodeBase64Url(parts[1]));
        
        setOutput(JSON.stringify({ header, payload }, null, 2));
      }

      // 4. Base64 Encode / Decode
      else if (activeTab === "base64") {
        if (actionType === "encode") {
          setOutput(btoa(unescape(encodeURIComponent(input))));
        } else if (actionType === "decode") {
          setOutput(decodeURIComponent(escape(atob(input))));
        }
      }
    } catch (e) { 
      setError(e.message || "An error occurred. Please check your input format."); 
    }
  };

  // Dinamik Başlık ve Açıklamalar
  const tabInfo = {
    "json-csv": { title: "JSON to CSV", desc: "Instantly transform your JSON arrays into clean CSV files." },
    "curl-code": { title: "cURL to JavaScript", desc: "Convert cURL commands to Fetch API instantly." },
    "jwt-decoder": { title: "JWT Decoder", desc: "Decode JSON Web Tokens (JWT) securely in your browser." },
    "base64": { title: "Base64 Encoder / Decoder", desc: "Encode text to Base64 or decode Base64 strings back to text." }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold text-white tracking-tight">Converter<span className="text-emerald-500">Lab</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm overflow-y-auto">
          
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 mt-2 px-4">Developer Tools</div>
          
          {Object.keys(tabInfo).map(tabKey => (
            <button key={tabKey} onClick={() => { setActiveTab(tabKey); setInput(""); setOutput(""); setError(""); }} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${activeTab === tabKey ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}>
              {tabInfo[tabKey].title.split(' ')[0]} {/* Sadece ilk kelimeler menüde temiz dursun diye kısa tutabiliriz, ama şimdilik tam isim daha iyi */}
              {tabKey === 'json-csv' ? 'JSON to CSV' : tabKey === 'curl-code' ? 'cURL to Code' : tabKey === 'jwt-decoder' ? 'JWT Decoder' : 'Base64 Tool'}
            </button>
          ))}

          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 mt-8 px-4">Music Lab</div>
          <button disabled className="w-full text-left px-4 py-2 text-neutral-600 italic cursor-not-allowed">BPM to MS (Coming Soon)</button>
          
        </nav>
        
        {/* ADSENSE PLACEHOLDER: SIDEBAR */}
        <div className="m-4 p-4 h-64 bg-neutral-800/20 border border-dashed border-neutral-700/50 rounded-lg flex items-center justify-center text-xs text-neutral-600">
          AdSpace - Sidebar
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {/* ADSENSE PLACEHOLDER: TOP BANNER */}
        <div className="w-full h-20 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-center text-xs text-neutral-600">
          AdSpace - Leaderboard (728x90)
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">{tabInfo[activeTab].title}</h2>
            <p className="text-neutral-400 mb-8">{tabInfo[activeTab].desc}</p>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl">
              {error && <div className="mb-4 bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm">{error}</div>}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Input</label>
                  <textarea 
                    className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono focus:border-emerald-500 outline-none transition-colors" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Paste your data here..." 
                    spellCheck="false"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Output</label>
                  <textarea 
                    className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono text-emerald-400 outline-none" 
                    value={output} 
                    readOnly 
                    placeholder="Result will appear here..." 
                    spellCheck="false"
                  />
                </div>
              </div>

              {/* ADSENSE PLACEHOLDER: ABOVE BUTTON */}
              <div className="my-6 h-12 bg-neutral-800/10 border border-dashed border-neutral-800/50 rounded flex items-center justify-center text-[10px] text-neutral-600">
                In-Feed Ad Placeholder
              </div>

              <div className="mt-2 flex items-center gap-4">
                {/* EĞER TAB BASE64 İSE İKİ BUTON GÖSTER, DEĞİLSE TEK BUTON */}
                {activeTab === "base64" ? (
                  <>
                    <button onClick={() => handleConvert('encode')} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/20">Encode Base64</button>
                    <button onClick={() => handleConvert('decode')} className="px-8 py-3 border border-emerald-600/50 text-emerald-500 hover:bg-emerald-600/10 font-bold rounded-lg transition-all active:scale-95">Decode Base64</button>
                  </>
                ) : (
                  <button onClick={() => handleConvert()} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/20">Convert Now</button>
                )}
                
                {output && <button onClick={() => navigator.clipboard.writeText(output)} className="ml-auto px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm font-medium">Copy to Clipboard</button>}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-neutral-800 p-6 text-xs text-neutral-500 flex flex-col md:flex-row justify-between items-center px-12 bg-black/20 gap-4">
          <div>© 2026 ConverterLab.io - Precision Tools for Devs & Music Pros</div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
            <a href="mailto:hello@converterlab.io" className="hover:text-emerald-500 transition-colors">Contact</a>
          </div>
        </footer>
      </main>
    </div>
  );
}