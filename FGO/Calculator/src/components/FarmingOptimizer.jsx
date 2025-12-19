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
      <div className="bg-white rounded-xl border border-blue-100 p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-medium text-blue-900">
            Loading Optimizer...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100">
      {/* Header */}
      <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900 tracking-tight">Farming Optimizer</h2>
            <p className="text-blue-600 mt-2 font-medium">Select a material to find optimal farming spots</p>
          </div>
        </div>
      </div>

      {/* Materials Selection */}
      <div className="p-6">
        {materialsWithDeficit.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Icon name="Package" size={24} className="text-blue-500" />
            </div>
            <p className="text-blue-700 mb-4">No materials found with deficit.</p>
            <Button
              variant="default"
              className="bg-blue-500 hover:bg-blue-600 text-white border-0"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materialsWithDeficit.map(material => (
                <button
                  key={material.id || material.name}
                  onClick={() => handleSelectMaterial(material)}
                  disabled={searchStatus === 'searching'}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    selectedMaterial?.name?.toLowerCase() === material.name?.toLowerCase()
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 ring-opacity-20'
                      : 'border-blue-100 hover:border-blue-300 hover:bg-blue-50'
                  } ${searchStatus === 'searching' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-blue-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={getItemImage(material)}
                        alt={material.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://static.atlasacademy.io/NA/Items/99.png';
                        }}
                      />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-blue-900 truncate">{material.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-blue-700">
                          Need <span className="font-bold text-blue-900 text-base">{material.deficit?.toLocaleString() || 0}</span>
                        </span>
                        <span className="text-xs text-blue-500 font-medium">
                          {material.originalIds?.length > 1 ? `${material.originalIds.length} sources` : 'Select'}
                        </span>
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
        <div className="px-6 py-4 border-t border-blue-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-blue-700 font-medium">
              Searching for "{selectedMaterial?.name}"...
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-6">
        {selectedMaterial ? (
          <>
            {/* Selected Material Header */}
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-white border-2 border-blue-300 overflow-hidden flex-shrink-0">
                  <img 
                    src={getItemImage(selectedMaterial)}
                    alt={selectedMaterial.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://static.atlasacademy.io/NA/Items/99.png';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-900">
                        Farming {selectedMaterial.name}
                      </h3>
                      {selectedMaterial.originalIds?.length > 1 && (
                        <p className="text-sm text-blue-600 mt-1 font-medium">
                          Combined from {selectedMaterial.originalIds.length} requirements
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-700">
                        {selectedMaterial.deficit?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Total needed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Farming Spots */}
            {searchStatus === 'searching' ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500 mb-5"></div>
                <h4 className="text-xl font-medium text-blue-900 mb-2">
                  Finding Optimal Spots
                </h4>
                <p className="text-blue-600">
                  Analyzing farming data for {selectedMaterial.name}...
                </p>
              </div>
            ) : farmingSpots.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-blue-900 text-lg">
                    Optimal Farming Spots
                  </h4>
                  <div className="text-sm text-blue-600">
                    Ranked by efficiency • {farmingSpots[0]?.runs?.toLocaleString() || 0} total samples
                  </div>
                </div>
                
                {farmingSpots.map((spot, index) => (
                  <div key={spot.id} className="bg-white rounded-xl border border-blue-200 overflow-hidden">
                    {/* Spot Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                            Rank #{spot.rank}
                          </div>
                          <div>
                            <h5 className="font-semibold text-blue-900">{spot.area}</h5>
                            <p className="text-sm text-blue-700 truncate">{spot.quest}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-700">AP: {spot.apCost}</div>
                          <div className="text-xs text-blue-600 font-medium">
                            {spot.runs?.toLocaleString() || 0} runs sampled
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">Drop Rate</div>
                          <div className="text-xl font-bold text-blue-900">
                            {spot.dropRate?.toFixed(1) || 0}%
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">AP per Drop</div>
                          <div className="text-xl font-bold text-blue-900">
                            {spot.apPerDrop?.toFixed(1) || 0}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">Runs for 1</div>
                          <div className="text-xl font-bold text-blue-900">
                            {spot.dropRate > 0 ? Math.ceil(100 / spot.dropRate) : '∞'}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">Total Runs</div>
                          <div className="text-xl font-bold text-blue-900">
                            {spot.dropRate > 0 ? Math.ceil((100 / spot.dropRate) * selectedMaterial.deficit) : '∞'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchStatus === 'complete' ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-5 bg-blue-50 rounded-full flex items-center justify-center">
                  <Icon name="Search" size={24} className="text-blue-500" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  No Data Found
                </h4>
                <p className="text-blue-600">
                  No farming data available for "{selectedMaterial.name}"
                </p>
              </div>
            ) : null}
          </>
        ) : (
          /* No material selected - Initial State */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <Icon name="Package" size={32} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-medium text-blue-900 mb-3">
              Select a Material
            </h3>
            <p className="text-blue-600 max-w-md mx-auto">
              {mergedMaterials.length > 0 
                ? `Choose from ${materialsWithDeficit.length} materials with deficit to find optimal farming spots.`
                : 'Materials will appear here once you have inventory deficit.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmingOptimizer;