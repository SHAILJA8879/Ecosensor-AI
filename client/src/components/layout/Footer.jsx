export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} EcoSense AI. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#privacy" className="hover:text-slate-350 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-slate-350 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
