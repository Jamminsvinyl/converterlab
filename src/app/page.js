"use client";

import { useState } from "react";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    setCsvOutput("");

    if (!jsonInput.trim()) {
      setError("Please enter JSON data to convert.");
      return;
    }

    try {
      // JSON'ı işle ve dizi formunda olduğundan emin ol
      let parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      if (parsedData.length === 0) {
        setError("The entered JSON array is empty.");
        return;
      }

      // Sütun başlıklarını dinamik olarak çıkar
      const headers = Object.keys(parsedData[0]);
      const csvRows = [];
      
      // Başlık satırını ekle
      csvRows.push(headers.join(","));

      // Veri satırlarını virgülle ayırarak ekle
      for (const row of parsedData) {
        const values = headers.map(header => {
          const val = row[header] !== null && row[header] !== undefined ? row[header] : "";
          const escapedVal = String(val).replace(/"/g, '""');
          return `"${escapedVal}"`;
        });
        csvRows.push(values.join(","));
      }

      // Sonucu ekrana yazdır
      setCsvOutput(csvRows.join("\n"));

    } catch (err) {
      setError("Invalid JSON format. Please check your brackets, braces, and quotes.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(csvOutput);
  };

  // Örnek JSON verisi (Kullanıcıya rehberlik etmesi için placeholder)
  const placeholderText = `[
  {
    "artist": "Pink Floyd",
    "album": "The Dark Side of the Moon",
    "year": 1973,
    "condition": "Mint"
  },
  {
    "artist": "The Doors",
    "album": "L.A. Woman",
    "year": 1971,
    "condition": "Near Mint"
  }
]`;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center py-16 px-4">
      {/* Üst Başlık Kısmı */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          Converter<span className="text-emerald-500">Lab</span>
        </h1>
        <p className="text-neutral-400 max-w-lg mx-auto">
          Instantly convert JSON data from APIs or databases into a clean CSV format.
        </p>
      </div>

      {/* Ana Araç Kutusu */}
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-2xl">
        
        {/* Hata Uyarı Paneli */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Taraf: JSON Girişi */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-emerald-500 mb-2 uppercase tracking-wider">JSON Input</label>
            <textarea
              className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono text-neutral-300 focus:outline-none focus:border-emerald-500 transition-colors resize-none shadow-inner"
              placeholder={placeholderText}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              spellCheck="false"
            />
          </div>

          {/* Sağ Taraf: CSV Çıktısı */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-neutral-500 mb-2 uppercase tracking-wider">CSV Output</label>
            <textarea
              className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm font-mono text-emerald-400 focus:outline-none resize-none shadow-inner"
              readOnly
              placeholder="Converted data will appear here..."
              value={csvOutput}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleConvert}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            Convert
          </button>
          
          {/* Sadece çıktı olduğunda görünen kopyala butonu */}
          {csvOutput && (
            <button
              onClick={handleCopy}
              className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg border border-neutral-700 transition-all active:scale-95"
            >
              Copy to Clipboard
            </button>
          )}
        </div>
      </div>
    </main>
  );
}