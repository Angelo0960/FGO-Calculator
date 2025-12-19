import React from 'react';
import Icon from './AppIcon';

const SkillConfiguration = ({ skillNames = [], skills, onSkillChange, errors }) => {
  const MAX_LEVEL = 10;
  
  // Default icons if we don't have enough skill names
  const defaultIcons = ['Zap', 'Shield', 'Sword'];
  const defaultColors = ['bg-blue-500', 'bg-blue-600', 'bg-blue-700'];

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
              <p className="text-sm text-blue-600 mt-1 font-medium">
                {skillNames.length > 0 
                  ? `Configure ${skillNames.length} skill${skillNames.length !== 1 ? 's' : ''}`
                  : 'Set current and target skill levels'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="p-6 space-y-8">
        {skills?.map((skill, index) => {
          // MODIFIED: Use the actual skill name passed from ServantSelector
          // Fallback to "Skill 1", "Skill 2", etc. only if the API name is missing
          const skillName = skillNames[index] || `Skill ${index + 1}`;
          const iconName = defaultIcons[index] || 'Circle';
          const colorClass = defaultColors[index] || 'bg-blue-500';
          
          const current = skill?.current || 1;
          const target = skill?.target || 1;
          const isMaxed = target === MAX_LEVEL;
          const isInvalid = target < current;
          
          return (
            <div key={index} className="space-y-6">
              {/* Skill Header */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={iconName} size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* MODIFIED: This now displays the real name (e.g., "Mana Burst") */}
                      <h3 className="font-semibold text-blue-900 text-lg">{skillName}</h3>
                      {/* Secondary label showing slot number if a custom name is active */}
                      {skillNames[index] && (
                        <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mt-0.5">
                          Active Skill {index + 1}
                        </p>
                      )}
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