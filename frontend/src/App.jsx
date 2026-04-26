import { useState } from 'react'

function App() {
  const [text, setText] = useState('')
  const [headlines, setHeadlines] = useState(null)
  const [loading, setLoading] = useState(false)

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
      {headlines && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <ResultCard title="The Royal Record" text={headlines.royal} icon="📜" />
          <ResultCard title="The Bard's Tale" text={headlines.bard} icon="🎭" />
          <ResultCard title="The Messenger" text={headlines.messenger} icon="🕊️" />
        </section>
      )}
    </div>
  )
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