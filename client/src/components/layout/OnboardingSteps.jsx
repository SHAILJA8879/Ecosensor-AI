export default function OnboardingSteps() {
  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 text-center">
        Your Onboarding Journey
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-slate-900/30 border border-slate-900/85 rounded-2xl p-6 relative flex flex-col items-center text-center shadow-lg">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider">
            Step 1
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4 font-display font-black">
            1
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Calculate</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Compute your transport, food, and electricity emissions manually or scan bills with
            Gemini Vision.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/30 border border-slate-900/85 rounded-2xl p-6 relative flex flex-col items-center text-center shadow-lg">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black rounded-full uppercase tracking-wider">
            Step 2
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-teal-400 mb-4 font-display font-black">
            2
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Get AI Insights</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Receive your Carbon Health Score and a custom sustainability action plan from your AI
            Coach.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/30 border border-slate-900/85 rounded-2xl p-6 relative flex flex-col items-center text-center shadow-lg">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-wider">
            Step 3
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4 font-display font-black">
            3
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Track Progress</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Log calculations, compare score trends, and monitor your long-term environmental target
            savings.
          </p>
        </div>
      </div>
    </section>
  );
}
