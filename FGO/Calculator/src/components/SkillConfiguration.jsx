import React from 'react';
import Icon from './AppIcon';

const SkillConfiguration = ({ skills, onSkillChange, errors }) => {
  const SKILL_CONFIG = [
    { name: 'Primary Skill', icon: 'Zap', color: 'bg-blue-500' },
    { name: 'Second Skill', icon: 'Shield', color: 'bg-indigo-500' },
    { name: 'Third Skill', icon: 'Sword', color: 'bg-violet-500' }
  ];
  
  const MAX_LEVEL = 10;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Simple Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Icon name="Sparkles" size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Skills</h2>
          </div>
         
        </div>
      </div>

      {/* Skills List */}
      <div className="p-5 space-y-6">
        {skills?.map((skill, index) => {
          const config = SKILL_CONFIG[index];
          const current = skill?.current || 1;
          const target = skill?.target || 1;
          const isMaxed = target === MAX_LEVEL;
          const isInvalid = target < current;
          const progress = (current / MAX_LEVEL) * 100;
          
          return (
            <div key={index} className="space-y-4">
              {/* Skill Title */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon name={config.icon} size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800">{config.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold">{current}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className={`font-semibold ${isMaxed ? 'text-amber-600' : 'text-slate-800'}`}>
                        {target}
                      </span>
                    </div>
                    
                  </div>
                </div>
              </div>

              

              {/* Level Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-2 font-medium">Current</label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_LEVEL}
                    value={current}
                    onChange={(e) => onSkillChange(index, 'current', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-2 font-medium">Target</label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_LEVEL}
                    value={target}
                    onChange={(e) => onSkillChange(index, 'target', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-center font-medium ${
                      isMaxed 
                        ? 'border-amber-200 bg-amber-50 focus:ring-amber-500 text-amber-700' 
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                </div>
              </div>
              
              {/* Status Message */}
              {isInvalid && (
                <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  Target must be greater than current level
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Simple Footer */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
        <div className="text-center">
        
        </div>
      </div>
    </div>
  );
};

export default SkillConfiguration;