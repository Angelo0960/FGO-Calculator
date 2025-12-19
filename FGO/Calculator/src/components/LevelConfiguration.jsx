import React from 'react';
import Icon from './AppIcon';

const LevelConfiguration = ({ 
  currentLevel, 
  targetLevel, 
  currentAscension, 
  targetAscension,
  onCurrentLevelChange,
  onTargetLevelChange,
  onCurrentAscensionChange,
  onTargetAscensionChange,
  maxLevel = 90,
  errors
}) => {
  const levelDifference = targetLevel - currentLevel;
  const isPalingenesis = targetLevel > 90;
  
  // Handle click on current ascension pips
  const handleCurrentAscensionClick = (pipNumber) => {
    if (pipNumber === currentAscension) {
      onCurrentAscensionChange(Math.max(0, pipNumber - 1));
    } else {
      onCurrentAscensionChange(pipNumber);
    }
  };

  // Handle click on target ascension pips
  const handleTargetAscensionClick = (pipNumber) => {
    if (pipNumber === targetAscension) {
      onTargetAscensionChange(Math.max(0, pipNumber - 1));
    } else {
      onTargetAscensionChange(pipNumber);
    }
  };

  // Ascension Pips helper
  const renderPips = (count, isTarget = false) => {
    const handleClick = isTarget ? handleTargetAscensionClick : handleCurrentAscensionClick;
    
    return (
      <div className="flex gap-1 sm:gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            className={`w-6 h-6 sm:w-7 sm:h-7 rotate-45 border-2 transition-all duration-200 flex items-center justify-center ${
              i <= count 
                ? `${
                    isTarget 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 shadow-md hover:shadow-lg' 
                      : 'bg-gradient-to-br from-slate-500 to-slate-600 border-slate-700 shadow-md hover:shadow-lg'
                  } transform hover:scale-110 active:scale-95` 
                : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            } ${i === 0 ? 'invisible' : ''} cursor-pointer`}
            aria-label={`${isTarget ? 'Target' : 'Current'} Ascension Phase ${i}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-slate-100 bg-white">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Icon name="TrendingUp" size={16} className="text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Level & Ascension</h2>
          </div>
          {isPalingenesis && (
            <span className="text-xs text-blue-600 font-medium">
              Palingenesis
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6 sm:space-y-8">
        {/* Level Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Servant Level</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-semibold text-slate-800">{currentLevel}</span>
                <Icon name="ArrowRight" size={14} className="text-slate-400" />
                <span className="text-lg sm:text-xl font-semibold text-blue-600">{targetLevel}</span>
              </div>
            </div>
            
          </div>

          {/* Level Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm sm:text-md font-semibold text-slate-600 mb-1">Current :</label>
              <input
                type="number"
                min="1"
                max={maxLevel}
                value={currentLevel}
                onChange={(e) => onCurrentLevelChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-md font-semibold text-slate-600 mb-1">Target :</label>
              <input
                type="number"
                min="1"
                max={120}
                value={targetLevel}
                onChange={(e) => onTargetLevelChange(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded focus:outline-none focus:ring-1 text-center ${
                  isPalingenesis 
                    ? 'border-blue-300 bg-blue-50 focus:border-blue-500 focus:ring-blue-500 text-blue-700' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Ascension Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Ascension Rank</h3>
            
            {/* Current Ascension Pips */}
            <div className="space-y-3 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-center flex-1">
                  <div className="flex justify-center">
                    {renderPips(currentAscension, false)}
                  </div>
                  <div className="text-sm font-medium text-slate-700 mt-2">
                    Current: <span className="font-bold">{currentAscension}/4</span>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <Icon name="ArrowRight" size={16} className="text-slate-400" />
                </div>
                <div className="md:hidden">
                  <Icon name="ArrowDown" size={16} className="text-slate-400 mx-auto" />
                </div>
                
                {/* Target Ascension Pips */}
                <div className="text-center flex-1">
                  <div className="flex justify-center">
                    {renderPips(targetAscension, true)}
                  </div>
                  <div className="text-sm font-medium text-blue-600 mt-2">
                    Target: <span className="font-bold">{targetAscension}/4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelConfiguration;