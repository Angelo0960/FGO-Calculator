import React from 'react';
import Icon from './AppIcon';

const SkillConfiguration = ({ skillNames = [], skillIcons = [], skills, onSkillChange, errors }) => {
  const MAX_LEVEL = 10;
  
  const defaultIcons = ['Zap', 'Shield', 'Sword'];
  const defaultColors = ['bg-blue-500', 'bg-blue-600', 'bg-blue-700'];

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-blue-100 shadow-sm sm:shadow-xl overflow-hidden transition-all duration-300">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-100 bg-blue-700 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-md sm:rounded-lg shadow-blue-200 shadow-md sm:shadow-lg">
            <Icon name="Sparkles" size={14} sm:size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-xl font-bold sm:font-black uppercase tracking-wide sm:tracking-[0.2em] text-blue-100">
              Skill Configuration
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] font-medium sm:font-black text-blue-300">
          <Icon name="Zap" size={10} sm:size={12} />
          <span className="hidden sm:inline">{skillNames.length} SKILLS</span>
          <span className="sm:hidden">{skillNames.length}</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-blue-50/30">
        {skills?.map((skill, index) => {
          const skillName = skillNames[index] || `Skill ${index + 1}`;
          const skillIcon = skillIcons[index];
          const iconName = defaultIcons[index] || 'Circle';
          const colorClass = defaultColors[index] || 'bg-blue-500';
          
          const current = skill?.current || 1;
          const target = skill?.target || 1;
          const isMaxed = target === MAX_LEVEL;
          const isInvalid = target < current;
          
          return (
            <div key={index} className="group relative overflow-hidden bg-blue-50/30 border border-blue-100 sm:border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all hover:bg-white hover:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                {skillIcon ? (
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-400 rounded-lg rotate-2 scale-105 opacity-20 group-hover:rotate-3 transition-transform" />
                    <img 
                      src={skillIcon} 
                      alt={skillName}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl shadow-lg ring-2 ring-white object-contain relative z-10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="relative">
                            <div class="absolute inset-0 bg-blue-400 rounded-lg rotate-2 scale-105 opacity-20 group-hover:rotate-3 transition-transform"></div>
                            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colorClass} flex items-center justify-center shadow-lg ring-2 ring-white relative z-10">
                              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                              </svg>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-400 rounded-lg rotate-2 scale-105 opacity-20 group-hover:rotate-3 transition-transform" />
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colorClass} flex items-center justify-center shadow-lg ring-2 ring-white relative z-10`}>
                      <Icon name={iconName} size={16} sm:size={20} className="text-white" />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg font-bold sm:font-black text-blue-900 truncate">
                      {skillName}
                    </h3>
                    {skillNames[index] && (
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-500 tracking-tight">
                        Active Skill {index + 1}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-bold text-blue-700">Current :</label>
                      <input
                        type="number"
                        min="1"
                        max={MAX_LEVEL}
                        value={current}
                        onChange={(e) => onSkillChange(index, 'current', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center font-bold text-blue-900 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-bold text-blue-700">Target :</label>
                      <input
                        type="number"
                        min="1"
                        max={MAX_LEVEL}
                        value={target}
                        onChange={(e) => onSkillChange(index, 'target', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 text-center font-bold ${
                          isMaxed 
                            ? 'border-amber-300 bg-amber-50 focus:ring-amber-400 text-amber-800' 
                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-blue-900 bg-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {isInvalid && (
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
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