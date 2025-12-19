import React, { useState, useEffect } from 'react';
import Select from './Select';
import Icon from './AppIcon';

const ServantSelector = ({ selectedServant, onServantChange, onSkillsUpdate }) => {
  const [servants, setServants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    const fetchServants = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.atlasacademy.io/export/NA/nice_servant.json');
        if (!response.ok) throw new Error('Data fetch failed');
        const data = await response.json();

        const formatted = data
          .filter(s => s.type === 'normal' && s.collectionNo)
          .map(s => ({
            id: s.id,
            name: s.name,
            class: s.className,
            rarity: s.rarity,
            icon: s.extraAssets?.faces?.ascension?.[1] || Object.values(s.extraAssets?.faces?.ascension || {})[0],
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setServants(formatted);
      } catch (err) {
        setError('Connection to Database failed');
      } finally {
        setLoading(false);
      }
    };
    fetchServants();
  }, []);

  // Fetch skills with icons when servant is selected
  useEffect(() => {
    const fetchSkills = async () => {
      if (!selectedServant) {
        setSkills([]);
        if (onSkillsUpdate) onSkillsUpdate([]);
        return;
      }

      try {
        setLoadingSkills(true);
        const response = await fetch('https://api.atlasacademy.io/export/NA/nice_servant.json');
        if (!response.ok) throw new Error('Data fetch failed');
        const data = await response.json();
        
        const selectedServantData = data.find(s => s.id === selectedServant);
        
        if (selectedServantData && selectedServantData.skills) {
          // Extract detailed skill information including names, details, and icons
          const skillDetails = selectedServantData.skills.slice(0, 3).map((skill, index) => {
            // Get skill icon from extraAssets
            let skillIcon = null;
            if (selectedServantData.extraAssets?.skills) {
              // Try to get the skill icon by skill ID
              const skillId = skill.id || skill.num;
              if (skillId && selectedServantData.extraAssets.skills[skillId]) {
                skillIcon = selectedServantData.extraAssets.skills[skillId];
              } else {
                // Fallback to skill num
                const skillNum = skill.num || index + 1;
                if (selectedServantData.extraAssets.skills[skillNum]) {
                  skillIcon = selectedServantData.extraAssets.skills[skillNum];
                }
              }
            }
            
            // Fallback to skill icon URL from skill data
            if (!skillIcon && skill.icon) {
              skillIcon = skill.icon;
            }
            
            return {
              id: skill.id || index,
              name: skill.name || skill.detail || `Skill ${index + 1}`,
              detail: skill.detail || '',
              icon: skillIcon,
              num: skill.num || index + 1,
              originalData: skill
            };
          });
          
          setSkills(skillDetails);
          
          // Notify parent component about the skill details
          if (onSkillsUpdate) {
            onSkillsUpdate(skillDetails);
          }
        } else {
          const emptySkills = [
            { id: 1, name: 'Skill 1', detail: '', icon: null, num: 1 },
            { id: 2, name: 'Skill 2', detail: '', icon: null, num: 2 },
            { id: 3, name: 'Skill 3', detail: '', icon: null, num: 3 }
          ];
          setSkills(emptySkills);
          if (onSkillsUpdate) onSkillsUpdate(emptySkills);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        const fallbackSkills = [
          { id: 1, name: 'Skill 1', detail: '', icon: null, num: 1 },
          { id: 2, name: 'Skill 2', detail: '', icon: null, num: 2 },
          { id: 3, name: 'Skill 3', detail: '', icon: null, num: 3 }
        ];
        setSkills(fallbackSkills);
        if (onSkillsUpdate) onSkillsUpdate(fallbackSkills);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [selectedServant, onSkillsUpdate]);

  const selectedData = servants.find(s => s.id === selectedServant);

  const options = servants
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(s => ({
      value: s.id,
      label: s.name,
      description: s.class,
    }));

  const getRarityColor = (rarity) => {
    if (rarity >= 4) return 'text-amber-500';
    if (rarity === 3) return 'text-slate-400';
    return 'text-orange-500';
  };

  const handleServantChange = (servantId) => {
    setSkills([]);
    onServantChange(servantId);
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm sm:shadow-xl overflow-hidden transition-all duration-300">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-blue-700 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-md sm:rounded-lg">
            <Icon name="User" size={25} sm:size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-xl font-bold sm:font-black uppercase tracking-wide sm:tracking-[0.2em] text-blue-100">
              Servant Profile
            </h2>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] font-medium sm:font-black text-blue-500 animate-pulse">
            <Icon name="RefreshCw" size={10} sm:size={12} className="animate-spin" />
            <span className="hidden sm:inline">SYNCING</span>
            <span className="sm:hidden">SYNC</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-blue-50/30">
        <div className="space-y-1 sm:space-y-2">
          <Select
            placeholder={loading ? "Accessing Records..." : "Input Servant Name..."}
            options={options}
            value={selectedServant}
            onChange={handleServantChange}
            onSearchChange={setSearchQuery}
            loading={loading}
            searchable
            className="ring-offset-1 sm:ring-offset-2 focus:ring-1 sm:focus:ring-2 ring-blue-500 transition-all"
            renderOption={(opt) => {
              const s = servants.find(i => i.id === opt.value);
              return (
                <div className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded sm:rounded-md bg-slate-100 overflow-hidden border border-slate-200">
                    <img src={s?.icon} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium sm:font-bold truncate text-slate-900">{s?.name}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold sm:font-black text-blue-500 tracking-tight sm:tracking-tighter">
                      {s?.class}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          {error && (
            <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded bg-red-50 text-red-600 text-xs font-medium sm:font-bold">
              <Icon name="AlertCircle" size={12} sm:size={14} />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>

        {selectedData ? (
          <div className="group relative overflow-hidden bg-blue-50/30 border border-blue-100 sm:border-2 rounded-lg sm:rounded-2xl p-3 sm:p-5 transition-all hover:bg-white hover:shadow-lg sm:hover:shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10">
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div className="absolute inset-0 bg-blue-500 rounded-lg sm:rounded-xl rotate-2 sm:rotate-3 scale-105 opacity-20 group-hover:rotate-3 sm:group-hover:rotate-6 transition-transform" />
                <img 
                  src={selectedData.icon} 
                  alt={selectedData.name} 
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl ring-2 sm:ring-4 ring-white object-cover relative z-10"
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="inline-block px-2 py-0.5 rounded bg-blue-600 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wide sm:tracking-widest mb-1 sm:mb-2 shadow-md sm:shadow-lg shadow-blue-200">
                  {selectedData.class}
                </div>
                <h3 className="text-lg sm:text-2xl font-bold sm:font-black text-slate-900 truncate leading-tight mb-1 sm:mb-2">
                  {selectedData.name}
                </h3>
                <div className={`flex items-center justify-center sm:justify-start gap-1 text-sm ${getRarityColor(selectedData.rarity)}`}>
                  {'★'.repeat(selectedData.rarity)}
                </div>

                {/* Display fetched skill names with icons */}
                
              </div>

              <button 
                onClick={() => handleServantChange(null)}
                className="absolute top-2 right-2 sm:static sm:relative p-1 sm:p-2 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors self-start"
                title="Deselect Servant"
              >
                <Icon name="X" size={16} sm:size={20} />
              </button>
            </div>
            
            <div className="absolute -bottom-4 -right-4 opacity-[0.05] group-hover:scale-110 transition-transform hidden sm:block">
              <Icon name={selectedData.class} size={120} />
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded-lg sm:rounded-2xl py-8 sm:py-12 flex flex-col items-center justify-center bg-blue-50/20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 sm:mb-4">
              <Icon name="UserPlus" className="text-slate-300" size={24} sm:size={32} />
            </div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wide sm:tracking-widest">
              Awaiting Selection
            </p>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[8px] sm:text-[10px] font-bold">
        {selectedData && skills.length > 0 && (
          <div className="flex items-center gap-1 text-blue-600">
            <Icon name="Zap" size={8} sm:size={10} />
            <span>{skills.length} skill{skills.length !== 1 ? 's' : ''} detected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServantSelector;