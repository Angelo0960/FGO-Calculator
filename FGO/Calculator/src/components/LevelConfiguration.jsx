import React from 'react';
import Input from './Input';
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
  
  // Ascension Pips helper
  const renderPips = (count, isTarget = false) => {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rotate-45 border transition-all duration-300 ${
              i <= count 
                ? `bg-blue-500 border-blue-600 shadow-sm`
                : 'bg-slate-100 border-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Icon name="TrendingUp" size={16} className="text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Level & Ascension</h2>
          </div>
          {isPalingenesis && (
            <span className="text-xs text-blue-600 font-medium">
              Palingenesis
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* Level Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Servant Level</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-800">{currentLevel}</span>
                <Icon name="ArrowRight" size={14} className="text-slate-400" />
                <span className="text-lg font-semibold text-blue-600">{targetLevel}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Max: {maxLevel}</div>
              <div className="text-xs text-blue-600">
                {levelDifference > 0 ? `+${levelDifference} levels` : ''}
              </div>
            </div>
          </div>

          {/* Level Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Current</label>
              <input
                type="number"
                min="1"
                max={maxLevel}
                value={currentLevel}
                onChange={(e) => onCurrentLevelChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Target</label>
              <input
                type="number"
                min="1"
                max={120}
                value={targetLevel}
                onChange={(e) => onTargetLevelChange(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-center ${
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
            <h3 className="text-sm font-medium text-slate-700 mb-4">Ascension Rank</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-2">Current</div>
                {renderPips(currentAscension)}
                <div className="text-sm font-medium text-slate-700 mt-2">{currentAscension}/4</div>
              </div>
              <Icon name="ArrowRight" size={16} className="text-slate-400" />
              <div className="text-center">
                <div className="text-xs text-blue-600 mb-2 font-medium">Target</div>
                {renderPips(targetAscension, true)}
                <div className="text-sm font-medium text-blue-600 mt-2">{targetAscension}/4</div>
              </div>
            </div>
          </div>

          {/* Ascension Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Current Phase</label>
              <input
                type="number"
                min="0"
                max="4"
                value={currentAscension}
                onChange={(e) => onCurrentAscensionChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Target Phase</label>
              <input
                type="number"
                min="0"
                max="4"
                value={targetAscension}
                onChange={(e) => onTargetAscensionChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelConfiguration;