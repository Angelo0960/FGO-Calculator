import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 border-t border-blue-700 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          {/* Brand section */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">FGO Material Calculator</h2>
            </div>
            <p className="text-blue-300 text-sm max-w-md mx-auto">
              Calculate material requirements across multiple servants
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a href="#features" className="text-blue-300 hover:text-white hover:underline text-sm">
              Calculator
            </a>
            <a href="#servants" className="text-blue-300 hover:text-white hover:underline text-sm">
              Servants
            </a>
            <a href="#inventory" className="text-blue-300 hover:text-white hover:underline text-sm">
              Inventory
            </a>
            <a href="#export" className="text-blue-300 hover:text-white hover:underline text-sm">
              Export Data
            </a>
            <a href="#guide" className="text-blue-300 hover:text-white hover:underline text-sm">
              Guide
            </a>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 mb-6"></div>

          {/* Copyright */}
          <div className="text-blue-400 text-sm">
            <p className="mb-2">
              © {currentYear} FGO Material Calculator. Fan-made tool. Fate/Grand Order © TYPE-MOON / FGO PROJECT.
            </p>
            <p className="text-xs text-blue-500">
              Not affiliated with or endorsed by TYPE-MOON.
            </p>
          </div>

          {/* Bottom note */}
          <div className="mt-6 pt-4 border-t border-blue-800">
            <p className="text-xs text-blue-500">
              Data sourced from Atlas Academy DB • Updates automatically
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;