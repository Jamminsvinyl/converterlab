export default function Privacy() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-emerald-500 hover:underline mb-8 inline-block">← Back to Lab</a>
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <section className="space-y-6">
          <p>At <strong>ConverterLab.io</strong>, we prioritize your privacy. This tool processes all data locally in your browser. We never store or see your data.</p>
          <h2 className="text-xl font-bold text-white">Cookies</h2>
          <p>We use Google AdSense cookies to provide relevant ads to our users.</p>
        </section>
      </div>
    </div>
  );
}