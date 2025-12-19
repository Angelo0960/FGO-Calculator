import React from 'react';
import Icon from './AppIcon';

const SkillConfiguration = ({ skills, onSkillChange, errors }) => {
  const SKILL_CONFIG = [
    { name: 'Primary Skill', icon: 'Zap', color: 'bg-blue-500' },
    { name: 'Second Skill', icon: 'Shield', color: 'bg-blue-600' },
    { name: 'Third Skill', icon: 'Sword', color: 'bg-blue-700' }
  ];
  
  const MAX_LEVEL = 10;

  return (
    <div className="bg-white rounded-xl border border-blue-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Icon name="Sparkles" size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-900 tracking-tight">Skill Configuration</h2>
              <p className="text-sm text-blue-600 mt-1 font-medium">Set current and target skill levels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="p-6 space-y-8">
        {skills?.map((skill, index) => {
          const config = SKILL_CONFIG[index];
          const current = skill?.current || 1;
          const target = skill?.target || 1;
          const isMaxed = target === MAX_LEVEL;
          const isInvalid = target < current;
          
          return (
            <div key={index} className="space-y-6">
              {/* Skill Header */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={config.icon} size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-blue-900 text-lg">{config.name}</h3>
                    <div className="text-sm font-medium text-blue-700">
                      Level <span className="text-blue-900 text-base">{current}</span> → 
                      <span className={`ml-2 ${isMaxed ? 'text-amber-600' : 'text-blue-900'} text-base`}>
                        {target}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Controls */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Current Level</label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_LEVEL}
                    value={current}
                    onChange={(e) => onSkillChange(index, 'current', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium text-blue-900 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Target Level</label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_LEVEL}
                    value={target}
                    onChange={(e) => onSkillChange(index, 'target', parseInt(e.target.value) || 1)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-center font-medium text-lg ${
                      isMaxed 
                        ? 'border-amber-300 bg-amber-50 focus:ring-amber-400 text-amber-800' 
                        : 'border-blue-200 focus:ring-blue-500 focus:border-transparent text-blue-900'
                    }`}
                  />
                </div>
              </div>
              
              {/* Validation Message */}
              {isInvalid && (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                  Target level must be greater than current level
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillConfiguration;