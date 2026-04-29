export default function Terms() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-emerald-500 hover:underline mb-8 inline-block">← Back to Lab</a>
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <section className="space-y-6">
          <p>By using ConverterLab.io, you agree to use our tools for lawful purposes.</p>
          <h2 className="text-xl font-bold text-white">Disclaimer</h2>
          <p>Our tools are provided "as is". We are not responsible for any data loss or incorrect conversions.</p>
        </section>
      </div>
    </div>
  );
}