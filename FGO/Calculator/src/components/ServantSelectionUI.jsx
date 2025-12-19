import React, { useState, useMemo, useEffect } from 'react';
import ServantSelector from './ServanSelector';
import LevelConfiguration from './LevelConfiguration';
import SkillConfiguration from './SkillConfiguration';
import MaterialResultsTable from './MaterialResultsTable';
import MaterialResultsCards from './MaterialResultsCards';
import FarmingOptimizer from './FarmingOptimizer';
import AdvancedOptions from './AdvanceOption';
import Inventory from './Inventory';
import Button from './Button';
import Icon from './AppIcon';

const ServantCalculator = () => {
  const [selectedServant, setSelectedServant] = useState('');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(90);
  const [currentAscension, setCurrentAscension] = useState(0);
  const [targetAscension, setTargetAscension] = useState(4);
  const [skills, setSkills] = useState([
    { current: 1, target: 10 },
    { current: 1, target: 10 },
    { current: 1, target: 10 }
  ]);
  const [advancedOptions, setAdvancedOptions] = useState({
    eventBonus: 0,
    dropRateModifier: 0,
    includeQP: true,
    prioritizeEvents: false,
    showAPEfficiency: true
  });
  const [errors, setErrors] = useState({});
  const [materials, setMaterials] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [apiMaterials, setApiMaterials] = useState([]);
  const [servants, setServants] = useState([]);
  const [loadingServants, setLoadingServants] = useState(false);
  const [warData, setWarData] = useState([]);
  const [loadingWarData, setLoadingWarData] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [activeView, setActiveView] = useState('calculator');

  // Fetch servants and materials from API on component mount
  useEffect(() => {
    const loadServants = async () => {
      setLoadingServants(true);
      try {
        const response = await fetch('https://api.atlasacademy.io/export/NA/nice_servant.json');
        if (!response.ok) throw new Error('Failed to fetch servants');
        const data = await response.json();
        setServants(data);
      } catch (error) {
        console.error('Failed to load servants:', error);
      } finally {
        setLoadingServants(false);
      }
    };

    const loadMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const response = await fetch('https://api.atlasacademy.io/export/NA/nice_item.json');
        if (!response.ok) throw new Error('Failed to fetch materials');
        const data = await response.json();
        setApiMaterials(data);
      } catch (error) {
        console.error('Failed to load materials:', error);
      } finally {
        setLoadingMaterials(false);
      }
    };

    const loadWarData = async () => {
      setLoadingWarData(true);
      try {
        const response = await fetch('https://api.atlasacademy.io/export/NA/nice_war.json');
        if (!response.ok) throw new Error('Failed to fetch war data');
        const data = await response.json();
        setWarData(data);
      } catch (error) {
        console.error('Failed to load war data:', error);
      } finally {
        setLoadingWarData(false);
      }
    };

    loadServants();
    loadMaterials();
    loadWarData();
  }, []);

  const selectedServantData = useMemo(() => {
    if (!selectedServant) return null;
    return servants?.find((s) => s?.id === parseInt(selectedServant) || s?.collectionNo === parseInt(selectedServant));
  }, [selectedServant, servants]);

  // Update targetLevel when servant changes
  useEffect(() => {
    if (selectedServantData && selectedServantData.lvMax) {
      setTargetLevel(selectedServantData.lvMax);
    }
  }, [selectedServantData]);

  // Automatically calculate materials when dependencies change
  useEffect(() => {
    if (autoCalculate && selectedServantData && !loadingMaterials && !loadingServants) {
      validateAndCalculate();
    } else if (autoCalculate && !selectedServantData) {
      // Clear materials when no servant is selected
      setMaterials([]);
      setHasCalculated(false);
    }
  }, [
    autoCalculate,
    selectedServant,
    currentLevel,
    targetLevel,
    currentAscension,
    targetAscension,
    skills,
    selectedServantData,
    loadingMaterials,
    loadingServants,
    advancedOptions.includeQP
  ]);

  // Validate inputs and calculate if valid
  const validateAndCalculate = () => {
    const newErrors = {};

    if (!selectedServant || !selectedServantData) {
      setMaterials([]);
      setHasCalculated(false);
      return;
    }

    if (targetLevel < currentLevel) {
      newErrors.targetLevel = 'Target level must be greater than current level';
    }

    if (targetAscension < currentAscension) {
      newErrors.targetAscension = 'Target ascension must be greater than current ascension';
    }

    skills.forEach((skill, index) => {
      if (skill.target < skill.current) {
        newErrors[`skill${index + 1}Target`] = 'Target must be greater than current';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newMaterials = calculateRequirements();
      setMaterials(newMaterials);
      setHasCalculated(true);
    } else {
      setMaterials([]);
      setHasCalculated(false);
    }
  };

  // Calculate material requirements
  const calculateRequirements = () => {
    if (!selectedServantData) {
      return [];
    }

    const materialsList = [];

    const levelDifference = targetLevel - currentLevel;
    const ascensionDifference = targetAscension - currentAscension;
    
    if (levelDifference <= 0 && ascensionDifference <= 0 && 
        skills.every(skill => skill.target - skill.current <= 0)) {
      return [];
    }

    // 1. QP requirements
    const qpRequired = calculateQPRequirements();
    const qpMaterial = apiMaterials.find(m => m.name === 'QP') || {
      id: 1,
      name: 'QP',
      icon: 'https://static.atlasacademy.io/NA/Items/5.png',
      detail: 'Quantum Particle'
    };
    
    if (qpMaterial && advancedOptions.includeQP && qpRequired > 0) {
      materialsList.push({
        id: 'qp',
        name: qpMaterial.name,
        rarity: 'Currency',
        icon: qpMaterial.icon,
        iconAlt: qpMaterial.detail || 'In-game currency',
        required: qpRequired,
        current: 0,
        deficit: qpRequired
      });
    }

    // 2. Ember requirements
    const emberRequirements = calculateEmberRequirements();
    if (emberRequirements.length > 0) {
      emberRequirements.forEach((ember) => {
        materialsList.push({
          id: `ember-${ember.type.toLowerCase()}`,
          name: ember.name,
          rarity: ember.type,
          icon: ember.icon,
          iconAlt: ember.iconAlt,
          required: ember.required,
          current: 0,
          deficit: ember.required
        });
      });
    }

    // 3. Ascension materials
    const ascensionMaterials = calculateAscensionMaterials();
    if (ascensionMaterials.length > 0) {
      ascensionMaterials.forEach((material) => {
        materialsList.push({
          id: `ascension-${material.id}`,
          name: material.name,
          rarity: material.rarity,
          icon: material.icon,
          iconAlt: material.iconAlt,
          required: material.required,
          current: 0,
          deficit: material.required
        });
      });
    }

    // 4. Skill materials
    const skillMaterials = calculateSkillMaterials();
    if (skillMaterials.length > 0) {
      skillMaterials.forEach((material) => {
        materialsList.push({
          id: `skill-${material.id}`,
          name: material.name,
          rarity: material.rarity,
          icon: material.icon,
          iconAlt: material.iconAlt,
          required: material.required,
          current: 0,
          deficit: material.required
        });
      });
    }

    return materialsList;
  };

  const calculateQPRequirements = () => {
    // ADD THIS NULL CHECK AT THE BEGINNING
    if (!selectedServantData) {
      return 0;
    }
    
    let totalQP = 0;
    
    const servantRarity = parseInt(selectedServantData.rarity);
    
    // 1. Level up QP cost
    const levels = Math.max(0, targetLevel - currentLevel);
    const levelQP = levels * (servantRarity === 5 ? 10000 : 
                             servantRarity === 4 ? 8000 : 
                             servantRarity === 3 ? 6000 : 
                             servantRarity === 2 ? 4000 : 2000);
    totalQP += levelQP;
    
    // 2. Ascension QP cost
    const ascensions = Math.max(0, targetAscension - currentAscension);
    
    if (ascensions > 0) {
      let baseAscensionCost = 0;
      
      switch(servantRarity) {
        case 5: baseAscensionCost = 1000000; break;
        case 4: baseAscensionCost = 800000; break;
        case 3: baseAscensionCost = 600000; break;
        case 2: baseAscensionCost = 400000; break;
        case 1: baseAscensionCost = 200000; break;
        default: baseAscensionCost = 100000;
      }
      
      totalQP += baseAscensionCost * ascensions;
      
      // Grail casting cost
      if (targetAscension === 4 && currentAscension < 4) {
        let grailCastingCost = 0;
        switch(servantRarity) {
          case 5: grailCastingCost = 400000; break;
          case 4: grailCastingCost = 320000; break;
          case 3: grailCastingCost = 240000; break;
          case 2: grailCastingCost = 160000; break;
          case 1: grailCastingCost = 80000; break;
          default: grailCastingCost = 40000;
        }
        totalQP += grailCastingCost;
      }
    }
    
    // 3. Skill QP cost
    const baseSkillCosts = {
      1: 200000,
      2: 400000,
      3: 1200000,
      4: 1600000,
      5: 4000000,
      6: 5000000,
      7: 10000000,
      8: 12000000,
      9: 20000000
    };
    
    skills.forEach(skill => {
      const skillLevels = Math.max(0, skill.target - skill.current);
      if (skillLevels > 0) {
        let multiplier = 1.0;
        switch(servantRarity) {
          case 5: multiplier = 1.0; break;
          case 4: multiplier = 0.8; break;
          case 3: multiplier = 0.6; break;
          case 2: multiplier = 0.4; break;
          case 1: multiplier = 0.2; break;
          default: multiplier = 0.5;
        }
        
        for (let level = skill.current; level < skill.target; level++) {
          if (baseSkillCosts[level]) {
            totalQP += Math.round(baseSkillCosts[level] * multiplier);
          }
        }
      }
    });
    
    return totalQP;
  };

  const calculateEmberRequirements = () => {
    // ADD NULL CHECK
    if (!selectedServantData) {
      return [];
    }
    
    const levels = Math.max(0, targetLevel - currentLevel);
    const embers = [];
    
    if (levels <= 0) return embers;
    
    const servantRarity = parseInt(selectedServantData.rarity);
    
    let multiplier;
    switch(servantRarity) {
      case 5: multiplier = 4; break;
      case 4: multiplier = 3; break;
      case 3: multiplier = 2.5; break;
      case 2: multiplier = 2; break;
      case 1: multiplier = 1.5; break;
      default: multiplier = 2;
    }
    
    const bronzeEmbers = Math.floor(levels * 6 * multiplier);
    const silverEmbers = Math.floor(levels * 4 * multiplier);
    const goldEmbers = Math.floor(levels * 2 * multiplier);
    
    if (servantRarity <= 2) {
      const adjustedBronze = Math.floor(bronzeEmbers * 1.5);
      const adjustedSilver = Math.floor(silverEmbers * 0.8);
      const adjustedGold = Math.floor(goldEmbers * 0.5);
      
      if (adjustedBronze > 0) {
        embers.push({
          type: 'Bronze',
          name: 'Bronze Ember',
          icon: "https://images.unsplash.com/photo-1613346697264-350936cb3ba3?w=400&h=400&fit=crop",
          iconAlt: 'Orange glowing magical ember',
          required: adjustedBronze,
        });
      }
      
      if (adjustedSilver > 0) {
        embers.push({
          type: 'Silver',
          name: 'Silver Ember',
          icon: "https://images.unsplash.com/photo-1695405717412-1820bef82a43?w=400&h=400&fit=crop",
          iconAlt: 'Silver magical ember',
          required: adjustedSilver,
        });
      }
      
      if (adjustedGold > 0) {
        embers.push({
          type: 'Gold',
          name: 'Gold Ember',
          icon: "https://images.unsplash.com/photo-1646739048514-d1ca222fc51a?w=400&h=400&fit=crop",
          iconAlt: 'Gold magical ember',
          required: adjustedGold,
        });
      }
    } else {
      if (bronzeEmbers > 0) {
        embers.push({
          type: 'Bronze',
          name: 'Bronze Ember',
          icon: "https://images.unsplash.com/photo-1613346697264-350936cb3ba3?w=400&h=400&fit=crop",
          iconAlt: 'Orange glowing magical ember',
          required: bronzeEmbers,
        });
      }
      
      if (silverEmbers > 0) {
        embers.push({
          type: 'Silver',
          name: 'Silver Ember',
          icon: "https://images.unsplash.com/photo-1695405717412-1820bef82a43?w=400&h=400&fit=crop",
          iconAlt: 'Silver magical ember',
          required: silverEmbers,
        });
      }
      
      if (goldEmbers > 0) {
        embers.push({
          type: 'Gold',
          name: 'Gold Ember',
          icon: "https://images.unsplash.com/photo-1646739048514-d1ca222fc51a?w=400&h=400&fit=crop",
          iconAlt: 'Gold magical ember',
          required: goldEmbers,
        });
      }
    }
    
    return embers;
  };

  const calculateAscensionMaterials = () => {
    // ADD NULL CHECK
    if (!selectedServantData) {
      return [];
    }
    
    const ascensions = Math.max(0, targetAscension - currentAscension);
    const materials = [];
    
    if (ascensions <= 0) return materials;
    
    if (!selectedServantData.ascensionMaterials || typeof selectedServantData.ascensionMaterials !== 'object') {
      console.warn('No ascension materials found for servant:', selectedServantData.name);
      return materials;
    }
    
    const materialMap = new Map();
    
    for (let ascensionLevel = currentAscension; ascensionLevel < targetAscension; ascensionLevel++) {
      const ascensionData = selectedServantData.ascensionMaterials[ascensionLevel];
      
      if (ascensionData) {
        if (Array.isArray(ascensionData)) {
          ascensionData.forEach(itemData => {
            const itemId = itemData.item?.id || itemData.id;
            const amount = itemData.amount || itemData.count || 0;
            
            if (itemId) {
              if (materialMap.has(itemId)) {
                materialMap.set(itemId, materialMap.get(itemId) + amount);
              } else {
                materialMap.set(itemId, amount);
              }
            }
          });
        } else if (ascensionData.items && Array.isArray(ascensionData.items)) {
          ascensionData.items.forEach(itemData => {
            const itemId = itemData.item?.id || itemData.id;
            const amount = itemData.amount || itemData.count || 0;
            
            if (itemId) {
              if (materialMap.has(itemId)) {
                materialMap.set(itemId, materialMap.get(itemId) + amount);
              } else {
                materialMap.set(itemId, amount);
              }
            }
          });
        }
      }
    }
    
    materialMap.forEach((requiredAmount, itemId) => {
      const apiMaterial = apiMaterials.find(m => m.id === itemId);
      if (apiMaterial) {
        materials.push({
          id: itemId,
          name: apiMaterial.name,
          rarity: getRarityFromMaterial(apiMaterial),
          icon: apiMaterial.icon || `https://static.atlasacademy.io/NA/Items/${itemId}.png`,
          iconAlt: apiMaterial.detail || apiMaterial.name,
          required: requiredAmount,
        });
      } else {
        materials.push({
          id: itemId,
          name: `Material #${itemId}`,
          rarity: 'Common',
          icon: `https://static.atlasacademy.io/NA/Items/${itemId}.png`,
          iconAlt: `Material ID: ${itemId}`,
          required: requiredAmount,
        });
      }
    });
    
    return materials;
  };

  const calculateSkillMaterials = () => {
    // ADD NULL CHECK
    if (!selectedServantData) {
      return [];
    }
    
    const materials = [];
    
    if (!selectedServantData.skillMaterials || typeof selectedServantData.skillMaterials !== 'object') {
      console.warn('No skill materials found for servant:', selectedServantData.name);
      return materials;
    }
    
    const materialMap = new Map();
    
    skills.forEach((skill, skillIndex) => {
      const skillLevels = Math.max(0, skill.target - skill.current);
      if (skillLevels > 0) {
        for (let level = skill.current; level < skill.target; level++){
          const skillData = selectedServantData.skillMaterials[level];
          
          if (skillData) {
            if (Array.isArray(skillData)) {
              skillData.forEach(itemData => {
                const itemId = itemData.item?.id || itemData.id;
                const amount = itemData.amount || itemData.count || 0;
                
                if (itemId) {
                  if (materialMap.has(itemId)) {
                    materialMap.set(itemId, materialMap.get(itemId) + amount);
                  } else {
                    materialMap.set(itemId, amount);
                  }
                }
              });
            } else if (skillData.items && Array.isArray(skillData.items)) {
              skillData.items.forEach(itemData => {
                const itemId = itemData.item?.id || itemData.id;
                const amount = itemData.amount || itemData.count || 0;
                
                if (itemId) {
                  if (materialMap.has(itemId)) {
                    materialMap.set(itemId, materialMap.get(itemId) + amount);
                  } else {
                    materialMap.set(itemId, amount);
                  }
                }
              });
            }
          }
        }
      }
    });
    
    materialMap.forEach((requiredAmount, itemId) => {
      const apiMaterial = apiMaterials.find(m => m.id === itemId);
      if (apiMaterial) {
        materials.push({
          id: itemId,
          name: apiMaterial.name,
          rarity: getRarityFromMaterial(apiMaterial),
          icon: apiMaterial.icon || `https://static.atlasacademy.io/NA/Items/${itemId}.png`,
          iconAlt: apiMaterial.detail || apiMaterial.name,
          required: requiredAmount,
        });
      } else {
        materials.push({
          id: itemId,
          name: `Material #${itemId}`,
          rarity: 'Common',
          icon: `https://static.atlasacademy.io/NA/Items/${itemId}.png`,
          iconAlt: `Material ID: ${itemId}`,
          required: requiredAmount,
        });
      }
    });
    
    return materials;
  };

  const getRarityFromMaterial = (material) => {
    if (material.background) {
      switch(material.background) {
        case 'gold': return 'Gold';
        case 'silver': return 'Silver';
        case 'bronze': return 'Bronze';
        default: return 'Common';
      }
    }
    if (material.id >= 6000 && material.id < 7000) {
      if (material.id >= 6500) return 'Gold';
      if (material.id >= 6300) return 'Silver';
      return 'Bronze';
    }
    return 'Common';
  };

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
  };

  const handleAdvancedOptionsChange = (field, value) => {
    setAdvancedOptions((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInventoryUpdate = (materialId, change) => {
    setMaterials(prevMaterials => 
      prevMaterials.map(material => {
        if (material.id === materialId) {
          const newCurrent = Math.max(0, (material.current || 0) + change);
          return {
            ...material,
            current: newCurrent,
            deficit: Math.max(0, material.required - newCurrent)
          };
        }
        return material;
      })
    );
  };

  // Inventory handler functions
  const handleSaveInventory = (inventoryData) => {
    try {
      localStorage.setItem('fgo-inventory', JSON.stringify(inventoryData));
      alert('Inventory saved successfully!');
    } catch (error) {
      console.error('Failed to save inventory:', error);
      alert('Failed to save inventory');
    }
  };

  const handleLoadInventory = () => {
    try {
      const savedInventory = localStorage.getItem('fgo-inventory');
      if (savedInventory) {
        const inventoryData = JSON.parse(savedInventory);
        
        setMaterials(prevMaterials => 
          prevMaterials.map(material => {
            const savedQuantity = inventoryData[material.id];
            if (savedQuantity !== undefined) {
              return {
                ...material,
                current: savedQuantity,
                deficit: Math.max(0, material.required - savedQuantity)
              };
            }
            return material;
          })
        );
        
        alert('Inventory loaded successfully!');
      } else {
        alert('No saved inventory found');
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
      alert('Failed to load inventory');
    }
  };

  const handleClearInventory = () => {
    if (window.confirm('Are you sure you want to clear all inventory? This cannot be undone.')) {
      setMaterials(prevMaterials => 
        prevMaterials.map(material => ({
          ...material,
          current: 0,
          deficit: material.required
        }))
      );
      
      try {
        localStorage.removeItem('fgo-inventory');
      } catch (error) {
        console.error('Failed to clear saved inventory:', error);
      }
      
      alert('Inventory cleared!');
    }
  };

  const handleExport = () => {
    if (!selectedServantData || materials.length === 0) {
      alert('Please configure a servant first');
      return;
    }

    const exportData = {
      servant: selectedServantData?.name,
      servantId: selectedServantData?.id,
      levels: { current: currentLevel, target: targetLevel },
      ascension: { current: currentAscension, target: targetAscension },
      skills: skills,
      materials: materials.map(m => ({
        id: m.id,
        name: m.name,
        required: m.required,
        current: m.current,
        deficit: m.deficit,
        rarity: m.rarity
      })),
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fgo-calculator-${selectedServantData?.name || 'export'}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleManualCalculate = () => {
    validateAndCalculate();
  };

  const handleReset = () => {
    setSelectedServant('');
    setCurrentLevel(1);
    setTargetLevel(90);
    setCurrentAscension(0);
    setTargetAscension(4);
    setSkills([
      { current: 1, target: 10 },
      { current: 1, target: 10 },
      { current: 1, target: 10 }
    ]);
    setAdvancedOptions({
      eventBonus: 0,
      dropRateModifier: 0,
      includeQP: true,
      prioritizeEvents: false,
      showAPEfficiency: true
    });
    setErrors({});
    setMaterials([]);
    setHasCalculated(false);
  };

  const toggleAutoCalculate = () => {
    setAutoCalculate(!autoCalculate);
  };

  // Safe function to get QP for display (handles null case)
  const getDisplayQP = () => {
    if (!selectedServantData) return 0;
    return calculateQPRequirements();
  };

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Calculator" size={24} color="var(--color-primary)" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Servant Calculator</h1>
                  <p className="text-sm text-muted-foreground">
                    Calculate material requirements for Fate/Grand Order servants
                  </p>
                  {loadingServants && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-primary">
                      <span>Loading servant data from Atlas Academy API...</span>
                    </div>
                  )}
                  {loadingMaterials && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-primary">
                      <span>Loading material data from Atlas Academy API...</span>
                    </div>
                  )}
                  {loadingWarData && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-primary">
                      <span>Loading quest data for farming optimizer...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                
              </div>
            </div>
            
            {/* Tab Navigation - Updated with Farming tab */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveView('calculator')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeView === 'calculator'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="Calculator" size={16} />
                  <span>Calculator</span>
                </div>
              </button>
              <button
                onClick={() => setActiveView('inventory')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeView === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="Package" size={16} />
                  <span>Inventory</span>
                </div>
              </button>
              <button
                onClick={() => setActiveView('farming')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeView === 'farming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={16} />
                  <span>Farming Guide</span>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional rendering for each view */}
          {activeView === 'calculator' ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <ServantSelector
                  selectedServant={selectedServant}
                  onServantChange={(value) => {
                    setSelectedServant(value || '');
                    const selected = servants?.find((s) => 
                      s?.id === parseInt(value) || s?.collectionNo === parseInt(value)
                    );
                    if (selected?.lvMax) {
                      setTargetLevel(selected.lvMax);
                    } else if (selected?.maxLevel) {
                      setTargetLevel(selected.maxLevel);
                    } else {
                      setTargetLevel(90); // Reset to default if no servant
                    }
                  }}
                  servants={servants}
                  loading={loadingServants}
                />

                <LevelConfiguration
                  currentLevel={currentLevel}
                  targetLevel={targetLevel}
                  currentAscension={currentAscension}
                  targetAscension={targetAscension}
                  onCurrentLevelChange={(value) => setCurrentLevel(value)}
                  onTargetLevelChange={(value) => setTargetLevel(value)}
                  onCurrentAscensionChange={(value) => setCurrentAscension(value)}
                  onTargetAscensionChange={(value) => setTargetAscension(value)}
                  maxLevel={selectedServantData?.maxLevel || 90}
                  errors={errors}
                />

                <SkillConfiguration
                  skills={skills}
                  onSkillChange={handleSkillChange}
                  errors={errors}
                />

               

                <div className="flex gap-3">
                  {!autoCalculate && (
                    <Button
                      variant="default"
                      fullWidth
                      iconName="Calculator"
                      iconPosition="left"
                      onClick={handleManualCalculate}
                      loading={loadingMaterials || loadingServants}
                      disabled={loadingMaterials || loadingServants}
                    >
                      {loadingMaterials || loadingServants ? 'Loading...' : 'Calculate'}
                    </Button>
                  )}
               
                </div>
                
              
              </div>

              <div className="lg:col-span-2">
                <div className="hidden md:block">
                  <MaterialResultsTable
                    materials={materials}
                    onInventoryUpdate={handleInventoryUpdate}
                    onExport={handleExport}
                    hasCalculated={hasCalculated || (selectedServant && materials.length > 0)}
                    selectedServant={selectedServant}
                    loading={loadingMaterials || loadingServants}
                  />
                </div>
                <div className="md:hidden">
                  <MaterialResultsCards
                    materials={materials}
                    onInventoryUpdate={handleInventoryUpdate}
                    onExport={handleExport}
                    hasCalculated={hasCalculated || (selectedServant && materials.length > 0)}
                    selectedServant={selectedServant}
                    loading={loadingMaterials || loadingServants}
                  />
                </div>
              </div>
            </div>
          ) : activeView === 'inventory' ? (
            <div className="grid lg:grid-cols-1 gap-6">
              <Inventory
                materials={materials}
                onSaveInventory={handleSaveInventory}
                onLoadInventory={handleLoadInventory}
                onClearInventory={handleClearInventory}
                onMaterialUpdate={handleInventoryUpdate}
              />
            </div>
          ) : (
            // Farming Guide View
            <div className="grid lg:grid-cols-1 gap-6">
              <FarmingOptimizer
                materials={materials}
                apiMaterials={apiMaterials}
                warData={warData}
                loading={loadingMaterials || loadingServants || loadingWarData}
              />
            </div>
          )}

          
        </div>
      </main>
    </div>
  );
};

export default ServantCalculator;