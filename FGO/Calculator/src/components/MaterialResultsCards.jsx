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
    if (deficit <= 0) return { text: 'Complete', bg: 'bg-green-100', border: 'border-green-200', color: 'text-green-700' };
    if (deficit <= 10) return { text: 'Low Stock', bg: 'bg-amber-100', border: 'border-amber-200', color: 'text-amber-700' };
    return { text: 'Critical', bg: 'bg-red-100', border: 'border-red-200', color: 'text-red-700' };
  };

  // Function to split long material names into multiple lines
  const formatMaterialName = (name, maxWordsPerLine = 2) => {
    if (!name) return '';
    
    const words = name.split(' ');
    
    if (words.length <= maxWordsPerLine) {
      return name;
    }
    
    // Split into chunks of maxWordsPerLine
    const chunks = [];
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      chunks.push(words.slice(i, i + maxWordsPerLine).join(' '));
    }
    
    return chunks.join('\n');
  };

  // Function to format large numbers with K/M abbreviations
  const formatLargeNumber = (number) => {
    if (number === undefined || number === null) return '0';
    
    const num = Number(number);
    if (isNaN(num)) return '0';
    
    // Handle very large numbers (millions)
    if (num >= 1000000) {
      const millions = num / 1000000;
      // Show 1 decimal place for numbers between 1M and 10M, otherwise no decimals
      if (millions < 10) {
        return `${millions.toFixed(1)}M`;
      }
      return `${Math.round(millions)}M`;
    }
    
    // Handle thousands
    if (num >= 10000) {
      const thousands = num / 1000;
      // Show no decimals for thousands
      return `${Math.round(thousands)}K`;
    }
    
    if (num >= 1000) {
      const thousands = num / 1000;
      // Show 1 decimal place for numbers between 1K and 10K
      if (thousands < 10) {
        return `${thousands.toFixed(1)}K`;
      }
      return `${Math.round(thousands)}K`;
    }
    
    // For numbers less than 1000, just return the number
    return num.toString();
  };

  // Empty state
  if (!hasCalculated || !selectedServant) {
    return (
      <div className="bg-white rounded-xl border border-blue-100">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-200">
              <Icon name="Package" size={24} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Material Requirements</h3>
            <p className="text-blue-600 max-w-md">
              Select a servant and click "Calculate Requirements" to see material needs
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Icon name="Package" size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-900 tracking-tight">Material Requirements</h2>
                <p className="text-sm text-blue-600 mt-1 font-medium">
                  {materials.length} materials needed for {selectedServant?.name || 'selected servant'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Material Cards Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials?.map((material) => {
              const status = getStatusBadge(material?.deficit);
              const formattedName = formatMaterialName(material?.name, 2); // Max 2 words per line
              const hasMultipleLines = formattedName.includes('\n');
              
              return (
                <div 
                  key={material?.id} 
                  className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border-2 border-blue-200 flex-shrink-0">
                      <Image 
                        src={material?.icon} 
                        alt={material?.iconAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div 
                            className={`text-base font-semibold text-blue-900 ${
                              hasMultipleLines 
                                ? 'whitespace-pre-line leading-tight' 
                                : 'truncate'
                            }`}
                            title={material?.name}
                          >
                            {hasMultipleLines ? formattedName : material?.name}
                          </div>
                        </div>
                        
                      </div>
                      {/* Material type/rariity if available */}
                      
                    </div>
                  </div>
                  
                  {/* Material Stats - Fixed overflow for large numbers */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded border border-blue-100 overflow-hidden">
                        <div className="text-xs font-medium text-blue-600 mb-1 truncate px-1">Required</div>
                        <div 
                          className="font-bold text-blue-900 text-lg truncate px-1" 
                          title={material?.required?.toLocaleString()}
                        >
                          {formatLargeNumber(material?.required)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded border border-blue-100 overflow-hidden">
                        <div className="text-xs font-medium text-blue-600 mb-1 truncate px-1">Current</div>
                        <div 
                          className="font-medium text-blue-700 text-lg truncate px-1" 
                          title={material?.current?.toLocaleString()}
                        >
                          {formatLargeNumber(material?.current)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded border border-blue-100 overflow-hidden">
                        <div className="text-xs font-medium text-blue-600 mb-1 truncate px-1">Needed</div>
                        <div 
                          className={`font-bold text-lg truncate px-1 ${getStatusColor(material?.deficit)}`}
                          title={material?.deficit > 0 ? material?.deficit?.toLocaleString() : '0'}
                        >
                          {material?.deficit > 0 ? formatLargeNumber(material?.deficit) : 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialResultsCards;