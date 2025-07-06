export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[#0A0A0B]">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-gradient">RoR Trader</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#B8B8BD] mb-8">
          Automate Your Trading Strategies with Enterprise-Grade Security
        </p>
        <div className="glass rounded-2xl p-8 mb-8">
          <p className="text-lg text-[#B8B8BD]">
            🚧 We're building something amazing. Our platform will connect your TradingView 
            signals to real market execution across crypto and stocks.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="px-6 py-3 rounded-xl bg-gradient-primary text-[#0A0A0B] font-semibold cursor-pointer hover:opacity-90 transition-opacity">
            Coming Soon
          </div>
          <div className="px-6 py-3 rounded-xl border border-[#2A2A30] text-white hover:border-[#00D4FF] transition-colors cursor-pointer">
            Learn More
          </div>
        </div>
      </div>
    </main>
  )
}
