import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [allMaterials, setAllMaterials] = useState([]); // Store all materials independently
  const [pendingChanges, setPendingChanges] = useState({}); // Track pending changes to prevent race conditions
  const [editingInputId, setEditingInputId] = useState(null); // Track which input is being edited
  const [inputValues, setInputValues] = useState({}); // Store input values separately

  // Store the original order of material IDs as they were added
  const materialOrderRef = useRef([]);

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
              // Add to material order if it's a new material
              if (!materialOrderRef.current.includes(material.id)) {
                materialOrderRef.current.push(material.id);
              }
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
  const handleInventoryChange = useCallback((materialId, value) => {
    // Clean and parse the value
    const cleanedValue = value.toString().replace(/[^0-9]/g, '');
    const numValue = Math.max(0, parseInt(cleanedValue) || 0);
    
    // Update inventory state
    setInventory(prev => ({
      ...prev,
      [materialId]: numValue
    }));
    
    // Update allMaterials state to reflect the change
    setAllMaterials(prev => 
      prev.map(mat => {
        if (mat.id === materialId || 
            (typeof mat.id === 'string' && mat.id.includes(materialId)) ||
            (typeof mat.originalId === 'string' && mat.originalId.includes(materialId))) {
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
      
      const oldValue = inventory[materialId] || 0;
      
      // Update each original material
      originalIds.forEach(originalId => {
        onMaterialUpdate(originalId, numValue - oldValue);
      });
    }
  }, [inventory, mergedMaterials, onMaterialUpdate]);

  // Quick action buttons
  const handleQuickAction = useCallback((materialId, action) => {
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
  }, [inventory, handleInventoryChange]);

  // Handle material edit (for mobile)
  const handleEditMaterial = useCallback((material) => {
    setActiveMaterial(material);
    setEditQuantity(String(inventory[material.id] || 0));
  }, [inventory]);

  // Save edit changes (for mobile)
  const handleSaveEdit = useCallback(() => {
    if (activeMaterial) {
      const newValue = parseInt(editQuantity.replace(/[^0-9]/g, '')) || 0;
      handleInventoryChange(activeMaterial.id, newValue);
      setActiveMaterial(null);
      setEditQuantity('');
    }
  }, [activeMaterial, editQuantity, handleInventoryChange]);

  // Save inventory
  const handleSaveInventory = useCallback(() => {
    if (onSaveInventory) {
      onSaveInventory(inventory);
    }
  }, [inventory, onSaveInventory]);

  // Load inventory
  const handleLoadInventory = useCallback(() => {
    if (onLoadInventory) {
      onLoadInventory();
    }
  }, [onLoadInventory]);

  // Clear inventory
  const handleClearInventory = useCallback(() => {
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
  }, [inventory, onClearInventory]);

  // Import inventory from JSON
  const handleImport = useCallback(() => {
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
          // Add to material order if it's a new material
          if (!materialOrderRef.current.includes(key)) {
            materialOrderRef.current.push(key);
          }
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
  }, [importData, inventory, onMaterialUpdate]);

  // Export inventory to JSON
  const handleExport = useCallback(() => {
    const exportData = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fgo-inventory-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }, [inventory]);

  // Get material details - now uses allMaterials instead of just current servant materials
  const getMaterialDetails = useCallback((materialId) => {
    const material = mergedMaterials.find(m => m.id === materialId) || {};
    const currentQuantity = inventory[materialId] || 0;
    
    return {
      ...material,
      current: currentQuantity,
      deficit: Math.max(0, (material.required || 0) - currentQuantity)
    };
  }, [mergedMaterials, inventory]);

  // Filter materials - MAINTAIN ORIGINAL ORDER, NO SORTING
  const filteredMaterials = useMemo(() => {
    // Get material IDs in their original order
    const orderedMaterialIds = materialOrderRef.current.filter(id => id in inventory);
    
    // Add any new materials that aren't in the order array yet
    Object.keys(inventory).forEach(id => {
      if (!orderedMaterialIds.includes(id)) {
        orderedMaterialIds.push(id);
        materialOrderRef.current.push(id);
      }
    });
    
    if (orderedMaterialIds.length === 0) return [];
    
    // Create materials in their original order
    const materialsList = orderedMaterialIds
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
          isMerged: material.originalId && material.originalId !== materialId,
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
        
        // Apply rarity filter
        if (rarityFilter !== 'all' && material.rarity !== rarityFilter) {
          return false;
        }
        
        // Apply category filter
        if (categoryFilter !== 'all' && material.category !== categoryFilter) {
          return false;
        }
        
        return true;
      });
    
    // Return materials in their original order
    return materialsList;
  }, [inventory, getMaterialDetails, materials, searchTerm, rarityFilter, categoryFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalItems = Object.keys(inventory).length;
    const totalQuantity = Object.values(inventory).reduce((sum, val) => sum + (val || 0), 0);
    const categories = {};
    
    filteredMaterials.forEach(material => {
      categories[material.category] = (categories[material.category] || 0) + 1;
    });
    
    return { totalItems, totalQuantity, categories };
  }, [inventory, filteredMaterials]);

  // Material Card Component (used for both mobile and desktop) - optimized for stable rendering
  const MaterialCard = React.memo(({ material }) => {
    // Get current value directly from inventory (stable reference)
    const currentValue = inventory[material.id] || 0;
    
    // Local state for input value to prevent re-renders
    const [localValue, setLocalValue] = useState(String(currentValue));
    const inputRef = useRef(null);

    // Update local value when inventory changes for this specific material
    useEffect(() => {
      setLocalValue(String(currentValue));
    }, [currentValue]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleAdd1 = useCallback((e) => {
      e?.stopPropagation();
      handleQuickAction(material.id, 'add1');
    }, [material.id, handleQuickAction]);

    const handleSubtract1 = useCallback((e) => {
      e?.stopPropagation();
      handleQuickAction(material.id, 'subtract1');
    }, [material.id, handleQuickAction]);

    const handleAdd10 = useCallback((e) => {
      e?.stopPropagation();
      handleQuickAction(material.id, 'add10');
    }, [material.id, handleQuickAction]);

    const handleAdd100 = useCallback((e) => {
      e?.stopPropagation();
      handleQuickAction(material.id, 'add100');
    }, [material.id, handleQuickAction]);

    const handleSet0 = useCallback((e) => {
      e?.stopPropagation();
      handleQuickAction(material.id, 'set0');
    }, [material.id, handleQuickAction]);

    // Handle input change
    const handleInputChange = useCallback((e) => {
      const value = e.target.value;
      // Allow empty string and numeric input
      if (value === '' || /^\d+$/.test(value)) {
        if (value.length <= 10) { // Limit to 10 digits
          setLocalValue(value);
        }
      }
    }, []);

    // Handle input blur - save the value
    const handleInputBlur = useCallback(() => {
      const numValue = parseInt(localValue) || 0;
      handleInventoryChange(material.id, numValue);
    }, [localValue, material.id, handleInventoryChange]);

    // Handle key press
    const handleKeyDown = useCallback((e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const numValue = parseInt(localValue) || 0;
        handleInventoryChange(material.id, numValue);
        inputRef.current?.blur();
      }
    }, [localValue, material.id, handleInventoryChange]);

    // Track when this input gets focus
    const handleInputFocus = useCallback((e) => {
      // Prevent any scrolling behavior
      e.preventDefault();
      // Focus without scrolling
      setTimeout(() => {
        e.target.focus({ preventScroll: true });
      }, 0);
      setEditingInputId(material.id);
    }, [material.id]);

    // Track when this input loses focus
    const handleInputBlurComplete = useCallback(() => {
      handleInputBlur();
      if (editingInputId === material.id) {
        setEditingInputId(null);
      }
    }, [material.id, editingInputId, handleInputBlur]);

    return (
      <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-4 hover:shadow-md transition-shadow hover:border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 overflow-hidden flex-shrink-0">
              <img 
                src={material.icon} 
                alt={material.iconAlt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/48x48/3b82f6/fff?text=?";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">{material.name}</h3>
                  </div>
                  <p className="text-sm text-blue-500">{material.category}</p>
                </div>
                
                {/* Current quantity - aligned to the right */}
                <div className="text-right ml-2 flex-shrink-0">
                  <div className="text-sm">
                    <div className="text-blue-400 text-xs">Current</div>
                    <span className="font-semibold text-blue-600 text-lg">{currentValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Input and buttons section - responsive layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 w-full justify-center">
            <button
              onClick={handleSubtract1}
              className="w-8 h-8 rounded-md border border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Subtract 1"
            >
              <Icon name="Minus" size={14} className="text-blue-500" />
            </button>
            <button
              onClick={handleSet0}
              className="w-8 h-8 rounded-md border border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-colors text-xs font-medium flex-shrink-0 text-blue-500"
              aria-label="Set to 0"
            >
              0
            </button>
            <div className="w-20 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={localValue}
                onChange={handleInputChange}
                onBlur={handleInputBlurComplete}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                className="w-full px-2 py-1 text-center border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 no-auto-scroll text-blue-600"
              />
            </div>
            <button
              onClick={handleAdd1}
              className="w-8 h-8 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center border border-blue-600 transition-colors flex-shrink-0"
              aria-label="Add 1"
            >
              <Icon name="Plus" size={14} />
            </button>
            {!isMobileView && (
              <>
                <button
                  onClick={handleAdd10}
                  className="w-8 h-8 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center border border-blue-600 transition-colors text-xs font-medium flex-shrink-0"
                  aria-label="Add 10"
                >
                  +10
                </button>
                <button
                  onClick={handleAdd100}
                  className="w-8 h-8 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center border border-blue-600 transition-colors text-xs font-medium flex-shrink-0"
                  aria-label="Add 100"
                >
                  +100
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Quick action buttons for mobile - shown instead of inline +10/+100 buttons */}
        {isMobileView && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAdd10}
              className="flex-1 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors border border-blue-200"
            >
              +10
            </button>
            <button
              onClick={handleAdd100}
              className="flex-1 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-md text-sm font-medium transition-colors border border-blue-600"
            >
              +100
            </button>
          </div>
        )}
      </div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if the material object's properties (excluding current value) change
    return prevProps.material.id === nextProps.material.id &&
           prevProps.material.name === nextProps.material.name &&
           prevProps.material.icon === nextProps.material.icon &&
           prevProps.material.rarity === nextProps.material.rarity &&
           prevProps.material.category === nextProps.material.category;
  });

  return (
    <>
      {/* Add CSS to prevent all auto-scrolling */}
      <style>{`
        /* DISABLE all smooth scrolling */
        html, body, .inventory-container, .inventory-container * {
          scroll-behavior: auto !important;
        }
        
        /* Prevent input focus from causing scroll */
        .no-auto-scroll {
          scroll-margin-top: 0 !important;
          scroll-margin-bottom: 0 !important;
        }
        
        /* Override any smooth scroll behavior */
        * {
          scroll-behavior: auto !important;
        }
        
        /* Specifically target the inventory section */
        #inventory-section {
          scroll-behavior: auto;
        }
        
        /* Make sure inputs don't trigger scroll */
        input:focus {
          outline: none;
        }
        
        /* Ensure the container doesn't shift */
        .inventory-container {
          overflow-anchor: none;
        }
      `}</style>
      
      <div 
        id="inventory-section"
        className="bg-white rounded-lg border border-blue-100 shadow-md inventory-container"
      >
        {/* Materials Grid (Cards for both mobile and desktop) */}
        <div className="p-3 md:p-6 bg-blue-50">
          {filteredMaterials.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                <Icon name="Package" size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Materials Found</h3>
              <p className="text-blue-500">
                {searchTerm 
                  ? 'Try adjusting your search term'
                  : 'Start by calculating material requirements for a servant'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 md:p-4 border-t border-blue-100 bg-blue-50">
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
                className="flex-1 md:flex-none text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                {isMobileView ? 'Clear' : 'Clear All'}
              </Button>
              <Button
                variant="outline"
                iconName="Upload"
                onClick={() => setShowImportModal(true)}
                size="sm"
                className="flex-1 md:flex-none border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {isMobileView ? 'Import' : 'Import'}
              </Button>
              <Button
                variant="outline"
                iconName="Download"
                onClick={() => setShowExportModal(true)}
                size="sm"
                className="flex-1 md:flex-none border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {isMobileView ? 'Export' : 'Export'}
              </Button>
            </div>
            <div className="text-xs md:text-sm text-blue-500 text-center md:text-right">
              Showing {filteredMaterials.length} materials
              <span className="text-blue-400 ml-2">
                ({Object.keys(inventory).length} in inventory • {materials.length} from current servant)
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Edit Modal */}
        {isMobileView && activeMaterial && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
            <div className="bg-white rounded-t-lg w-full max-w-md">
              <div className="p-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 overflow-hidden">
                      <img 
                        src={activeMaterial.icon} 
                        alt={activeMaterial.iconAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Edit {activeMaterial.name}</h3>
                      <p className="text-xs text-blue-400">ID: {activeMaterial.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveMaterial(null);
                      setEditQuantity('');
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Icon name="X" size={20} className="text-blue-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-blue-500 mb-2">Quantity</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editQuantity}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 10) { // Limit to 10 digits
                        setEditQuantity(value);
                      }
                    }}
                    className="w-full px-3 py-3 border border-blue-200 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 text-blue-600"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button
                    onClick={() => setEditQuantity('0')}
                    className="py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors text-blue-600 border border-blue-200"
                  >
                    Set 0
                  </button>
                  <button
                    onClick={() => {
                      const current = parseInt(editQuantity) || 0;
                      setEditQuantity(String(current + 10));
                    }}
                    className="py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => {
                      const current = parseInt(editQuantity) || 0;
                      setEditQuantity(String(current + 100));
                    }}
                    className="py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors border border-blue-600"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => {
                      const current = parseInt(editQuantity) || 0;
                      setEditQuantity(String(Math.max(0, current - 1)));
                    }}
                    className="py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200"
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
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
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
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 md:p-6 border-b border-blue-100 bg-blue-50">
                <h3 className="text-lg font-semibold text-slate-900">Import Inventory</h3>
                <p className="text-sm text-blue-500 mt-1">
                  Paste your inventory JSON data below
                </p>
              </div>
              <div className="p-4 md:p-6">
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='{"qp": 1000000, "ember-silver": 50, ...}'
                  className="w-full h-32 md:h-48 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 font-mono text-sm"
                />
                {importError && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-600 text-sm">{importError}</p>
                  </div>
                )}
              </div>
              <div className="p-4 md:p-6 border-t border-blue-100 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                    setImportError('');
                  }}
                  className="flex-1 sm:flex-none border-blue-200 text-blue-600 hover:bg-blue-50"
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
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-4 md:p-6 border-b border-blue-100 bg-blue-50">
                <h3 className="text-lg font-semibold text-slate-900">Export Inventory</h3>
                <p className="text-sm text-blue-500 mt-1">
                  Your inventory data will be downloaded as a JSON file
                </p>
              </div>
              <div className="p-4 md:p-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-600 mb-2">Export Summary:</p>
                  <div className="space-y-1 text-sm text-blue-500">
                    <p>• {totals.totalItems} unique materials</p>
                    <p>• {totals.totalQuantity.toLocaleString()} total items</p>
                    <p>• {Object.keys(totals.categories).length} categories</p>
                    <p className="text-blue-400">
                      • Inventory persists across servant changes
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6 border-t border-blue-100 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 sm:flex-none border-blue-200 text-blue-600 hover:bg-blue-50"
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
    </>
  );
};

export default Inventory;