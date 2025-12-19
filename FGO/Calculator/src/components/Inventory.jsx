import React, { useState, useEffect, useMemo } from 'react';
import Icon from './AppIcon';
import Button from './Button';

const Inventory = ({ 
  materials = [], 
  onSaveInventory, 
  onLoadInventory,
  onClearInventory,
  onMaterialUpdate 
}) => {
  const [inventory, setInventory] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [allMaterials, setAllMaterials] = useState([]); // Store all materials independently

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize inventory only once when component mounts
  useEffect(() => {
    if (!isInitialized) {
      setInventory({});
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Keep track of all materials seen (cumulative, not just current servant)
  useEffect(() => {
    if (materials && materials.length > 0) {
      setAllMaterials(prev => {
        const materialMap = new Map();
        
        // Add all existing materials
        prev.forEach(mat => {
          if (mat.id) {
            materialMap.set(mat.id, { ...mat });
          }
        });
        
        // Add new materials from current servant
        materials.forEach(material => {
          if (material.id) {
            const existing = materialMap.get(material.id);
            if (existing) {
              // Update required amount if needed, but preserve current value
              materialMap.set(material.id, {
                ...existing,
                name: material.name || existing.name,
                rarity: material.rarity || existing.rarity,
                icon: material.icon || existing.icon,
                iconAlt: material.iconAlt || existing.iconAlt,
                required: material.required || existing.required,
                // Keep existing current value
                current: existing.current || 0,
                // Recalculate deficit
                deficit: Math.max(0, (material.required || existing.required || 0) - (existing.current || 0))
              });
            } else {
              // Add new material
              materialMap.set(material.id, {
                ...material,
                current: 0,
                deficit: material.required || 0
              });
            }
          }
        });
        
        return Array.from(materialMap.values());
      });
    }
  }, [materials]);

  // Merge duplicate materials from allMaterials
  const mergedMaterials = useMemo(() => {
    if (!allMaterials || allMaterials.length === 0) return [];
    
    const materialMap = new Map();
    
    allMaterials.forEach(material => {
      // Extract the actual material ID from the prefixed ID
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
          required: existing.required + (material.required || 0),
          // Preserve current value
          current: existing.current || material.current || 0,
          // Recalculate deficit
          deficit: Math.max(0, (existing.required + (material.required || 0)) - (existing.current || material.current || 0))
        });
      } else {
        materialMap.set(materialId, {
          ...material,
          id: materialId,
          originalId: material.id,
          required: material.required || 0,
          current: material.current || 0,
          deficit: Math.max(0, (material.required || 0) - (material.current || 0))
        });
      }
    });
    
    return Array.from(materialMap.values());
  }, [allMaterials]);

  // Sync material requirements without resetting values
  useEffect(() => {
    if (mergedMaterials.length > 0) {
      setInventory(prevInventory => {
        const updatedInventory = { ...prevInventory };
        let hasChanges = false;
        
        mergedMaterials.forEach(material => {
          if (material.id) {
            // If material exists in mergedMaterials but not in inventory, add it with its current value
            if (!(material.id in updatedInventory)) {
              updatedInventory[material.id] = material.current || 0;
              hasChanges = true;
            } else {
              // Update inventory value if it doesn't match the material's current value
              if (updatedInventory[material.id] !== (material.current || 0)) {
                updatedInventory[material.id] = material.current || 0;
                hasChanges = true;
              }
            }
          }
        });
        
        return hasChanges ? updatedInventory : prevInventory;
      });
    }
  }, [mergedMaterials]);

  // Handle manual inventory updates
  const handleInventoryChange = (materialId, value) => {
    const numValue = parseInt(value) || 0;
    const newInventory = {
      ...inventory,
      [materialId]: Math.max(0, numValue)
    };
    setInventory(newInventory);
    
    // Update allMaterials state to reflect the change
    setAllMaterials(prev => 
      prev.map(mat => {
        if (mat.id === materialId || 
            (typeof mat.id === 'string' && mat.id.includes(materialId)) ||
            (typeof mat.originalId === 'string' && mat.originalId.includes(materialId))) {
          const oldValue = mat.current || 0;
          return {
            ...mat,
            current: numValue,
            deficit: Math.max(0, (mat.required || 0) - numValue)
          };
        }
        return mat;
      })
    );
    
    // Notify parent component
    if (onMaterialUpdate) {
      // Find all original material IDs that match this merged ID
      const originalIds = mergedMaterials
        .filter(m => m.id === materialId || m.originalId === materialId)
        .flatMap(m => {
          if (m.originalId && m.originalId !== m.id) {
            return [m.originalId];
          }
          return [m.id];
        });
      
      // Update each original material
      const oldValue = inventory[materialId] || 0;
      originalIds.forEach(originalId => {
        onMaterialUpdate(originalId, numValue - oldValue);
      });
    }
  };

  // Quick action buttons
  const handleQuickAction = (materialId, action) => {
    const currentValue = inventory[materialId] || 0;
    let newValue = currentValue;
    
    switch(action) {
      case 'add1':
        newValue = currentValue + 1;
        break;
      case 'add10':
        newValue = currentValue + 10;
        break;
      case 'add100':
        newValue = currentValue + 100;
        break;
      case 'subtract1':
        newValue = Math.max(0, currentValue - 1);
        break;
      case 'set0':
        newValue = 0;
        break;
      default:
        return;
    }
    
    handleInventoryChange(materialId, newValue);
  };

  // Handle material edit (for mobile)
  const handleEditMaterial = (material) => {
    setActiveMaterial(material);
    setEditQuantity(String(inventory[material.id] || 0));
  };

  // Save edit changes (for mobile)
  const handleSaveEdit = () => {
    if (activeMaterial) {
      const newValue = parseInt(editQuantity) || 0;
      handleInventoryChange(activeMaterial.id, newValue);
      setActiveMaterial(null);
      setEditQuantity('');
    }
  };

  // Save inventory
  const handleSaveInventory = () => {
    if (onSaveInventory) {
      onSaveInventory(inventory);
    }
  };

  // Load inventory
  const handleLoadInventory = () => {
    if (onLoadInventory) {
      onLoadInventory();
    }
  };

  // Clear inventory
  const handleClearInventory = () => {
    const clearedInventory = {};
    Object.keys(inventory).forEach(key => {
      clearedInventory[key] = 0;
    });
    setInventory(clearedInventory);
    
    // Also clear allMaterials current values
    setAllMaterials(prev => 
      prev.map(mat => ({
        ...mat,
        current: 0,
        deficit: mat.required || 0
      }))
    );
    
    if (onClearInventory) {
      onClearInventory();
    }
  };

  // Import inventory from JSON
  const handleImport = () => {
    try {
      const importedData = JSON.parse(importData);
      
      // Validate imported data
      if (typeof importedData !== 'object') {
        throw new Error('Invalid inventory data format');
      }
      
      const newInventory = { ...inventory };
      Object.keys(importedData).forEach(key => {
        const value = parseInt(importedData[key]);
        if (!isNaN(value) && value >= 0) {
          newInventory[key] = value;
        }
      });
      
      setInventory(newInventory);
      
      // Update allMaterials with imported values
      setAllMaterials(prev => 
        prev.map(mat => {
          const importedValue = importedData[mat.id];
          if (importedValue !== undefined) {
            const value = parseInt(importedValue) || 0;
            return {
              ...mat,
              current: value,
              deficit: Math.max(0, (mat.required || 0) - value)
            };
          }
          return mat;
        })
      );
      
      setShowImportModal(false);
      setImportData('');
      setImportError('');
      
      // Notify parent if needed
      if (onMaterialUpdate) {
        Object.keys(importedData).forEach(key => {
          const newValue = parseInt(importedData[key]) || 0;
          const oldValue = inventory[key] || 0;
          if (newValue !== oldValue) {
            onMaterialUpdate(key, newValue - oldValue);
          }
        });
      }
      
    } catch (error) {
      setImportError(error.message || 'Failed to import inventory data');
    }
  };

  // Export inventory to JSON
  const handleExport = () => {
    const exportData = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fgo-inventory-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // Get material details - now uses allMaterials instead of just current servant materials
  const getMaterialDetails = (materialId) => {
    const material = mergedMaterials.find(m => m.id === materialId) || {};
    const currentQuantity = inventory[materialId] || 0;
    
    return {
      ...material,
      current: currentQuantity,
      deficit: Math.max(0, (material.required || 0) - currentQuantity)
    };
  };

  // Filter and sort materials - now uses all material IDs from inventory
  const filteredAndSortedMaterials = useMemo(() => {
    // Get all material IDs from inventory
    const allMaterialIds = Object.keys(inventory);
    
    if (allMaterialIds.length === 0) return [];
    
    let filtered = allMaterialIds
      .map(materialId => {
        const material = getMaterialDetails(materialId);
        return {
          id: materialId,
          name: material.name || `Material ${materialId}`,
          rarity: material.rarity || 'Common',
          category: material.category || (material.id && material.id.toString().includes('ember') ? 'Ember' : 
                   material.id && material.id.toString().includes('qp') ? 'Currency' : 
                   material.id && material.id.toString().includes('ascension') ? 'Ascension' : 
                   material.id && material.id.toString().includes('skill') ? 'Skill' : 'Material'),
          icon: material.icon || 'https://placehold.co/40x40/ccc/fff?text=?',
          iconAlt: material.iconAlt || material.name,
          current: material.current || 0,
          required: material.required || 0,
          deficit: material.deficit || 0,
          isMerged: material.originalId && material.originalId !== material.id,
          existsInCurrentMaterials: materials.some(m => {
            const mId = typeof m.id === 'string' ? m.id.split('-')[1] || m.id : m.id.toString();
            return mId === materialId;
          })
        };
      })
      .filter(material => {
        // Apply search filter
        if (searchTerm && !material.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'quantity':
          aValue = a.current;
          bValue = b.current;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [inventory, mergedMaterials, materials, searchTerm, sortBy, sortOrder]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalItems = Object.keys(inventory).length;
    const totalQuantity = Object.values(inventory).reduce((sum, val) => sum + (val || 0), 0);
    const categories = {};
    
    filteredAndSortedMaterials.forEach(material => {
      categories[material.category] = (categories[material.category] || 0) + 1;
    });
    
    return { totalItems, totalQuantity, categories };
  }, [inventory, filteredAndSortedMaterials]);

  // Sort options - simplified
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'quantity', label: 'Quantity' }
  ];

  // Material Card Component (used for both mobile and desktop)
  const MaterialCard = ({ material }) => {
    const handleEditClick = () => {
      handleEditMaterial(material);
    };

    const handleAdd1 = (e) => {
      e.stopPropagation();
      handleQuickAction(material.id, 'add1');
    };

    const handleSubtract1 = (e) => {
      e.stopPropagation();
      handleQuickAction(material.id, 'subtract1');
    };

    const handleAdd10 = (e) => {
      e.stopPropagation();
      handleQuickAction(material.id, 'add10');
    };

    const handleAdd100 = (e) => {
      e.stopPropagation();
      handleQuickAction(material.id, 'add100');
    };

    const handleSet0 = (e) => {
      e.stopPropagation();
      handleQuickAction(material.id, 'set0');
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
              <img 
                src={material.icon} 
                alt={material.iconAlt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/48x48/ccc/fff?text=?";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 truncate">{material.name}</h3>
               
                {!material.existsInCurrentMaterials && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    Saved
                  </span>
                )}
              </div>
              
              <div className="mt-2 flex items-center gap-2">
                
                
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-600">Current: </span>
            <span className="font-semibold text-slate-900 text-lg">{(inventory[material.id] || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubtract1}
              className="w-8 h-8 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Subtract 1"
            >
              <Icon name="Minus" size={14} className="text-slate-600" />
            </button>
            <button
              onClick={handleSet0}
              className="w-8 h-8 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center transition-colors text-xs font-medium"
              aria-label="Set to 0"
            >
              0
            </button>
            <div className="w-20">
              <input
                type="number"
                min="0"
                value={inventory[material.id] || 0}
                onChange={(e) => handleInventoryChange(material.id, e.target.value)}
                className="w-full px-2 py-1 text-center border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleAdd1}
              className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center border border-blue-600 transition-colors"
              aria-label="Add 1"
            >
              <Icon name="Plus" size={14} />
            </button>
            {!isMobileView && (
              <>
                <button
                  onClick={handleAdd10}
                  className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center border border-blue-600 transition-colors text-xs font-medium"
                  aria-label="Add 10"
                >
                  +10
                </button>
                <button
                  onClick={handleAdd100}
                  className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center border border-blue-600 transition-colors text-xs font-medium"
                  aria-label="Add 100"
                >
                  +100
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Quick action buttons for mobile */}
        {isMobileView && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAdd10}
              className="flex-1 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors border border-blue-200"
            >
              +10
            </button>
            <button
              onClick={handleAdd100}
              className="flex-1 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors border border-blue-600"
            >
              +100
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Material Inventory</h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Your persistent material stock across all servants
            </p>
          </div>
          {!isMobileView && (
            <div className="flex items-center gap-2">
            </div>
          )}
        </div>

        {/* Mobile Header Actions */}
        {isMobileView && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              variant="outline"
              iconName="Upload"
              onClick={() => setShowImportModal(true)}
              size="sm"
              fullWidth
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Import
            </Button>
            <Button
              variant="outline"
              iconName="Download"
              onClick={() => setShowExportModal(true)}
              size="sm"
              fullWidth
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Export
            </Button>
            <Button
              variant="default"
              iconName="Save"
              onClick={handleSaveInventory}
              size="sm"
              fullWidth
              className="bg-blue-500 hover:bg-blue-600 text-white border border-blue-600"
            >
              Save
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-blue-700 font-medium">Total Items</p>
                <p className="text-lg md:text-2xl font-bold text-blue-900">{totals.totalItems}</p>
              </div>
              <Icon name="Package" size={20} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-green-700 font-medium">Total Quantity</p>
                <p className="text-lg md:text-2xl font-bold text-green-900">{totals.totalQuantity.toLocaleString()}</p>
              </div>
              <Icon name="Layers" size={20} className="text-green-500" />
            </div>
          </div>
          <div className="bg-purple-50 p-3 md:p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-purple-700 font-medium">Showing</p>
                <p className="text-lg md:text-2xl font-bold text-purple-900">{filteredAndSortedMaterials.length}</p>
              </div>
              <Icon name="Filter" size={20} className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        {isMobileView && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-3 mb-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="Filter" size={18} className="text-blue-500" />
              <span className="font-medium text-slate-900">Filters & Search</span>
            </div>
            <Icon name={showFilters ? "ChevronUp" : "ChevronDown"} size={18} className="text-blue-500" />
          </button>
        )}

        {/* Filters and Search - Simplified */}
        {(showFilters || !isMobileView) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search materials..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Icon name="Search" size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Icon 
                    name={sortOrder === 'asc' ? "ArrowUp" : "ArrowDown"} 
                    size={16} 
                    className="text-blue-500" 
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Materials Grid (Cards for both mobile and desktop) */}
      <div className="p-3 md:p-6">
        {filteredAndSortedMaterials.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
              <Icon name="Package" size={24} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Materials Found</h3>
            <p className="text-slate-600">
              {searchTerm 
                ? 'Try adjusting your search term'
                : 'Start by calculating material requirements for a servant'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 md:p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 md:gap-4">
            <Button
              variant="outline"
              iconName="RotateCcw"
              onClick={handleLoadInventory}
              size="sm"
              className="flex-1 md:flex-none border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              {isMobileView ? 'Load' : 'Load Saved'}
            </Button>
            <Button
              variant="outline"
              iconName="Trash2"
              onClick={handleClearInventory}
              size="sm"
              className="flex-1 md:flex-none text-red-600 border-red-300 hover:bg-red-50"
            >
              {isMobileView ? 'Clear' : 'Clear All'}
            </Button>
          </div>
          <div className="text-xs md:text-sm text-blue-600 text-center md:text-right">
            Showing {filteredAndSortedMaterials.length} materials
            <span className="text-blue-500 ml-2">
              ({Object.keys(inventory).length} in inventory • {materials.length} from current servant)
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Edit Modal */}
      {isMobileView && activeMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                    <img 
                      src={activeMaterial.icon} 
                      alt={activeMaterial.iconAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Edit {activeMaterial.name}</h3>
                    <p className="text-xs text-slate-500">ID: {activeMaterial.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveMaterial(null);
                    setEditQuantity('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => setEditQuantity('0')}
                  className="py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Set 0
                </button>
                <button
                  onClick={() => {
                    const current = parseInt(editQuantity) || 0;
                    setEditQuantity(String(current + 10));
                  }}
                  className="py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => {
                    const current = parseInt(editQuantity) || 0;
                    setEditQuantity(String(current + 100));
                  }}
                  className="py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                >
                  +100
                </button>
                <button
                  onClick={() => {
                    const current = parseInt(editQuantity) || 0;
                    setEditQuantity(String(Math.max(0, current - 1)));
                  }}
                  className="py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                >
                  -1
                </button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveMaterial(null);
                    setEditQuantity('');
                  }}
                  fullWidth
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSaveEdit}
                  fullWidth
                  className="bg-blue-500 hover:bg-blue-600 text-white border border-blue-600"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
              <h3 className="text-lg font-semibold text-slate-900">Import Inventory</h3>
              <p className="text-sm text-slate-600 mt-1">
                Paste your inventory JSON data below
              </p>
            </div>
            <div className="p-4 md:p-6">
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='{"qp": 1000000, "ember-silver": 50, ...}'
                className="w-full h-32 md:h-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              {importError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{importError}</p>
                </div>
              )}
            </div>
            <div className="p-4 md:p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setImportError('');
                }}
                className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleImport}
                disabled={!importData.trim()}
                className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white border border-blue-600"
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
              <h3 className="text-lg font-semibold text-slate-900">Export Inventory</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your inventory data will be downloaded as a JSON file
              </p>
            </div>
            <div className="p-4 md:p-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 mb-2">Export Summary:</p>
                <div className="space-y-1 text-sm text-blue-600">
                  <p>• {totals.totalItems} unique materials</p>
                  <p>• {totals.totalQuantity.toLocaleString()} total items</p>
                  <p>• {Object.keys(totals.categories).length} categories</p>
                  <p className="text-blue-500">
                    • Inventory persists across servant changes
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleExport}
                className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white border border-blue-600"
              >
                Download JSON
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;