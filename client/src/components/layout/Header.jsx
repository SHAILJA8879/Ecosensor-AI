import PropTypes from 'prop-types';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold font-display text-lg shadow-lg shadow-emerald-500/20"
            aria-hidden="true"
          >
            ES
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">
            EcoSense <span className="text-emerald-400">AI</span>
          </span>
        </div>
        <nav className="flex space-x-2" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeTab === 'calculator'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'calculator' ? 'page' : undefined}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          >
            Dashboard
          </button>
        </nav>
      </div>
    </header>
  );
}

Header.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};
