export default function HeroSection() {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-900/60 to-emerald-955/10 border border-slate-900 p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl">
      <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-tight max-w-2xl mx-auto mb-6">
        Understand and Reduce Your{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-350 font-black">
          Carbon Footprint
        </span>
      </h1>
      <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
        Get personalized AI insights in 3 simple steps. Estimate emissions, scan utilities
        automatically, and build sustainability habits.
      </p>
      <button
        onClick={() => {
          document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
      >
        Calculate My Footprint
      </button>
    </section>
  );
}
