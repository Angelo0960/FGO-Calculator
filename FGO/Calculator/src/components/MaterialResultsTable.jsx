import React from 'react';
import Icon from './AppIcon';
import Button from './Button';

const MaterialResultsTable = ({ materials, onInventoryUpdate, onExport, hasCalculated, selectedServant, loading }) => {
  const mergedMaterials = React.useMemo(() => {
    if (!materials || materials.length === 0) return [];
    
    const materialMap = new Map();
    
    materials.forEach(material => {
      let materialId;
      
      if (typeof material.id === 'string') {
        const parts = material.id.split('-');
        if (parts.length > 1 && !isNaN(parts[1])) {
          materialId = parts[1];
        } else if (!isNaN(parts[0])) {
          materialId = parts[0];
        } else {
          materialId = material.id;
        }
      } else {
        materialId = material.id.toString();
      }
      
      if (materialMap.has(materialId)) {
        const existing = materialMap.get(materialId);
        materialMap.set(materialId, {
          ...existing,
          required: existing.required + material.required,
          deficit: Math.max(0, (existing.required + material.required) - (existing.current || 0))
        });
      } else {
        materialMap.set(materialId, {
          ...material,
          id: materialId,
          originalId: material.id
        });
      }
    });
    
    return Array.from(materialMap.values());
  }, [materials]);

  const getStatusColor = (deficit) => {
    if (deficit <= 0) return 'text-green-600';
    if (deficit <= 10) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusBgColor = (deficit) => {
    if (deficit <= 0) return 'bg-green-100 border-green-200';
    if (deficit <= 10) return 'bg-amber-100 border-amber-200';
    return 'bg-red-100 border-red-200';
  };

  const getStatusIcon = (deficit) => {
    if (deficit <= 0) return 'CheckCircle';
    if (deficit <= 10) return 'AlertTriangle';
    return 'XCircle';
  };

  const handleInventoryUpdate = (materialId, change) => {
    if (onInventoryUpdate) {
      const matchingMaterials = materials.filter(m => {
        const mId = m.id.toString();
        if (mId.includes('-')) {
          const parts = mId.split('-');
          return parts[1] === materialId;
        }
        return mId === materialId;
      });
      
      matchingMaterials.forEach(m => {
        onInventoryUpdate(m.id, change);
      });
    }
  };

  // Empty state
  if (!hasCalculated || !selectedServant) {
    return (
      <div className="bg-white rounded-xl border border-blue-100">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-200">
              <Icon name="Package" size={25} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">Material Requirements</h3>
            <p className="text-blue-600 max-w-md">
              Select a servant and click "Calculate Requirements" to see material needs
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-blue-100">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Loading Materials</h3>
            <p className="text-blue-600">Fetching data from Atlas Academy API...</p>
          </div>
        </div>
      </div>
    );
  }

  if (mergedMaterials.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-blue-100">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-200">
              <Icon name="CheckCircle" size={24} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">All Requirements Met!</h3>
            <p className="text-blue-600 max-w-md">
              Your servant is already at the target levels. No additional materials are needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100">
      {/* Header - Desktop */}
      <div className="p-6 rounded-lg border-blue-100 bg-blue-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            
            
            {/* Simple recessed area */}
            <div className="absolute inset-0 bg-blue-700 rounded-lg 
              border border-blue-900/50"></div>
            
            {/* Simple icon container */}
            <div className="relative p-2 rounded-md bg-blue-50">
              <Icon name="Package" size={25} className="text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-xl font-bold sm:font-black uppercase tracking-wide sm:tracking-[0.2em] text-blue-100">
              Material Requirements
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-blue-300 font-bold text-lg">
                {mergedMaterials.length} materials needed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header - Mobile */}
      <div className="p-4 border-b border-blue-100 bg-blue-700 md:hidden">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <div className="absolute -inset-[1px] bg-blue-100 rounded-lg border border-blue-300"></div>
              <div className="relative p-1.5 rounded bg-blue-600">
                <Icon name="Package" size={14} className="text-white" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-blue-100">Materials Needed</h2>
          </div>
          <p className="text-sm text-blue-300 font-medium">
            {mergedMaterials.length} materials required
          </p>
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="overflow-x-auto hidden md:block">
        <div className="min-w-full">
          {/* Table Header - Desktop */}
          <div className="grid grid-cols-12 bg-blue-100 border-b border-blue-200">
            <div className="col-span-5 p-4 text-sm font-bold text-blue-700 uppercase tracking-wide">Material</div>
            <div className="col-span-2 p-4 text-sm font-bold text-blue-700 uppercase tracking-wide text-center">Required</div>
            <div className="col-span-2 p-4 text-sm font-bold text-blue-700 uppercase tracking-wide text-center">Current</div>
            <div className="col-span-3 p-4 text-sm font-bold text-blue-700 uppercase tracking-wide text-center">Status</div>
          </div>

          {/* Table Body - Desktop */}
          <div className="divide-y divide-blue-50">
            {mergedMaterials.map((material) => (
              <div 
                key={material.id} 
                className="grid grid-cols-12 hover:bg-blue-50/50 transition-colors"
              >
                {/* Material Info - Desktop */}
                <div className="col-span-5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-blue-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={material.icon} 
                        alt={material.iconAlt || material.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://static.atlasacademy.io/NA/Items/99.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-blue-900 truncate">{material.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-blue-500">{material.rarity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required - Desktop */}
                <div className="col-span-2 p-4 flex items-center justify-center">
                  <span className="font-bold text-blue-900">{material.required.toLocaleString()}</span>
                </div>

                {/* Current - Desktop */}
                <div className="col-span-2 p-4 flex items-center justify-center">
                  <span className="font-bold text-blue-600">{material.current.toLocaleString()}</span>
                </div>

                {/* Status - Desktop */}
                <div className="col-span-3 p-4 flex items-center justify-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusBgColor(material.deficit)}`}>
                    <Icon 
                      name={getStatusIcon(material.deficit)} 
                      size={14} 
                      className={getStatusColor(material.deficit)}
                    />
                    <span className={`font-bold text-sm ${getStatusColor(material.deficit)}`}>
                      {material.deficit > 0 ? `${material.deficit.toLocaleString()} needed` : 'Complete'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden">
        <div className="divide-y divide-blue-50">
          {mergedMaterials.map((material) => (
            <div key={material.id} className="p-4 hover:bg-blue-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                {/* Material Info - Mobile */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-white border border-blue-200 overflow-hidden flex-shrink-0">
                    <img 
                      src={material.icon} 
                      alt={material.iconAlt || material.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://static.atlasacademy.io/NA/Items/99.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-blue-900 truncate">{material.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-blue-500">{material.rarity}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge - Mobile */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusBgColor(material.deficit)}`}>
                  <Icon 
                    name={getStatusIcon(material.deficit)} 
                    size={14} 
                    className={getStatusColor(material.deficit)}
                  />
                  <span className={`font-bold text-sm ${getStatusColor(material.deficit)}`}>
                    {material.deficit > 0 ? material.deficit.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              {/* Stats Row - Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <div className="text-xs font-bold text-blue-700 mb-1">Required</div>
                  <div className="font-bold text-blue-900 text-lg">{material.required.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <div className="text-xs font-bold text-blue-700 mb-1">Current</div>
                  <div className="font-bold text-blue-600 text-lg">{material.current.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialResultsTable;