import React from 'react';
import Icon from './AppIcon';

const MaterialDisplay = ({ materials, ownedQuantities, onOwnedChange }) => {
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 5: return 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-700/30';
      case 4: return 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/30';
      case 3: return 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700/30';
      case 2: return 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/30';
      default: return 'bg-gradient-to-br from-gray-800/20 to-gray-700/10 border-gray-600/30';
    }
  };

  const getRarityBadge = (rarity) => {
    const stars = '★'.repeat(rarity);
    switch(rarity) {
      case 5: return <span className="text-yellow-400">{stars}</span>;
      case 4: return <span className="text-purple-400">{stars}</span>;
      case 3: return <span className="text-blue-400">{stars}</span>;
      case 2: return <span className="text-green-400">{stars}</span>;
      default: return <span className="text-gray-400">{stars}</span>;
    }
  };

  const calculateSummary = () => {
    const totalNeeded = materials.reduce((sum, mat) => sum + (mat.quantity || 0), 0);
    const totalOwned = Object.values(ownedQuantities).reduce((sum, qty) => sum + qty, 0);
    const totalRemaining = materials.reduce((sum, mat) => {
      const needed = mat.quantity || 0;
      const owned = ownedQuantities[mat.id] || 0;
      return sum + Math.max(0, needed - owned);
    }, 0);
    const completed = materials.filter(mat => {
      const needed = mat.quantity || 0;
      const owned = ownedQuantities[mat.id] || 0;
      return owned >= needed;
    }).length;

    return {
      totalNeeded,
      totalOwned,
      totalRemaining,
      completed,
      total: materials.length,
      percentage: materials.length > 0 ? Math.round((completed / materials.length) * 100) : 0
    };
  };

  const summary = calculateSummary();

  if (!materials || materials.length === 0) {
    return (
      <div className="bg-card/50 rounded-xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
          <Icon name="Package" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Materials Required</h3>
        <p className="text-muted-foreground">Adjust ascension or skill levels to see required materials</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Icon name="Package" size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Needed</p>
              <p className="text-xl font-bold text-blue-500">{summary.totalNeeded}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg border border-green-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You Own</p>
              <p className="text-xl font-bold text-green-500">{summary.totalOwned}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg border border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-amber-500">{summary.totalRemaining}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-xl font-bold text-primary">
                {summary.completed}/{summary.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card/50 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Icon name="BarChart3" size={20} className="text-primary" />
            <span className="font-medium text-foreground">Collection Progress</span>
          </div>
          <span className="font-semibold text-primary">{summary.percentage}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              summary.percentage === 100 ? 'bg-green-500' : 
              summary.percentage >= 50 ? 'bg-primary' : 
              'bg-amber-500'
            }`}
            style={{ width: `${summary.percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>In Progress</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Materials Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Package" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Required Materials</h3>
              <p className="text-sm text-muted-foreground">{materials.length} different materials</p>
            </div>
          </div>
          
          {summary.totalRemaining > 0 && (
            <button
              onClick={() => {
                const updated = { ...ownedQuantities };
                materials.forEach(mat => {
                  updated[mat.id] = mat.quantity || 0;
                });
                Object.keys(updated).forEach(key => {
                  onOwnedChange(key, updated[key]);
                });
              }}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Icon name="CheckCircle" size={16} />
              Mark All as Collected
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map(material => {
            const owned = ownedQuantities[material.id] || 0;
            const needed = material.quantity || 0;
            const remaining = Math.max(0, needed - owned);
            const hasEnough = owned >= needed;
            const percentage = needed > 0 ? Math.min(100, (owned / needed) * 100) : 0;

            return (
              <div
                key={material.id}
                className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-lg ${
                  hasEnough 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-border bg-card/50 hover:bg-card'
                } ${getRarityColor(material.rarity || 3)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted/50 overflow-hidden flex-shrink-0">
                      <img
                        src={material.icon}
                        alt={material.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/48x48/374151/ffffff?text=?"}
                        }
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{material.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs">
                          {getRarityBadge(material.rarity || 3)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          hasEnough 
                            ? 'bg-green-500/20 text-green-400' 
                            : remaining <= 5 
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {hasEnough ? 'Complete' : remaining <= 5 ? 'Low Stock' : 'Needed'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                    hasEnough ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <Icon 
                      name={hasEnough ? "CheckCircle" : "AlertCircle"} 
                      size={14} 
                      className={hasEnough ? "text-green-500" : "text-red-500"}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Needed</p>
                      <p className="font-bold text-foreground">{needed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Owned</p>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="9999"
                          value={owned}
                          onChange={(e) => onOwnedChange(material.id, e.target.value)}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-center font-medium focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className={`font-bold ${
                        remaining === 0 ? 'text-green-500' : 
                        remaining <= 5 ? 'text-amber-500' : 
                        'text-red-500'
                      }`}>
                        {remaining}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage === 100 ? 'bg-green-500' : 
                          percentage >= 50 ? 'bg-primary' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOwnedChange(material.id, Math.max(0, owned - 1))}
                      className="flex-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="Minus" size={14} />
                      Remove
                    </button>
                    <button
                      onClick={() => onOwnedChange(material.id, owned + 1)}
                      className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="Plus" size={14} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Status */}
      {summary.percentage === 100 && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon name="Trophy" size={24} className="text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">All Materials Collected! 🎉</h4>
              <p className="text-sm text-muted-foreground">
                You have all the required materials for this upgrade. Ready to proceed!
              </p>
            </div>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={16} />
                Proceed to Upgrade
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialDisplay;