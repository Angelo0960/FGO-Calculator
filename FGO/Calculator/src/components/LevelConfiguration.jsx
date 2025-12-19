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
  
  const handleCurrentAscensionClick = (pipNumber) => {
    if (pipNumber === currentAscension) {
      onCurrentAscensionChange(Math.max(0, pipNumber - 1));
    } else {
      onCurrentAscensionChange(pipNumber);
    }
  };

  const handleTargetAscensionClick = (pipNumber) => {
    if (pipNumber === targetAscension) {
      onTargetAscensionChange(Math.max(0, pipNumber - 1));
    } else {
      onTargetAscensionChange(pipNumber);
    }
  };

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
                      : 'bg-gradient-to-br from-blue-400 to-blue-500 border-blue-600 shadow-md hover:shadow-lg'
                  } transform hover:scale-110 active:scale-95` 
                : 'bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50'
            } ${i === 0 ? 'invisible' : ''} cursor-pointer`}
            aria-label={`${isTarget ? 'Target' : 'Current'} Ascension Phase ${i}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-blue-100 shadow-sm sm:shadow-xl overflow-hidden transition-all duration-300">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-100 bg-blue-700 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-md sm:rounded-lg">
            <Icon name="TrendingUp" size={25} sm:size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-xl font-bold sm:font-black uppercase tracking-wide sm:tracking-[0.2em] text-blue-100">
              Level & Ascension
            </h2>
          </div>
        </div>
        {isPalingenesis && (
          <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] font-medium sm:font-black text-blue-300 animate-pulse">
            <Icon name="Zap" size={10} sm:size={12} />
            <span className="hidden sm:inline">PALINGENESIS</span>
            <span className="sm:hidden">PAL</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-blue-50/30">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-lg sm:text-xl font-bold sm:font-black text-blue-900 tracking-tight">
              Servant Level
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-black text-blue-600">{currentLevel}</span>
                <Icon name="ArrowRight" size={20} sm:size={24} className="text-blue-400" />
                <span className="text-2xl sm:text-3xl font-black text-blue-700">{targetLevel}</span>
              </div>
              {levelDifference > 0 && (
                <div className="text-sm sm:text-base font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  +{levelDifference}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm sm:text-base font-bold text-blue-700">Current :</label>
              <input
                type="number"
                min="1"
                max={maxLevel}
                value={currentLevel}
                onChange={(e) => onCurrentLevelChange(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 text-sm sm:text-base border border-blue-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-center font-bold text-blue-900 bg-white"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm sm:text-base font-bold text-blue-700">Target :</label>
              <input
                type="number"
                min="1"
                max={120}
                value={targetLevel}
                onChange={(e) => onTargetLevelChange(parseInt(e.target.value) || 1)}
                className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 text-center font-bold ${
                  isPalingenesis 
                    ? 'border-blue-300 bg-blue-100/50 focus:border-blue-500 focus:ring-blue-500/30 text-blue-800' 
                    : 'border-blue-200 focus:border-blue-500 focus:ring-blue-500/30 text-blue-900 bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 sm:pt-6 border-t border-blue-100 space-y-4 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-bold sm:font-black text-blue-900 tracking-tight">
            Ascension Rank
          </h3>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-center flex-1 space-y-2">
                <div className="flex justify-center">
                  {renderPips(currentAscension, false)}
                </div>
                <div className="text-sm font-bold text-blue-700">
                  Current: <span className="font-black">{currentAscension}/4</span>
                </div>
              </div>
              
              <div className="hidden md:block">
                <Icon name="ArrowRight" size={20} className="text-blue-400" />
              </div>
              <div className="md:hidden">
                <Icon name="ArrowDown" size={20} className="text-blue-400 mx-auto" />
              </div>
              
              <div className="text-center flex-1 space-y-2">
                <div className="flex justify-center">
                  {renderPips(targetAscension, true)}
                </div>
                <div className="text-sm font-bold text-blue-800">
                  Target: <span className="font-black">{targetAscension}/4</span>
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