import { useState } from 'react'
import { jsPDF } from "jspdf";
function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)


  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8001";

  const handleSummarize = async () => {
    if (!text) return
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("NewsScribe error:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    // Helper to ensure text is capitalized and safe
    const cap = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    // --- Title & Header ---
    doc.setFont("serif", "bold");
    doc.setFontSize(22);
    doc.text("NewsScribe — Summary Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated: ${date}`, 20, 38);
    doc.line(20, 32, 190, 32);

    // --- Summary ---
    doc.setFontSize(14);
    doc.setFont("serif", "bold");
    doc.text("Generated Summary:", 20, 45);
    doc.setFont("serif", "normal");
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(
      cap(result.summary),
      170
    );

    doc.text(summaryLines, 20, 52);

    const footerY = 60 + summaryLines.length * 6;
    doc.line(20, footerY, 190, footerY);
    doc.text(
      `Sentiment: ${result.metadata.sentiment} (${Math.round(result.metadata.score * 100)}%)`,
      20,
      footerY + 8
    );
    doc.text(
      `Inference Latency: ${result.metadata.latency_ms}ms`,
      20,
      footerY + 14
    );
    doc.text(
      `Hardware: ${result.metadata.device.toUpperCase()}`,
      20,
      footerY + 20
    );
    doc.save("NewsScribe_Summary_Report.pdf");
  };

const formatHeadline = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ScribeLoader = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-12">
    {/* The "Flame" */}
    <div className="relative">
      <div className="w-4 h-4 bg-quill rounded-full blur-sm animate-flicker" />
      <div className="absolute top-0 w-4 h-4 bg-sepia/20 rounded-full animate-ping" />
    </div>
    <p className="text-xs tracking-[0.4em] uppercase text-sepia/40 animate-pulse">
      Analyzing article...
    </p>
  </div>
)

return (
  // Responsive Tip: px-6 for mobile, md:p-24 for desktop. 
  // This prevents text from hitting the screen edges on an iPhone.
  <div className="min-h-screen px-6 py-12 md:p-24 max-w-5xl mx-auto space-y-10 md:space-y-16">

    {/* Header Section */}
    <header className="text-center space-y-3">
      {/* text-3xl for mobile, md:text-6xl for high-end desktop look */}
      <h1 className="text-3xl md:text-6xl font-serif tracking-[0.2em] text-ink uppercase transition-all duration-700">
        NewsScribe
      </h1>
      <p className="text-[10px] md:text-xs font-sans tracking-[0.3em] text-sepia/60 uppercase italic">
        AI News Summarization & Sentiment Analysis
      </p>
    </header>

    {/* Input Section */}
    <section className="space-y-6">
      <textarea
        // h-48 on mobile (saves space), h-80 on desktop
        className="w-full h-48 md:h-80 p-6 md:p-10 bg-white/40 border border-sepia/10 rounded-sm font-serif text-base md:text-xl leading-relaxed focus:outline-none focus:border-quill/30 transition-all resize-none placeholder:italic placeholder:opacity-30"
        placeholder="Paste a news article or URL here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex justify-center">
        <button
          onClick={handleSummarize}
          disabled={loading}
          // Mobile: full width (w-full), Desktop: auto-width (md:w-auto)
          className="w-full md:w-auto px-16 py-5 border border-ink text-ink hover:bg-ink hover:text-parchment transition-all duration-500 uppercase tracking-[0.2em] text-[10px] md:text-xs disabled:opacity-20"
        >
          {loading ? 'Analyzing...' : 'Summarize & Analyze'}
        </button>
      </div>
    </section>

    {/* Results Section */}
    {loading ? (
      <ScribeLoader />
    ) : (
      result && (
        <div className="space-y-12 animate-in fade-in duration-1000">
          <ResultCard
            title="AI Generated Summary"
            text={formatHeadline(result.summary)}
            icon="📰"
          />

          {result && !loading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={exportToPDF}
                className="px-8 py-3 border border-quill text-quill hover:bg-quill hover:text-white transition-all text-[10px] uppercase tracking-widest"
              >
                📥 Export Summary to PDF
              </button>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="mt-12 pt-8 border-t border-sepia/10 flex flex-wrap justify-center gap-8 opacity-40 text-[10px] uppercase tracking-widest font-sans">
            <div>Inference: {result.metadata.latency_ms}ms</div>
            <div>Hardware: {result.metadata.device.toUpperCase()}</div>

            {/* NEW: Sentiment Tag */}
            <div className={`font-bold ${result.metadata.sentiment === 'POSITIVE' ? 'text-green-600' : 'text-red-600'}`}>
              Tone: {result.metadata.sentiment} ({Math.round(result.metadata.score * 100)}%)
            </div>

            <div>Model: {result.metadata.model}</div>
          </div>
        </div>
      )
    )}
  </div> // Closing main div
); // Closing return
}

function ResultCard({ title, text, icon }) {
  return (
    <div className="p-8 border border-sepia/5 bg-white/20 backdrop-blur-md space-y-6 hover:border-sepia/20 transition-all group flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-sepia/10 pb-4">
          <span className="text-[9px] tracking-widest uppercase text-sepia/50 font-sans">{title}</span>
          <span className="text-lg opacity-30 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{icon}</span>
        </div>
        {/* text-lg on mobile, text-2xl for better readability on desktop */}
        <p className="text-lg md:text-2xl font-serif italic text-ink leading-tight">"{text}"</p>
      </div>

      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          alert("Summary copied to clipboard!");
        }}
        className="text-[10px] uppercase tracking-tighter text-sepia/40 hover:text-quill transition-colors text-left pt-4"
      >
        Copy Summary
      </button>
    </div>
  )
}

export default App