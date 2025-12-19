import React, { useState, useEffect } from 'react';
import Select from './Select';
import Icon from './AppIcon';

const ServantSelector = ({ selectedServant, onServantChange }) => {
  const [servants, setServants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm sm:shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-blue-700/80
   flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-md sm:rounded-lg shadow-blue-200 shadow-md sm:shadow-lg">
            <Icon name="User" size={14} sm:size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xs sm:text-xs font-bold sm:font-black uppercase tracking-wide sm:tracking-[0.2em] text-slate-800">
              Servant Profile
            </h2>
            <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium sm:font-bold uppercase">
              Archive NA-2024
            </p>
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

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Search Field */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide sm:tracking-widest text-slate-400">
              Search Database
            </label>
          </div>
          <Select
            placeholder={loading ? "Accessing Records..." : "Input Servant Name..."}
            options={options}
            value={selectedServant}
            onChange={onServantChange}
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

        {/* Result Display */}
        {selectedData ? (
          <div className="group relative overflow-hidden bg-blue-50/30 border border-blue-100 sm:border-2 rounded-lg sm:rounded-2xl p-3 sm:p-5 transition-all hover:bg-white hover:shadow-lg sm:hover:shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10">
              {/* Portrait */}
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div className="absolute inset-0 bg-blue-500 rounded-lg sm:rounded-xl rotate-2 sm:rotate-3 scale-105 opacity-20 group-hover:rotate-3 sm:group-hover:rotate-6 transition-transform" />
                <img 
                  src={selectedData.icon} 
                  alt={selectedData.name} 
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl ring-2 sm:ring-4 ring-white object-cover relative z-10"
                />
              </div>

              {/* Identity Info */}
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
              </div>

              {/* Deselect Button */}
              <button 
                onClick={() => onServantChange(null)}
                className="absolute top-2 right-2 sm:static sm:relative p-1 sm:p-2 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors self-start"
                title="Deselect Servant"
              >
                <Icon name="X" size={16} sm:size={20} />
              </button>
            </div>
            
            {/* Background Icon - Hidden on mobile */}
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

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[8px] sm:text-[10px] font-bold">
        <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
          <Icon name="Database" size={10} sm:size={12} />
          <span className="hidden sm:inline">DATA SOURCE: </span>
          <span className="sm:hidden">SOURCE: </span>
          <span className="text-blue-500">ATLAS ACADEMY</span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button className="text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-tight sm:tracking-widest">
            Guide
          </button>
          <button className="text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-tight sm:tracking-widest">
            API Docs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServantSelector;