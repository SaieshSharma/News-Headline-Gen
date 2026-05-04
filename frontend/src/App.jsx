import { useState } from 'react'
import { jsPDF } from "jspdf";
function App() {
  const [text, setText] = useState('')
  const [headlines, setHeadlines] = useState(null)
  const [loading, setLoading] = useState(false)


//   const handleTranscribe = async () => {
//   if (!text) return;
//   setLoading(true);

//   // MOCK DATA: This simulates the backend perfectly for screenshots
//   setTimeout(() => {
//     const mockData = {
//       results: {
//         royal: "ISRO Successfully Launches Advanced Communication Satellite for Rural Connectivity",
//         bard: "India's space agency ISRO achieves a major milestone with its latest satellite launch.",
//         messenger: "ISRO launches rural broadband satellite."
//       },
//       metadata: {
//         latency_ms: 142.5,
//         input_tokens: 63,
//         device: "cpu",
//         model: "T5-Small (Fine-tuned)"
//       }
//     };
    
//     setHeadlines(mockData); // This updates your UI as if the backend answered
//     setLoading(false);
//   }, 800); // 0.8s delay to show the "Scribe is thinking" state
// };

  const handleTranscribe = async () => {
    if (!text) return
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setHeadlines(data)
    } catch (error) {
      console.error("The Scribe is silent. Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
  if (!headlines) return;

  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Helper to ensure text is capitalized and safe
  const cap = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  // --- Title & Header ---
  doc.setFont("serif", "bold");
  doc.setFontSize(22);
  doc.text("THE NEWS SCRIBE: DISPATCH", 105, 20, { align: "center" });
  doc.line(20, 32, 190, 32); 

  // --- Headlines ---
  // Royal
  doc.setFontSize(14);
  doc.setFont("serif", "bold");
  doc.text("Primary Headline:", 20, 45);
  doc.setFont("serif", "normal");
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(cap(headlines.results.royal), 170), 20, 52);

  // Bard
  doc.setFontSize(14);
  doc.setFont("serif", "bold");
  doc.text("Detailed Summary:", 20, 80);
  doc.setFont("serif", "normal");
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(cap(headlines.results.bard), 170), 20, 87);

  // Messenger
  doc.setFontSize(14);
  doc.setFont("serif", "bold");
  doc.text("Breaking Alert:", 20, 115);
  doc.setFont("serif", "normal");
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(cap(headlines.results.messenger), 170), 20, 122);

  // --- Metadata Footer ---
  doc.line(20, 145, 190, 145);
  doc.setFontSize(9);
  doc.text(`Sentiment: ${headlines.metadata.sentiment} (${Math.round(headlines.metadata.score * 100)}%)`, 20, 153);
  doc.text(`Inference Latency: ${headlines.metadata.latency_ms}ms`, 20, 159);
  doc.text(`Hardware: ${headlines.metadata.device.toUpperCase()}`, 20, 165);

  doc.save("News_Scribe_Dispatch.pdf");
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
      The Scribe is consulting the scrolls...
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
          The News Scribe
        </h1>
        <p className="text-[10px] md:text-xs font-sans tracking-[0.3em] text-sepia/60 uppercase italic">
          Medieval Minimal Headline Generator
        </p>
      </header>

      {/* Input Section */}
      <section className="space-y-6">
        <textarea
          // h-48 on mobile (saves space), h-80 on desktop
          className="w-full h-48 md:h-80 p-6 md:p-10 bg-white/40 border border-sepia/10 rounded-sm font-serif text-base md:text-xl leading-relaxed focus:outline-none focus:border-quill/30 transition-all resize-none placeholder:italic placeholder:opacity-30"
          placeholder="Deposit your news scroll here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <div className="flex justify-center">
          <button
            onClick={handleTranscribe}
            disabled={loading}
            // Mobile: full width (w-full), Desktop: auto-width (md:w-auto)
            className="w-full md:w-auto px-16 py-5 border border-ink text-ink hover:bg-ink hover:text-parchment transition-all duration-500 uppercase tracking-[0.2em] text-[10px] md:text-xs disabled:opacity-20"
          >
            {loading ? 'Transcribing...' : 'Commence Transcription'}
          </button>
        </div>
      </section>

{/* Results Section */}
{loading ? (
  <ScribeLoader />
) : (
  headlines && (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* The 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<ResultCard 
  title="The Royal Proclamation" 
  text={formatHeadline(headlines.results.royal)} 
  icon="👑" 
/>
<ResultCard 
  title="The Bard's Song" 
  text={formatHeadline(headlines.results.bard)} 
  icon="📜" 
/>
<ResultCard 
  title="The Messenger's Dispatch" 
  text={formatHeadline(headlines.results.messenger)} 
  icon="🕊️" 
/>
      </div>

      {headlines && !loading && (
  <div className="flex justify-center mt-8">
    <button
      onClick={exportToPDF}
      className="px-8 py-3 border border-quill text-quill hover:bg-quill hover:text-white transition-all text-[10px] uppercase tracking-widest"
    >
      📜 Export Dispatch to PDF
    </button>
  </div>
)}

      {/* Metadata Footer */}
<div className="mt-12 pt-8 border-t border-sepia/10 flex flex-wrap justify-center gap-8 opacity-40 text-[10px] uppercase tracking-widest font-sans">
  <div>Inference: {headlines.metadata.latency_ms}ms</div>
  <div>Hardware: {headlines.metadata.device.toUpperCase()}</div>
  
  {/* NEW: Sentiment Tag */}
  <div className={`font-bold ${headlines.metadata.sentiment === 'POSITIVE' ? 'text-green-600' : 'text-red-600'}`}>
    Tone: {headlines.metadata.sentiment} ({Math.round(headlines.metadata.score * 100)}%)
  </div>
  
  <div>Model: {headlines.metadata.model}</div>
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
            alert("Headline copied to parchment!");
        }}
        className="text-[10px] uppercase tracking-tighter text-sepia/40 hover:text-quill transition-colors text-left pt-4"
      >
        Copy to Scroll
      </button>
    </div>
  )
}

export default App