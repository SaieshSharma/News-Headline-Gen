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
    <div className="min-h-screen p-8 md:p-24 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-serif tracking-widest text-ink uppercase">The News Scribe</h1>
        <p className="text-sm font-sans tracking-[0.2em] text-sepia/60 uppercase italic">Medieval Minimal Headline Generator</p>
      </header>

      {/* Input Area */}
      <section className="space-y-6">
        <textarea
          className="w-full h-64 p-8 bg-white/50 border border-sepia/20 rounded-sm font-serif text-lg leading-relaxed focus:outline-none focus:border-quill/40 transition-colors resize-none placeholder:italic"
          placeholder="Deposit your news scroll here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <div className="flex justify-center">
          <button
            onClick={handleTranscribe}
            disabled={loading}
            className="px-12 py-4 border border-ink text-ink hover:bg-ink hover:text-parchment transition-all duration-500 uppercase tracking-widest text-xs disabled:opacity-30"
          >
            {loading ? 'Transcribing...' : 'Commence Transcription'}
          </button>
        </div>
      </section>

      {/* Results Area */}
      {headlines && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
    <div className="p-6 border border-sepia/10 bg-white/30 backdrop-blur-sm space-y-4 hover:border-sepia/30 transition-colors group">
      <div className="flex justify-between items-center">
        <span className="text-[10px] tracking-widest uppercase text-sepia/60">{title}</span>
        <span className="opacity-40 group-hover:opacity-100 transition-opacity">{icon}</span>
      </div>
      <p className="text-xl font-serif italic text-ink leading-snug">"{text}"</p>
      <button 
        onClick={() => navigator.clipboard.writeText(text)}
        className="text-[9px] uppercase tracking-tighter text-sepia/40 hover:text-quill transition-colors"
      >
        Copy to Parchment
      </button>
    </div>
  )
}

export default App