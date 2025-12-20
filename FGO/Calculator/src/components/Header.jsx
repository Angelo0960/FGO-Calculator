import React from 'react';

const Header = ({ name }) => {
  return (
    <header className="bg-blue-900 border-b border-blue-700 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-800 border border-blue-700 flex items-center justify-center">
              <img 
                src="../src/images/Fate_Grand_Order_logo.png" 
                alt="FGO Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FGO Material Calculator</h1>
              <p className="text-sm text-blue-400">Professional upgrade planning</p>
            </div>
          </div>

          {/* Right side */}
          {name && (
            <div className="bg-blue-800/50 rounded-lg border border-blue-700 px-4 py-2">
              <p className="text-xs text-blue-400 uppercase font-semibold">User Session</p>
              <p className="text-sm font-semibold text-white truncate max-w-[120px] md:max-w-[160px]">
                {name}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;