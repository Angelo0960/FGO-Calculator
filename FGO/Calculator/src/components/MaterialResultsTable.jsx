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
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 border border-blue-200">
              <Icon name="Package" size={24} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Material Requirements</h3>
            <p className="text-slate-600 max-w-md">
              Select a servant and click "Calculate Requirements" to see material needs
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Materials</h3>
            <p className="text-slate-600">Fetching data from Atlas Academy API...</p>
          </div>
        </div>
      </div>
    );
  }

  if (mergedMaterials.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border border-green-200">
              <Icon name="CheckCircle" size={24} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">All Requirements Met!</h3>
            <p className="text-slate-600 max-w-md">
              Your servant is already at the target levels. No additional materials are needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Material Requirements</h2>
            <div className="flex items-center gap-3 mt-1">
              
            
            </div>
          </div>
          
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200">
            <div className="col-span-5 p-4 text-lg font-semibold text-slate-900">Material</div>
            <div className="col-span-2 p-4 text-lg font-semibold text-slate-900 text-center">Required</div>
            <div className="col-span-2 p-4 text-lg font-semibold text-slate-900 text-center">Current</div>
            <div className="col-span-3 p-4 text-lg font-semibold text-slate-900 text-center">Deficit</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {mergedMaterials.map((material) => (
              <div 
                key={material.id} 
                className="grid grid-cols-12 hover:bg-blue-50/30 transition-colors"
              >
                {/* Material Info */}
                <div className="col-span-5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={material.icon} 
                        alt={material.iconAlt || material.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/40x40/ccc/fff?text=?";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{material.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{material.rarity}</span>
                        
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required */}
                <div className="col-span-2 p-4 flex items-center justify-center">
                  <span className="font-semibold text-slate-900">{material.required.toLocaleString()}</span>
                </div>

                {/* Current */}
                <div className="col-span-2 p-4 flex items-center justify-center">
                  <span className="text-slate-600">{material.current.toLocaleString()}</span>
                </div>

                {/* Deficit with Status */}
                <div className="col-span-3 p-4 flex items-center justify-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusBgColor(material.deficit)}`}>
                    <Icon 
                      name={getStatusIcon(material.deficit)} 
                      size={14} 
                      className={getStatusColor(material.deficit)}
                    />
                    <span className={`font-medium ${getStatusColor(material.deficit)}`}>
                      {material.deficit > 0 ? material.deficit.toLocaleString() : 0}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
          
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default MaterialResultsTable;