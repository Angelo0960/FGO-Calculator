import React from 'react';
import Icon from './AppIcon';
import Image from './AppImage';
import Button from './Button';

const MaterialResultsCards = ({ materials, onInventoryUpdate, onExport, hasCalculated, selectedServant }) => {
  const getStatusColor = (deficit) => {
    if (deficit <= 0) return 'text-green-600';
    if (deficit <= 10) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusIcon = (deficit) => {
    if (deficit <= 0) return 'CheckCircle2';
    if (deficit <= 10) return 'AlertCircle';
    return 'XCircle';
  };

  const getStatusBadge = (deficit) => {
    if (deficit <= 0) return { text: 'Complete', bg: 'bg-green-100', color: 'text-green-700' };
    if (deficit <= 10) return { text: 'Low Stock', bg: 'bg-amber-100', color: 'text-amber-700' };
    return { text: 'Critical', bg: 'bg-red-100', color: 'text-red-700' };
  };

  // Empty state
  if (!hasCalculated || !selectedServant) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
              <Icon name="Package" size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Material Requirements</h2>
              <p className="text-sm text-slate-600">Select a servant and calculate to see requirements</p>
            </div>
          </div>
          <div className="text-center py-6">
            <Icon name="Calculator" size={48} className="text-blue-300 mx-auto mb-4" />
            <p className="text-slate-500">
              Configure your servant and click "Calculate Requirements" to see QP, Embers, and material needs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
              <Icon name="CheckCircle" size={24} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">All Requirements Met!</h2>
              <p className="text-sm text-slate-600">No additional materials needed</p>
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-slate-500">
              Your servant is already at the target levels, ascension, and skills.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
              <Icon name="Package" size={20} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold text-blue-700">Materials ({materials.length})</h1>
          </div>
          
        </div>

        <div className="grid gap-3">
          {materials?.map((material) => {
            const status = getStatusBadge(material?.deficit);
            
            return (
              <div 
                key={material?.id} 
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    <Image 
                      src={material?.icon} 
                      alt={material?.iconAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg pt-4 font-medium text-blue-900">{material?.name}</h3>
                     
                    </div>
                    
                    
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-md text-slate-700 mb-1">Required</p>
                    <p className="font-semibold text-slate-900">{material?.required?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-md text-slate-500 mb-1">Current</p>
                    <p className="text-slate-600">{material?.current?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-md text-slate-500 mb-1">Deficit</p>
                    <p className={`font-semibold ${getStatusColor(material?.deficit)}`}>
                      {material?.deficit > 0 ? material?.deficit?.toLocaleString() : 0}
                    </p>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default MaterialResultsCards;