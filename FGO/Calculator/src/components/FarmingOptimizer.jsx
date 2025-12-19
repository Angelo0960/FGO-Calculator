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
    
    setSelectedMaterial(material);
    setFarmingSpots([]);
    
    const spots = findFarmingSpots(material.name);
    setFarmingSpots(spots);
  }, [findFarmingSpots]);

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
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-0 shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Farming Optimizer...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-0 shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Farming Optimizer</h2>
            <p className="text-sm text-gray-600 mt-1">
              {localFarmingData.length} materials with icons loaded
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-sm font-medium border border-blue-200 shadow-md">
              {mergedMaterials.length} Merged
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-xl text-sm font-medium border border-green-200 shadow-md">
              {materialsWithDeficit.length} Need Farming
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-xl text-sm font-medium border border-purple-200 shadow-md">
              {materials.length} Raw
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 shadow-inner">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800">Status</h3>
            <p className="text-sm text-blue-700">
              {materials.length} raw entries → {mergedMaterials.length} merged → {materialsWithDeficit.length} with deficit
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Raw Materials:', materials.length);
              console.log('Merged Materials:', mergedMaterials.length);
              console.log('Materials with Deficit:', materialsWithDeficit.length);
              console.log('Local Farming Data:', localFarmingData.length, 'items');
              console.log('Image Map Size:', Object.keys(itemImages).length);
              console.log('Selected Material:', selectedMaterial);
              console.log('Farming Spots:', farmingSpots.length);
              
              // Show merged materials details
              console.log('\n=== MERGED MATERIALS DETAILS ===');
              mergedMaterials.forEach((material, index) => {
                console.log(`${index + 1}. "${material.name}": ${material.deficit} total (from ${material.originalIds?.length || 1} sources)`);
              });
              
              // Show image mapping samples
              console.log('\n=== IMAGE MAPPING SAMPLES ===');
              Object.keys(itemImages).slice(0, 5).forEach(key => {
                console.log(`${key}: ${itemImages[key]}`);
              });
            }}
          >
            Debug Log
          </Button>
        </div>
      </div>

      {/* Materials Selection */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Select Material to Farm</h3>
        {materialsWithDeficit.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No materials found with deficit.</p>
            <Button
              variant="default"
              className="mt-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              onClick={() => handleSelectMaterial({ 
                id: 'test-proof', 
                name: 'Proof of Hero', 
                deficit: 10 
              })}
            >
              Test with "Proof of Hero"
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Materials combined from ascension and skill requirements</span>
              <span className="ml-auto">
                Showing {materialsWithDeficit.length} of {mergedMaterials.length} merged
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materialsWithDeficit.map(material => (
                <button
                  key={material.id || material.name}
                  onClick={() => handleSelectMaterial(material)}
                  disabled={searchStatus === 'searching'}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform ${
                    selectedMaterial?.name?.toLowerCase() === material.name?.toLowerCase()
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-[1.02] ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg hover:-translate-y-1'
                  } ${searchStatus === 'searching' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 shadow-inner border border-gray-300">
                      <img 
                        src={getItemImage(material)}
                        alt={material.name}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.log(`❌ Image load failed for ${material.name}`);
                          e.target.src = 'https://static.atlasacademy.io/NA/Items/99.png';
                        }}
                      />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{material.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Need: <span className="font-bold text-gray-900 text-lg">{material.deficit?.toLocaleString() || 0}</span>
                          </span>
                          {material.originalIds?.length > 1 && (
                            <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full shadow-sm">
                              +{material.originalIds.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Click to search</span>
                          {material.originalIds?.length > 1 && (
                            <span className="text-purple-600">(Combined)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Status */}
      {searchStatus === 'searching' && (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 font-medium">
              Searching for "{selectedMaterial?.name}"...
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-6">
        {selectedMaterial ? (
          <>
            {/* Selected Material */}
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300 shadow-lg transform transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-gray-100 border-2 border-blue-300 overflow-hidden flex-shrink-0 shadow-lg">
                  <img 
                    src={getItemImage(selectedMaterial)}
                    alt={selectedMaterial.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      console.log(`❌ Image load failed for ${selectedMaterial.name}`);
                      e.target.src = 'https://static.atlasacademy.io/NA/Items/99.png';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Farming {selectedMaterial.name}
                      </h3>
                      {selectedMaterial.originalIds?.length > 1 && (
                        <p className="text-sm text-purple-700 mt-1 font-medium">
                          🔗 Combined from {selectedMaterial.originalIds.length} requirements
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        {selectedMaterial.deficit?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Total needed</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-4">
                    {totalAPNeeded > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600 font-medium">Est. AP: </span>
                        <span className="font-bold text-blue-700 text-lg">{totalAPNeeded.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedMaterial.originalIds?.length > 1 && (
                      <div className="text-sm">
                        <span className="text-gray-600 font-medium">Sources: </span>
                        <span className="font-bold text-purple-700 text-lg">{selectedMaterial.originalIds.length}</span>
                      </div>
                    )}
                  </div>
                </div>
                {farmingSpots.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-medium">Best Spot</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                      #{farmingSpots[0]?.rank || 1}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Farming Spots */}
            {searchStatus === 'searching' ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6 shadow-lg"></div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Searching for Farming Spots
                </h4>
                <p className="text-gray-600">
                  Analyzing farming data for {selectedMaterial.name}...
                </p>
              </div>
            ) : farmingSpots.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-xl">
                    Best Farming Spots ({farmingSpots.length} found)
                  </h4>
                  <div className="text-sm text-gray-600">
                    Sorted by rank • {farmingSpots[0]?.runs?.toLocaleString() || 0} total samples
                  </div>
                </div>
                
                {farmingSpots.map((spot, index) => (
                  <div key={spot.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-300 overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="p-5 bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold border-2 border-emerald-700 shadow-lg">
                            RANK #{spot.rank}
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 text-lg">{spot.area}</h5>
                            <p className="text-sm text-gray-700 truncate">{spot.quest}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">AP: {spot.apCost}</div>
                          <div className="text-xs text-gray-600 font-medium">
                            {spot.runs?.toLocaleString() || 0} runs
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <div className="text-xs text-blue-700 font-medium mb-2">Drop Rate</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {spot.dropRate?.toFixed(1) || 0}%
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <div className="text-xs text-emerald-700 font-medium mb-2">AP per Drop</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                            {spot.apPerDrop?.toFixed(1) || 0}
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <div className="text-xs text-purple-700 font-medium mb-2">Runs for 1</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            {spot.dropRate > 0 ? Math.ceil(100 / spot.dropRate) : '∞'}
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <div className="text-xs text-orange-700 font-medium mb-2">For {selectedMaterial.deficit}</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                            {spot.dropRate > 0 ? Math.ceil((100 / spot.dropRate) * selectedMaterial.deficit) : '∞'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                          onClick={() => {
                            const query = `${spot.area} ${spot.quest} fate grand order`.replace(/\s+/g, '+');
                            window.open(`https://www.google.com/search?q=${query}`, '_blank');
                          }}
                        >
                          🔍 Search Online
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                          onClick={() => {
                            const info = `${spot.area} - ${spot.quest} (${spot.apCost} AP, ${spot.dropRate?.toFixed(1)}% drop rate)`;
                            navigator.clipboard.writeText(info);
                          }}
                        >
                          📋 Copy Info
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchStatus === 'complete' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                  <Icon name="Search" size={28} className="text-gray-500" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  No Farming Data Found
                </h4>
                <p className="text-gray-600 mb-4">
                  Could not find farming data for "{selectedMaterial.name}"
                </p>
                <div className="text-sm text-gray-500">
                  <p>Check browser console for detailed matching information</p>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          /* No material selected */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shadow-2xl">
              <Icon name="Package" size={40} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Select a Material to Farm
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {mergedMaterials.length > 0 
                ? `Choose from ${materialsWithDeficit.length} materials with combined deficits.`
                : 'No materials available from inventory.'}
            </p>
            {mergedMaterials.length > 0 && materialsWithDeficit.length < mergedMaterials.length && (
              <p className="text-sm text-gray-500 mt-3">
                {mergedMaterials.length - materialsWithDeficit.length} materials have no deficit
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmingOptimizer;