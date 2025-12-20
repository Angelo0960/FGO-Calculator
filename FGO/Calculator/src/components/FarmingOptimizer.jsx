import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from './AppIcon';
import Button from './Button';
import farmingData from '../assets/famringmaterial.json';

const FarmingOptimizer = ({ 
  materials = [], 
  loading = false 
}) => {
  const [localFarmingData, setLocalFarmingData] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [farmingSpots, setFarmingSpots] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [debugInfo, setDebugInfo] = useState('Click a material to start');
  const [itemImages, setItemImages] = useState({}); // Store item name to image URL mapping

  // Function to split long material names into multiple lines
  const formatMaterialName = (name, maxWordsPerLine = 2) => {
    if (!name) return { text: '', hasMultipleLines: false };
    
    const words = name.split(' ');
    
    if (words.length <= maxWordsPerLine) {
      return { text: name, hasMultipleLines: false };
    }
    
    // Split into chunks of maxWordsPerLine
    const chunks = [];
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      chunks.push(words.slice(i, i + maxWordsPerLine).join(' '));
    }
    
    return { text: chunks.join('\n'), hasMultipleLines: true };
  };

  // Function to format large numbers with K/M abbreviations for compact display
  const formatLargeNumber = (number) => {
    if (number === undefined || number === null) return '0';
    
    const num = Number(number);
    if (isNaN(num)) return '0';
    
    // Handle very large numbers (millions)
    if (num >= 1000000) {
      const millions = num / 1000000;
      // For very large numbers (≥ 100M), show without decimals
      if (millions >= 100) {
        return `${Math.round(millions)}M`;
      }
      // For medium large numbers (≥ 10M), show without decimals
      if (millions >= 10) {
        return `${Math.round(millions)}M`;
      }
      // For smaller millions, show 1 decimal
      return `${millions.toFixed(1)}M`;
    }
    
    // Handle thousands
    if (num >= 10000) {
      const thousands = num / 1000;
      return `${Math.round(thousands)}K`;
    }
    
    if (num >= 1000) {
      const thousands = num / 1000;
      // Show 1 decimal for numbers between 1K and 10K
      if (thousands < 10) {
        return `${thousands.toFixed(1)}K`;
      }
      return `${Math.round(thousands)}K`;
    }
    
    // For numbers less than 1000, just return the number
    return num.toString();
  };

  // Merge materials by name, summing their deficits
  const mergedMaterials = useMemo(() => {
    if (!materials.length) return [];
    
    console.log('🎯 Original materials count:', materials.length);
    
    // Create a map to merge materials by their name (case-insensitive)
    const materialMap = new Map();
    
    materials.forEach((material) => {
      if (!material || !material.name) return;
      
      const materialName = material.name.toLowerCase().trim();
      const existingMaterial = materialMap.get(materialName);
      
      if (existingMaterial) {
        // Merge the deficits
        const mergedDeficit = (existingMaterial.deficit || 0) + (material.deficit || 0);
        console.log(`🔄 Merging "${material.name}": ${existingMaterial.deficit} + ${material.deficit} = ${mergedDeficit}`);
        
        // Update with merged deficit, keeping the first material's other properties
        materialMap.set(materialName, {
          ...existingMaterial,
          deficit: mergedDeficit,
          // Store original IDs for debugging
          originalIds: [...(existingMaterial.originalIds || [existingMaterial.id]), material.id]
        });
      } else {
        // First occurrence of this material
        materialMap.set(materialName, {
          ...material,
          originalIds: [material.id]
        });
        console.log(`✅ First occurrence: "${material.name}" (ID: ${material.id})`);
      }
    });
    
    // Convert map back to array
    const mergedList = Array.from(materialMap.values());
    
    console.log('🎯 Merged materials count:', mergedList.length);
    console.log('🎯 Materials merged:', materials.length - mergedList.length);
    
    // Log merged results
    console.log('\n📊 Merged Materials Summary:');
    mergedList.forEach((material, index) => {
      console.log(`${index + 1}. "${material.name}": ${material.deficit} total (from ${material.originalIds?.length || 1} sources)`);
    });
    
    return mergedList;
  }, [materials]);

  // Calculate materials with deficit after merging
  const materialsWithDeficit = useMemo(() => {
    return mergedMaterials.filter(m => m && m.deficit > 0);
  }, [mergedMaterials]);

  // Load and parse farming data
  useEffect(() => {
    console.log('📦 JSON Data loaded:', farmingData);
    console.log('📦 Data structure:', farmingData.data ? 'Has data array' : 'No data array');
    console.log('📦 First item:', farmingData.data?.[0]);
    
    if (farmingData.data && Array.isArray(farmingData.data)) {
      setLocalFarmingData(farmingData.data);
      setDebugInfo(`Loaded ${farmingData.data.length} materials from JSON`);
      console.log(`✅ Loaded ${farmingData.data.length} materials`);
      
      // Create image mapping from JSON data
      const imageMap = {};
      farmingData.data.forEach((item) => {
        if (item.item && item.icon) {
          imageMap[item.item] = item.icon;
          imageMap[item.item.toLowerCase()] = item.icon;
        }
      });
      
      setItemImages(imageMap);
      console.log(`✅ Created image mapping for ${Object.keys(imageMap).length} items`);
      
      // Log all material names
      console.log('📋 All material names:');
      farmingData.data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.item} - ${item.icon || 'No icon'}`);
      });
    } else {
      console.error('❌ No data array found in JSON');
      setDebugInfo('ERROR: No data array in JSON file');
    }
  }, []);

  // Debug incoming materials
  useEffect(() => {
    if (materials.length > 0) {
      console.log('🎯 Incoming materials from parent component:');
      materials.forEach((material, index) => {
        console.log(`${index + 1}. Name: "${material.name}", ID: ${material.id}, Deficit: ${material.deficit}`);
      });
      
      // Also log merged materials for debugging
      console.log('🎯 Merged materials after combining:');
      mergedMaterials.forEach((material, index) => {
        console.log(`${index + 1}. Name: "${material.name}", Total Deficit: ${material.deficit}, Sources: ${material.originalIds?.length || 1}`);
      });
    }
  }, [materials, mergedMaterials]);

  // Simple function to find item image from JSON data
  const getItemImage = useCallback((material) => {
    if (!material) return 'https://static.atlasacademy.io/NA/Items/99.png';
    
    const materialName = material.name;
    
    console.log(`🖼️ Looking for image for: "${materialName}"`);
    
    // 1. Try exact name match
    if (materialName && itemImages[materialName]) {
      console.log(`✅ Found image by name: "${materialName}" -> ${itemImages[materialName]}`);
      return itemImages[materialName];
    }
    
    // 2. Try lowercase name match
    if (materialName) {
      const lowerName = materialName.toLowerCase();
      if (itemImages[lowerName]) {
        console.log(`✅ Found image by lowercase name: "${lowerName}"`);
        return itemImages[lowerName];
      }
    }
    
    // 3. Search in local farming data for partial match
    const foundMaterial = localFarmingData.find(item => 
      item.item && materialName && 
      (item.item.toLowerCase() === materialName.toLowerCase() ||
       item.item.toLowerCase().includes(materialName.toLowerCase()) ||
       materialName.toLowerCase().includes(item.item.toLowerCase()))
    );
    
    if (foundMaterial && foundMaterial.icon) {
      console.log(`✅ Found image via material match: "${foundMaterial.item}" -> ${foundMaterial.icon}`);
      return foundMaterial.icon;
    }
    
    console.log(`❌ No image found for "${materialName}", using default fallback`);
    return 'https://static.atlasacademy.io/NA/Items/99.png';
  }, [itemImages, localFarmingData]);

  // Simple direct matching function
  const findMatchingMaterial = useCallback((searchName) => {
    console.log(`\n🔍 SEARCHING for: "${searchName}"`);
    
    if (!searchName || !localFarmingData.length) {
      console.log('❌ No search term or no local data');
      return null;
    }

    const searchLower = searchName.toLowerCase().trim();
    
    // Try exact match first
    for (let i = 0; i < localFarmingData.length; i++) {
      const item = localFarmingData[i];
      if (item.item.toLowerCase() === searchLower) {
        console.log(`✅ EXACT MATCH found: "${item.item}" at index ${i}`);
        return item;
      }
    }

    // Try partial match
    for (let i = 0; i < localFarmingData.length; i++) {
      const item = localFarmingData[i];
      const itemLower = item.item.toLowerCase();
      
      if (itemLower.includes(searchLower) || searchLower.includes(itemLower)) {
        console.log(`✅ PARTIAL MATCH found: "${item.item}" (search: "${searchLower}", item: "${itemLower}")`);
        return item;
      }
    }

    // Try word-by-word matching
    const searchWords = searchLower.split(/\s+/).filter(w => w.length > 2);
    for (let i = 0; i < localFarmingData.length; i++) {
      const item = localFarmingData[i];
      const itemLower = item.item.toLowerCase();
      
      let allWordsMatch = true;
      for (const word of searchWords) {
        if (!itemLower.includes(word)) {
          allWordsMatch = false;
          break;
        }
      }
      
      if (allWordsMatch && searchWords.length > 0) {
        console.log(`✅ WORD MATCH found: "${item.item}" contains all words from "${searchName}"`);
        return item;
      }
    }

    console.log(`❌ NO MATCH found for "${searchName}"`);
    console.log('Available materials (first 10):');
    localFarmingData.slice(0, 10).forEach((item, idx) => {
      console.log(`  ${idx + 1}. "${item.item}"`);
    });
    
    return null;
  }, [localFarmingData]);

  // Simple find farming spots
  const findFarmingSpots = useCallback((materialName) => {
    console.log(`\n📍 FINDING spots for: "${materialName}"`);
    setSearchStatus('searching');
    
    const materialData = findMatchingMaterial(materialName);
    
    if (!materialData) {
      console.log(`❌ No material data found for "${materialName}"`);
      setSearchStatus('complete');
      setDebugInfo(`No data found for "${materialName}"`);
      return [];
    }
    
    console.log(`✅ Found material: "${materialData.item}"`);
    console.log(`📊 Number of farming locations: ${materialData.best_farming_locations?.length || 0}`);
    
    if (!materialData.best_farming_locations || materialData.best_farming_locations.length === 0) {
      console.log('⚠️ Material has no farming locations');
      setDebugInfo(`Material "${materialData.item}" found but has no farming locations`);
      setSearchStatus('complete');
      return [];
    }
    
    // Process locations
    const spots = materialData.best_farming_locations.map((location, index) => {
      console.log(`  Location ${index + 1}: ${location.area} - ${location.quest}`);
      return {
        id: `${materialData.item}-${index}`,
        area: location.area || 'Unknown',
        quest: location.quest || 'Unknown',
        apCost: location.ap || 0,
        dropRate: location.drop_chance_percent || 0,
        apPerDrop: location.ap_per_drop || 0,
        runs: location.runs || 0,
        rank: location.no || index + 1,
        bpPerAP: location.bp_per_ap || 0,
        dropChancePercent: location.drop_chance_percent || 0
      };
    });
    
    console.log(`✅ Processed ${spots.length} farming spots`);
    setSearchStatus('complete');
    setDebugInfo(`Found ${spots.length} spots for "${materialData.item}"`);
    
    return spots;
  }, [findMatchingMaterial]);

  // Handle material selection
  const handleSelectMaterial = useCallback((material) => {
    console.log(`\n🎯 MATERIAL SELECTED:`);
    console.log('  Name:', material.name);
    console.log('  Total Deficit:', material.deficit);
    console.log('  Sources:', material.originalIds?.length || 1);
    
    // Toggle selection - if clicking the same material, deselect it
    if (selectedMaterial?.name?.toLowerCase() === material.name?.toLowerCase()) {
      setSelectedMaterial(null);
      setFarmingSpots([]);
      setSearchStatus('idle');
    } else {
      setSelectedMaterial(material);
      setFarmingSpots([]);
      
      const spots = findFarmingSpots(material.name);
      setFarmingSpots(spots);
    }
  }, [selectedMaterial, findFarmingSpots]);

  // Calculate total AP needed
  const totalAPNeeded = useMemo(() => {
    if (!selectedMaterial || farmingSpots.length === 0) return 0;
    
    const bestSpot = farmingSpots[0];
    if (!bestSpot || bestSpot.apPerDrop <= 0) return 0;
    
    return Math.ceil(bestSpot.apPerDrop * (selectedMaterial.deficit || 0));
  }, [selectedMaterial, farmingSpots]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-100 shadow-lg p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-900">
            Loading Optimizer...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon name="Target" size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Farming Optimizer</h2>
              <p className="text-blue-100 mt-2 font-medium">Select a material to find optimal farming spots</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <div className="text-xs text-blue-100 font-semibold">Materials Ready</div>
              <div className="text-white font-bold">{materialsWithDeficit.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">
              {materialsWithDeficit.length} materials with deficit
            </span>
          </div>
          {selectedMaterial && (
            <>
              <div className="hidden sm:block w-px h-5 bg-blue-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">
                  Selected: {selectedMaterial.name}
                </span>
              </div>
              {totalAPNeeded > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-700">
                    Total AP needed: {totalAPNeeded.toLocaleString()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Materials Selection */}
      <div className="p-6">
        {materialsWithDeficit.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center border-2 border-blue-300 shadow-lg">
              <Icon name="Package" size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">No Materials Found</h3>
            <p className="text-blue-600 mb-6 max-w-md mx-auto">
              There are no materials with deficits to optimize. Calculate servant requirements first.
            </p>
            <Button
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-2 border-blue-700 shadow-md"
              onClick={() => handleSelectMaterial({ 
                id: 'test-proof', 
                name: 'Proof of Hero', 
                deficit: 10 
              })}
            >
              <Icon name="Target" size={16} className="mr-2" />
              Test with "Proof of Hero"
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materialsWithDeficit.map(material => {
                const { text: formattedName, hasMultipleLines } = formatMaterialName(material.name, 2);
                const isSelected = selectedMaterial?.name?.toLowerCase() === material.name?.toLowerCase();
                const formattedDeficit = formatLargeNumber(material.deficit);
                
                return (
                  <div key={material.id || material.name} className="col-span-full">
                    {/* Material Card */}
                    <button
                      onClick={() => handleSelectMaterial(material)}
                      disabled={searchStatus === 'searching'}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 w-full min-h-[108px] hover:scale-[1.02] hover:shadow-lg ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3),0_4px_12px_rgba(59,130,246,0.15)]'
                          : 'border-blue-200 hover:border-blue-400 hover:bg-gradient-to-br from-blue-50 to-white'
                      } ${searchStatus === 'searching' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex flex-col w-full h-full">
                        <div className="flex items-center gap-4 mb-3 w-full flex-1">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-blue-100 border-2 border-blue-200 overflow-hidden flex-shrink-0 shadow-md">
                              <img 
                                src={getItemImage(material)}
                                alt={material.name}
                                className="w-full h-full object-cover p-1"
                                onError={(e) => {
                                  e.target.src = 'https://static.atlasacademy.io/NA/Items/99.png';
                                }}
                              />
                            </div>
                            {material.originalIds?.length > 1 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md border border-purple-300">
                                <span className="text-xs font-bold text-white">{material.originalIds.length}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-left flex-1 min-w-0 w-full">
                            <div 
                              className={`font-semibold text-blue-900 w-full ${
                                hasMultipleLines 
                                  ? 'whitespace-pre-line leading-tight line-clamp-2' 
                                  : 'truncate'
                              }`}
                              title={material.name}
                            >
                              {hasMultipleLines ? formattedName : material.name}
                            </div>
                            {material.originalIds?.length > 1 && (
                              <p className="text-xs text-purple-600 font-medium mt-1">
                                Merged from {material.originalIds.length} sources
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-auto w-full">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-baseline gap-2 min-w-0 flex-1 overflow-hidden">
                              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg border border-blue-300 shadow-sm">
                                <span 
                                  className="font-bold text-blue-900 text-xl leading-none"
                                  title={`Need ${material.deficit?.toLocaleString() || '0'}`}
                                >
                                  {formattedDeficit}
                                </span>
                              </div>
                              <span className="text-xs text-blue-600 font-semibold flex-shrink-0">total needed</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              {isSelected ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                                  <span className="text-xs text-green-600 font-semibold truncate flex-shrink-0">
                                    Analyzing...
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-blue-500 font-semibold truncate flex-shrink-0 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded-md border border-blue-200">
                                  Click to analyze
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Farming Results - Appears directly below selected material */}
                    {isSelected && (
                      <div className="mt-4">
                        {/* Search Status */}
                        {searchStatus === 'searching' ? (
                          <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 shadow-md">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <h4 className="text-lg font-semibold text-blue-900 mb-2">
                              Finding Optimal Spots
                            </h4>
                            <p className="text-blue-600 text-sm">
                              Analyzing farming data for <span className="font-bold">{material.name}</span>...
                            </p>
                            <div className="mt-4 text-xs text-blue-500">
                              Searching through {localFarmingData.length} materials database
                            </div>
                          </div>
                        ) : farmingSpots.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                              <div>
                                <h4 className="font-bold text-blue-900 text-lg">
                                  <Icon name="MapPin" size={18} className="inline mr-2" />
                                  Optimal Farming Spots
                                </h4>
                                <p className="text-sm text-blue-600">
                                  Based on {farmingSpots[0]?.runs?.toLocaleString() || 0} total samples
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-medium text-blue-500">Total AP Required</div>
                                <div className="text-xl font-bold text-blue-700">
                                  {totalAPNeeded.toLocaleString()} AP
                                </div>
                              </div>
                            </div>
                            
                            {farmingSpots.map((spot, index) => (
                              <div key={spot.id} className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                {/* Spot Header */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold shadow-md">
                                        Rank #{spot.rank}
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-blue-900 text-base">{spot.area}</h5>
                                        <p className="text-sm text-blue-700 truncate flex items-center gap-1">
                                          <Icon name="Flag" size={12} />
                                          {spot.quest}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="flex items-center gap-2">
                                        <Icon name="Battery" size={18} className="text-blue-500" />
                                        <div className="text-2xl font-bold text-blue-700">AP: {spot.apCost}</div>
                                      </div>
                                      <div className="text-xs text-blue-600 font-medium mt-1">
                                        {spot.runs?.toLocaleString() || 0} runs sampled
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Metrics Grid */}
                                <div className="p-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="text-center p-3 bg-gradient-to-b from-blue-50 to-white rounded-lg border-2 border-blue-200 shadow-sm">
                                      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-700 mb-2">
                                        <Icon name="TrendingUp" size={12} />
                                        Drop Rate
                                      </div>
                                      <div className="text-xl font-bold text-blue-900">
                                        {spot.dropRate?.toFixed(1) || 0}%
                                      </div>
                                      <div className="text-xs text-blue-500 mt-1">
                                        Chance per run
                                      </div>
                                    </div>
                                    
                                    <div className="text-center p-3 bg-gradient-to-b from-green-50 to-white rounded-lg border-2 border-green-200 shadow-sm">
                                      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-green-700 mb-2">
                                        <Icon name="Target" size={12} />
                                        AP per Drop
                                      </div>
                                      <div className="text-xl font-bold text-green-900">
                                        {spot.apPerDrop?.toFixed(1) || 0}
                                      </div>
                                      <div className="text-xs text-green-500 mt-1">
                                        Efficiency score
                                      </div>
                                    </div>
                                    
                                    <div className="text-center p-3 bg-gradient-to-b from-orange-50 to-white rounded-lg border-2 border-orange-200 shadow-sm">
                                      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-orange-700 mb-2">
                                        <Icon name="Repeat" size={12} />
                                        Runs for 1
                                      </div>
                                      <div className="text-xl font-bold text-orange-900">
                                        {spot.dropRate > 0 ? Math.ceil(100 / spot.dropRate) : '∞'}
                                      </div>
                                      <div className="text-xs text-orange-500 mt-1">
                                        Expected attempts
                                      </div>
                                    </div>
                                    
                                    <div className="text-center p-3 bg-gradient-to-b from-purple-50 to-white rounded-lg border-2 border-purple-200 shadow-sm">
                                      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-purple-700 mb-2">
                                        <Icon name="Calculator" size={12} />
                                        Total Runs
                                      </div>
                                      <div className="text-xl font-bold text-purple-900">
                                        {spot.dropRate > 0 ? Math.ceil((100 / spot.dropRate) * material.deficit) : '∞'}
                                      </div>
                                      <div className="text-xs text-purple-500 mt-1">
                                        For {material.deficit} needed
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : searchStatus === 'complete' ? (
                          <div className="text-center py-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 shadow-md">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-2 border-blue-300">
                              <Icon name="Search" size={24} className="text-blue-600" />
                            </div>
                            <h4 className="text-base font-bold text-blue-900 mb-2">
                              No Farming Data Available
                            </h4>
                            <p className="text-blue-600 text-sm max-w-md mx-auto mb-4">
                              Sorry, we couldn't find any farming data for "{material.name}" in our database.
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                              <Icon name="Info" size={14} className="text-blue-500" />
                              <span className="text-xs text-blue-600">
                                Try checking the Material Encyclopedia
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Icon name="Database" size={14} />
            <span>Database: {localFarmingData.length} materials</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Icon name="Activity" size={14} />
            <span>Status: {searchStatus === 'searching' ? 'Searching...' : 'Ready'}</span>
          </div>
          <div className="text-xs text-blue-500 font-medium">
            Updated with real farming data from community
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmingOptimizer;