import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icon from './AppIcon';
import Button from './Button';

const Inventory = ({ 
  materials = [], 
  currentInventory = {},
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
  const [allMaterials, setAllMaterials] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [editingInputId, setEditingInputId] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [sortBy, setSortBy] = useState('default');

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

  // Initialize inventory only once when component mounts OR when currentInventory changes
  useEffect(() => {
    if (!isInitialized && Object.keys(currentInventory).length > 0) {
      setInventory(currentInventory);
      setIsInitialized(true);
    } else if (isInitialized && Object.keys(currentInventory).length > 0) {
      // Also update inventory when currentInventory changes (when switching tabs)
      setInventory(currentInventory);
    }
  }, [isInitialized, currentInventory]);

  // Simple function to extract base material ID from prefixed IDs
  const getBaseMaterialId = (materialId) => {
    if (typeof materialId === 'string') {
      // Remove all prefixes to get the base ID
      // Examples: "ascension-6501" -> "6501", "skill-6501" -> "6501", "material-ascension-6501" -> "6501"
      const parts = materialId.split('-');
      
      // Find the last numeric part
      for (let i = parts.length - 1; i >= 0; i--) {
        if (!isNaN(parts[i]) && parts[i] !== '') {
          return parts[i]; // Return the numeric ID
        }
      }
      
      // For non-numeric IDs like "qp", return as is
      return materialId;
    }
    return materialId.toString();
  };

  // Keep track of all materials seen (cumulative, not just current servant)
  useEffect(() => {
    if (materials && materials.length > 0) {
      setAllMaterials(prev => {
        const materialMap = new Map();
        
        // First, add all existing materials
        prev.forEach(mat => {
          if (mat.id) {
            const baseId = getBaseMaterialId(mat.id);
            materialMap.set(mat.id, { // Use the exact ID as key
              ...mat, 
              baseId,
              // Keep original ID for reference
              originalIds: mat.originalIds || [mat.id]
            });
          }
        });
        
        // Then add/merge new materials from current servant
        materials.forEach(material => {
          if (material.id && material.name) {
            const baseId = getBaseMaterialId(material.id);
            const existing = materialMap.get(material.id);
            
            if (existing) {
              // Only merge if exact same ID
              materialMap.set(material.id, {
                // Prefer material with better data (has icon, proper name)
                ...(material.icon && !existing.icon ? material : existing),
                // Sum the required amounts
                required: (existing.required || 0) + (material.required || 0),
                // Preserve current value from inventory or existing
                current: inventory[material.id] !== undefined ? inventory[material.id] : existing.current || 0,
                // Add original ID to the list
                originalIds: [...(existing.originalIds || []), material.id],
                // Use the base ID
                baseId,
                // Recalculate deficit
                deficit: Math.max(0, ((existing.required || 0) + (material.required || 0)) - 
                  (inventory[material.id] !== undefined ? inventory[material.id] : existing.current || 0))
              });
            } else {
              // Check if there's another material with the same base ID but different prefix
              const materialsWithSameBaseId = Array.from(materialMap.values()).filter(m => 
                m.baseId === baseId && m.id !== material.id
              );
              
              if (materialsWithSameBaseId.length > 0) {
                // For now, keep them separate - they'll be merged in mergedMaterials
                materialMap.set(material.id, {
                  ...material,
                  baseId,
                  // Store original ID for reference
                  originalIds: [material.id],
                  required: material.required || 0,
                  current: inventory[material.id] !== undefined ? inventory[material.id] : 0,
                  deficit: Math.max(0, (material.required || 0) - (inventory[material.id] !== undefined ? inventory[material.id] : 0))
                });
              } else {
                // Add new material
                materialMap.set(material.id, {
                  ...material,
                  baseId,
                  // Store original ID for reference
                  originalIds: [material.id],
                  required: material.required || 0,
                  current: inventory[material.id] !== undefined ? inventory[material.id] : 0,
                  deficit: Math.max(0, (material.required || 0) - (inventory[material.id] !== undefined ? inventory[material.id] : 0))
                });
              }
            }
          }
        });
        
        return Array.from(materialMap.values());
      });
    }
  }, [materials, inventory]);

  // Merge duplicate materials from allMaterials - NOW MERGES ASCENSION AND SKILL
  const mergedMaterials = useMemo(() => {
    if (!allMaterials || allMaterials.length === 0) return [];
    
    const materialMap = new Map();
    
    allMaterials.forEach(material => {
      const baseId = getBaseMaterialId(material.id);
      
      // Special handling for QP - keep it separate
      if (baseId === 'qp' || material.id === 'qp') {
        materialMap.set('qp', {
          ...material,
          id: 'qp',
          baseId: 'qp',
          name: 'QP (Quantum Particles)',
          category: 'Currency',
          required: material.required || 0,
          current: inventory['qp'] !== undefined ? inventory['qp'] : material.current || 0,
          deficit: Math.max(0, (material.required || 0) - 
            (inventory['qp'] !== undefined ? inventory['qp'] : material.current || 0))
        });
        return;
      }
      
      // Check if we already have a material with this base ID
      if (materialMap.has(baseId)) {
        const existing = materialMap.get(baseId);
        
        // Merge the materials
        materialMap.set(baseId, {
          // Prefer material with better data (has icon, proper name)
          ...(material.icon && !existing.icon ? material : existing),
          // Sum the required amounts from both ascension and skill
          required: existing.required + (material.required || 0),
          // Use the max current value (or sum if they have separate values)
          current: Math.max(
            inventory[existing.id] !== undefined ? inventory[existing.id] : existing.current || 0,
            inventory[material.id] !== undefined ? inventory[material.id] : material.current || 0,
            inventory[baseId] !== undefined ? inventory[baseId] : 0
          ),
          // Track all original IDs for reference
          originalIds: [...(existing.originalIds || []), material.id],
          // Keep track of prefixes for display
          prefixes: [...(existing.prefixes || []), material.id.includes('-') ? material.id.split('-')[0] : 'base'].filter((v, i, a) => a.indexOf(v) === i),
          // Store base ID
          baseId: baseId,
          // Recalculate deficit
          deficit: Math.max(0, 
            (existing.required + (material.required || 0)) - 
            Math.max(
              inventory[existing.id] !== undefined ? inventory[existing.id] : existing.current || 0,
              inventory[material.id] !== undefined ? inventory[material.id] : material.current || 0,
              inventory[baseId] !== undefined ? inventory[baseId] : 0
            )
          ),
          // Track if this material is used for multiple purposes
          isMultiPurpose: true
        });
      } else {
        // First time seeing this base ID material
        materialMap.set(baseId, {
          ...material,
          id: baseId, // Use base ID as the main ID
          baseId: baseId,
          // Store original IDs for reference
          originalIds: [material.id],
          // Track prefix
          prefixes: [material.id.includes('-') ? material.id.split('-')[0] : 'base'],
          required: material.required || 0,
          current: inventory[baseId] !== undefined ? inventory[baseId] : 
                  inventory[material.id] !== undefined ? inventory[material.id] : 
                  material.current || 0,
          deficit: Math.max(0, (material.required || 0) - 
            (inventory[baseId] !== undefined ? inventory[baseId] : 
             inventory[material.id] !== undefined ? inventory[material.id] : 
             material.current || 0)),
          isMultiPurpose: material.id.includes('-') // Will become true if another prefix is added later
        });
      }
    });
    
    return Array.from(materialMap.values());
  }, [allMaterials, inventory]);

  // Sync material requirements without resetting values
  useEffect(() => {
    if (mergedMaterials.length > 0) {
      setInventory(prevInventory => {
        const updatedInventory = { ...prevInventory };
        let hasChanges = false;
        
        mergedMaterials.forEach(material => {
          if (material.id) {
            const materialId = material.id;
            // If material exists in mergedMaterials but not in inventory, add it with its current value
            if (!(materialId in updatedInventory)) {
              updatedInventory[materialId] = material.current || 0;
              // Add to material order if it's a new material
              if (!materialOrderRef.current.includes(materialId)) {
                materialOrderRef.current.push(materialId);
              }
              hasChanges = true;
            } else {
              // Update inventory value if it doesn't match the material's current value
              if (updatedInventory[materialId] !== (material.current || 0)) {
                updatedInventory[materialId] = material.current || 0;
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
    
    // Get base ID for the material
    const baseId = getBaseMaterialId(materialId);
    
    // Check if this is a merged material (using base ID)
    const isMergedMaterial = mergedMaterials.some(m => m.id === baseId && m.isMultiPurpose);
    
    if (isMergedMaterial) {
      // Update using base ID for merged materials
      setInventory(prev => ({
        ...prev,
        [baseId]: numValue,
        // Also update individual prefixed IDs if they exist
        ...(materialId !== baseId && { [materialId]: numValue })
      }));
    } else {
      // For non-merged materials (like QP), use the exact ID
      setInventory(prev => ({
        ...prev,
        [materialId]: numValue
      }));
    }
    
    // Update allMaterials state
    setAllMaterials(prev => 
      prev.map(mat => {
        const matBaseId = getBaseMaterialId(mat.id);
        if (matBaseId === baseId) {
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
      if (isMergedMaterial) {
        // Find all original IDs for this base material
        const baseMaterial = mergedMaterials.find(m => m.id === baseId);
        if (baseMaterial && baseMaterial.originalIds) {
          const oldBaseValue = inventory[baseId] || 0;
          baseMaterial.originalIds.forEach(originalId => {
            const oldIndividualValue = inventory[originalId] || 0;
            onMaterialUpdate(originalId, numValue - oldIndividualValue);
          });
          // Also update the base ID itself
          onMaterialUpdate(baseId, numValue - oldBaseValue);
        }
      } else {
        const oldValue = inventory[materialId] || 0;
        onMaterialUpdate(materialId, numValue - oldValue);
      }
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

  // Get material details
  const getMaterialDetails = useCallback((materialId) => {
    // First try to find exact match
    const exactMatch = mergedMaterials.find(m => m.id === materialId);
    if (exactMatch) {
      const currentQuantity = inventory[materialId] || 0;
      return {
        ...exactMatch,
        current: currentQuantity,
        deficit: Math.max(0, (exactMatch.required || 0) - currentQuantity)
      };
    }
    
    // If not found exactly, try base ID match (but be careful with prefixed IDs)
    const baseId = getBaseMaterialId(materialId);
    
    const baseMatch = mergedMaterials.find(m => m.id === baseId);
    if (baseMatch) {
      const currentQuantity = inventory[materialId] || inventory[baseId] || 0;
      return {
        ...baseMatch,
        current: currentQuantity,
        deficit: Math.max(0, (baseMatch.required || 0) - currentQuantity)
      };
    }
    
    // If not found in merged materials, look in original materials
    const originalMaterial = materials.find(m => m.id === materialId);
    if (originalMaterial) {
      const currentQuantity = inventory[materialId] || 0;
      return {
        ...originalMaterial,
        baseId: getBaseMaterialId(materialId),
        current: currentQuantity,
        deficit: Math.max(0, (originalMaterial.required || 0) - currentQuantity)
      };
    }
    
    // Return empty material if not found
    return {
      id: materialId,
      name: `Material ${materialId}`,
      current: inventory[materialId] || 0,
      required: 0,
      deficit: 0
    };
  }, [mergedMaterials, inventory, materials]);

  // Filter and sort materials
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
    let materialsList = orderedMaterialIds
      .map(materialId => {
        const material = getMaterialDetails(materialId);
        const baseId = getBaseMaterialId(materialId);
        
        // Skip prefixed IDs since we now use base IDs
        const isPrefixed = materialId.includes('-') && materialId !== baseId;
        if (isPrefixed && mergedMaterials.some(m => m.id === baseId)) {
          return null; // Skip prefixed IDs when we have a merged base material
        }
        
        return {
          id: material.id || materialId, // Use the merged material's ID (base ID)
          baseId: baseId,
          name: material.name || `Material ${materialId}`,
          
          category: material.category || 
                   (materialId.toString().includes('ember') ? 'Ember' : 
                    materialId === 'qp' ? 'Currency' : 
                    'Material'),
          icon: material.icon || `https://static.atlasacademy.io/NA/Items/${baseId}.png`,
          iconAlt: material.iconAlt || material.name,
          current: material.current || 0,
          required: material.required || 0,
          deficit: material.deficit || 0,
          isMultiPurpose: material.isMultiPurpose || false,
          prefixes: material.prefixes || [],
          originalIds: material.originalIds || [materialId],
          existsInCurrentMaterials: materials.some(m => m.id === materialId),
        };
      })
      .filter(material => material !== null) // Remove null entries
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
    
    // Apply sorting
    if (sortBy !== 'default') {
      materialsList.sort((a, b) => {
        switch(sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'current-high':
            return (b.current || 0) - (a.current || 0);
          case 'current-low':
            return (a.current || 0) - (b.current || 0);
          case 'deficit-high':
            return (b.deficit || 0) - (a.deficit || 0);
          case 'deficit-low':
            return (a.deficit || 0) - (b.deficit || 0);
          default:
            return 0;
        }
      });
    }
    
    return materialsList;
  }, [inventory, getMaterialDetails, materials, searchTerm, rarityFilter, categoryFilter, mergedMaterials, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalItems = Object.keys(inventory).length;
    const totalQuantity = Object.values(inventory).reduce((sum, val) => sum + (val || 0), 0);
    const totalRequired = filteredMaterials.reduce((sum, mat) => sum + (mat.required || 0), 0);
    const totalDeficit = filteredMaterials.reduce((sum, mat) => sum + (mat.deficit || 0), 0);
    const categories = {};
    
    filteredMaterials.forEach(material => {
      categories[material.category] = (categories[material.category] || 0) + 1;
    });
    
    return { totalItems, totalQuantity, totalRequired, totalDeficit, categories };
  }, [inventory, filteredMaterials]);

  // Material Card Component - Enhanced Design
  const MaterialCard = React.memo(({ material }) => {
    // Get current value directly from inventory (stable reference)
    const currentValue = inventory[material.id] || 0;
    
    // Local state for input value to prevent re-renders
    const [localValue, setLocalValue] = useState(String(currentValue));
    const inputRef = useRef(null);

    // Check if this material is merged from multiple sources
    const isMerged = material.isMultiPurpose;
    const prefixes = material.prefixes || [];
    const originalIds = material.originalIds || [];
    
    // Show usage information if merged
    const getUsageText = () => {
      if (!isMerged) return null;
      
      const uses = [];
      if (prefixes.includes('ascension')) uses.push('Ascension');
      if (prefixes.includes('skill')) uses.push('Skill');
      if (prefixes.includes('material')) uses.push('Material');
      if (prefixes.includes('base')) uses.push('Base');
      
     
    };
    
    const usageText = getUsageText();
    
    // Progress percentage for visual indicator
    const progressPercentage = material.required > 0 
      ? Math.min(100, (currentValue / material.required) * 100) 
      : 100;

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

    const handleSetRequired = useCallback((e) => {
      e?.stopPropagation();
      handleInventoryChange(material.id, material.required || 0);
    }, [material.id, material.required, handleInventoryChange]);

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
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-100 shadow-lg p-4 hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:scale-[1.02]">
        {/* Card Header with Material Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Material Icon with Glow Effect */}
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 overflow-hidden flex-shrink-0 shadow-md">
                <img 
                  src={material.icon} 
                  alt={material.iconAlt}
                  className="w-full h-full object-cover p-1"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/56x56/3b82f6/fff?text=?";
                  }}
                />
              </div>
              
            </div>
            
            {/* Material Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{material.name}</h3>
                    {material.rarity && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        material.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        material.rarity === 'Rare' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {material.rarity}
                      </span>
                    )}
                  </div>
                  
                  {usageText && (
                    <p className="text-xs text-purple-600 font-medium mb-1 flex items-center gap-1">
                      <Icon name="Activity" size={10} />
                      {usageText}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">
                      {material.category}
                    </span>
                    {originalIds.length > 1 && (
                      <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {originalIds.length} sources
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Current quantity with visual indicator */}
                <div className="text-right ml-2 flex-shrink-0">
                  <div className="text-sm">
                    <div className="text-blue-500 text-xs font-semibold uppercase tracking-wide">Current</div>
                    <span className="font-bold text-blue-700 text-xl">{currentValue.toLocaleString()}</span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
        
        
        
        {/* Quantity Control Section */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-blue-600">Adjust Quantity</div>
            <div className="flex gap-1">
              
              <button
                onClick={handleSet0}
                className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-200 border border-red-700 shadow-sm"
                aria-label="Set to 0"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Input and Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleSubtract1}
                className="w-10 h-10 rounded-lg border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-sm"
                aria-label="Subtract 1"
              >
                <Icon name="Minus" size={16} className="text-blue-600" />
              </button>
              
              <div className="relative flex-1 max-w-40">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={localValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlurComplete}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-2 text-center border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-300 no-auto-scroll text-blue-700 font-bold text-lg shadow-inner"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 font-medium">
                  QTY
                </div>
              </div>
              
              <button
                onClick={handleAdd1}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center border-2 border-blue-700 transition-all duration-200 flex-shrink-0 shadow-md"
                aria-label="Add 1"
              >
                <Icon name="Plus" size={16} />
              </button>
              
              {!isMobileView && (
                <>
                  <button
                    onClick={handleAdd10}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white flex items-center justify-center border-2 border-blue-600 transition-all duration-200 text-sm font-bold flex-shrink-0 shadow-md"
                    aria-label="Add 10"
                  >
                    +10
                  </button>
                  <button
                    onClick={handleAdd100}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center justify-center border-2 border-blue-800 transition-all duration-200 text-sm font-bold flex-shrink-0 shadow-md"
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
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={handleAdd10}
                className="py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 rounded-lg text-sm font-semibold transition-all duration-200 border border-blue-600 shadow-sm"
              >
                +10
              </button>
              <button
                onClick={handleAdd100}
                className="py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg text-sm font-semibold transition-all duration-200 border border-blue-800 shadow-sm"
              >
                +100
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return prevProps.material.id === nextProps.material.id &&
           prevProps.material.name === nextProps.material.name &&
           prevProps.material.icon === nextProps.material.icon &&
           prevProps.material.rarity === nextProps.material.rarity &&
           prevProps.material.category === nextProps.material.category &&
           prevProps.material.isMultiPurpose === nextProps.material.isMultiPurpose &&
           prevProps.material.required === nextProps.material.required &&
           prevProps.material.deficit === nextProps.material.deficit;
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
        
        /* Custom scrollbar for inventory */
        .inventory-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .inventory-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .inventory-scrollbar::-webkit-scrollbar-thumb {
          background: #60a5fa;
          border-radius: 4px;
        }
        
        .inventory-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
      
      <div 
        id="inventory-section"
        className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-100 shadow-xl overflow-hidden inventory-container"
      >
        {/* Inventory Header */}
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Icon name="Package" size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Material Inventory</h2>
                <p className="text-blue-100 text-sm">Manage all your materials in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <div className="text-xs text-blue-100 font-semibold">Total Items</div>
                <div className="text-white font-bold">{totals.totalQuantity.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

       

        

        {/* Materials Grid */}
        <div className="p-6 " >
          {filteredMaterials.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center border-2 border-blue-300 shadow-lg">
                <Icon name="Package" size={40} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Materials Found</h3>
              <p className="text-blue-500 text-lg max-w-md mx-auto">
                {searchTerm 
                  ? 'No materials match your search. Try different keywords.'
                  : 'Start by calculating material requirements for a servant to populate your inventory.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setRarityFilter('all');
                    setCategoryFilter('all');
                    setSortBy('default');
                  }}
                  className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Edit Modal - Enhanced Design */}
        {isMobileView && activeMaterial && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-white to-blue-50 rounded-t-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden">
                      <img 
                        src={activeMaterial.icon} 
                        alt={activeMaterial.iconAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Edit {activeMaterial.name}</h3>
                      <p className="text-blue-100 text-xs">ID: {activeMaterial.id}</p>
                      {activeMaterial.isMultiPurpose && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 mt-1">
                          Merged Material
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveMaterial(null);
                      setEditQuantity('');
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <Icon name="X" size={24} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Quantity</label>
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
                    className="w-full px-4 py-4 border-2 border-blue-200 rounded-xl text-center text-2xl font-bold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-300 text-blue-700 shadow-inner"
                  />
                  <div className="text-center text-xs text-blue-400 mt-2 font-medium">
                    Current Required: {activeMaterial.required?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <button
                    onClick={() => setEditQuantity('0')}
                    className="py-3 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl text-sm font-bold transition-all duration-200 text-red-600 border-2 border-red-300 shadow-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      const current = parseInt(editQuantity) || 0;
                      setEditQuantity(String(current + 10));
                    }}
                    className="py-3 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-sm font-bold transition-all duration-200 border-2 border-blue-600 shadow-md"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => {
                      const current = parseInt(editQuantity) || 0;
                      setEditQuantity(String(current + 100));
                    }}
                    className="py-3 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-bold transition-all duration-200 border-2 border-blue-800 shadow-md"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => {
                      const current = parseInt(editQuantity) || 0;
                      setEditQuantity(String(Math.max(0, current - 1)));
                    }}
                    className="py-3 bg-gradient-to-b from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-sm font-bold transition-all duration-200 text-blue-600 border-2 border-blue-300 shadow-sm"
                  >
                    -1
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setActiveMaterial(null);
                      setEditQuantity('');
                    }}
                    className="py-3 bg-gradient-to-b from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 rounded-xl text-sm font-bold transition-all duration-200 text-blue-600 border-2 border-blue-300 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-200 border-2 border-blue-700 shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal - Enhanced Design */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-xl font-bold text-white">Import Inventory</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Paste your inventory JSON data below to import
                </p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-blue-600 mb-2">JSON Data</label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"qp": 1000000, "ascension-6501": 50, "skill-6501": 100, ...}'
                    className="w-full h-48 px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-300 font-mono text-sm bg-white shadow-inner"
                  />
                </div>
                {importError && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600">
                      <Icon name="AlertCircle" size={16} />
                      <p className="text-sm font-semibold">{importError}</p>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 mb-4">
                  <p className="text-sm font-semibold text-blue-600 mb-2">Import Tips:</p>
                  <ul className="text-xs text-blue-500 space-y-1">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use the Export function to get the correct format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Merged materials will be handled automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Your current inventory will be updated, not replaced</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 border-t border-blue-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                    setImportError('');
                  }}
                  className="px-6 py-3 bg-gradient-to-b from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 rounded-xl text-sm font-semibold transition-all duration-200 text-blue-600 border-2 border-blue-300 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-blue-700 shadow-md"
                >
                  Import Inventory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal - Enhanced Design */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-xl font-bold text-white">Export Inventory</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Your inventory data will be downloaded as a JSON file
                </p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 mb-6">
                  <p className="text-sm font-semibold text-blue-600 mb-3">Export Summary:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-500">Unique Materials</span>
                      <span className="font-bold text-blue-700">{totals.totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-500">Total Quantity</span>
                      <span className="font-bold text-blue-700">{totals.totalQuantity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-500">Categories</span>
                      <span className="font-bold text-blue-700">{Object.keys(totals.categories).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-500">Total Deficit</span>
                      <span className="font-bold text-red-600">{totals.totalDeficit.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-400 italic">
                        • Inventory persists across servant changes
                      </p>
                      <p className="text-xs text-blue-400 italic">
                        • Ascension and Skill materials with same ID are merged
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-xl border-2 border-emerald-200">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckCircle" size={24} className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Ready for Export</p>
                      <p className="text-xs text-emerald-600">
                        Your data is secure and will be downloaded locally
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-blue-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-6 py-3 bg-gradient-to-b from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 rounded-xl text-sm font-semibold transition-all duration-200 text-blue-600 border-2 border-blue-300 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-blue-700 shadow-md"
                >
                  <Icon name="Download" size={16} className="mr-2 inline" />
                  Export Inventory
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Inventory;