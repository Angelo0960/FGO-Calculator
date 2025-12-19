import { useState } from 'react';
import { FaArrowUp, FaMagic, FaCalculator, FaSync, FaChartLine, FaCrown, FaGem } from 'react-icons/fa';
import Icon from './AppIcon';

const Calculator = ({ servant, onReset, onCalculate }) => {
  const [currentAscension, setCurrentAscension] = useState(0);
  const [targetAscension, setTargetAscension] = useState(4);
  const [currentSkillLevels, setCurrentSkillLevels] = useState([1, 1, 1]);
  const [targetSkillLevels, setTargetSkillLevels] = useState([10, 10, 10]);
  const [activeTab, setActiveTab] = useState('ascension');

  const handleSkillLevelChange = (index, type, value) => {
    const val = parseInt(value) || 1;
    
    if (type === 'current') {
      const newLevels = [...currentSkillLevels];
      newLevels[index] = Math.min(Math.max(1, val), 10);
      setCurrentSkillLevels(newLevels);
    } else {
      const newTargets = [...targetSkillLevels];
      newTargets[index] = Math.min(Math.max(1, val), 10);
      setTargetSkillLevels(newTargets);
    }
  };

  const calculateCosts = () => {
    const ascensionCost = Math.abs(targetAscension - currentAscension) * 5;
    const skillCost = currentSkillLevels.reduce((total, current, index) => {
      return total + Math.abs(targetSkillLevels[index] - current) * 3;
    }, 0);
    const totalLevels = (targetAscension - currentAscension) + 
                       targetSkillLevels.reduce((a, b) => a + b, 0) - 
                       currentSkillLevels.reduce((a, b) => a + b, 0);
    
    return { 
      ascensionCost, 
      skillCost, 
      totalCost: ascensionCost + skillCost,
      totalLevels 
    };
  };

  const costs = calculateCosts();

  const handleCalculate = () => {
    if (onCalculate && servant) {
      onCalculate({
        currentAscension,
        targetAscension,
        currentSkillLevels,
        targetSkillLevels
      });
    }
  };

  const handleResetLevels = () => {
    setCurrentAscension(0);
    setTargetAscension(4);
    setCurrentSkillLevels([1, 1, 1]);
    setTargetSkillLevels([10, 10, 10]);
  };

  const skillNames = ['Skill 1', 'Skill 2', 'Skill 3'];

  const renderAscensionLevels = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const isCurrent = i === currentAscension;
      const isTarget = i === targetAscension;
      const isComplete = i <= currentAscension;
      const isPlanned = i <= targetAscension;
      
      return (
        <button
          key={i}
          onClick={() => setTargetAscension(i)}
          className={`relative group flex flex-col items-center ${isPlanned ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          disabled={!isPlanned}
        >
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center mb-2
            ${isCurrent ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400' : 
              isTarget ? 'bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-400' :
              isComplete ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600' :
              'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700'
            }
            transition-all duration-200
          `}>
            {isCurrent && <Icon name="Circle" size={24} className="text-white" />}
            {isTarget && !isCurrent && <Icon name="Target" size={24} className="text-white" />}
            {!isCurrent && !isTarget && <span className="text-lg font-bold text-gray-300">{i}</span>}
          </div>
          <span className="text-xs font-medium">
            {i === 0 ? 'Base' : `Asc ${i}`}
          </span>
          {isCurrent && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon name="Check" size={12} className="text-white" />
            </div>
          )}
        </button>
      );
    });
  };

  const renderSkillCard = (skill, index) => {
    const currentLevel = currentSkillLevels[index];
    const targetLevel = targetSkillLevels[index];
    const levelsNeeded = targetLevel - currentLevel;
    
    return (
      <div className="bg-card/50 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{skill}</h4>
              <p className="text-xs text-muted-foreground">{levelsNeeded} levels needed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm px-2 py-1 bg-muted rounded">
              {currentLevel} → {targetLevel}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Current Level</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={currentLevel}
                onChange={(e) => handleSkillLevelChange(index, 'current', e.target.value)}
                className="flex-1 h-2 bg-muted rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
              <span className="w-8 text-center font-semibold">{currentLevel}</span>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Level</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={targetLevel}
                onChange={(e) => handleSkillLevelChange(index, 'target', e.target.value)}
                className="flex-1 h-2 bg-muted rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
              />
              <span className="w-8 text-center font-semibold">{targetLevel}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/30 bg-card">
                {servant ? (
                  <img
                    src={servant.extraAssets?.faces?.ascension?.[1] || servant.extraAssets?.faces?.ascension?.[0]}
                    alt={servant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Icon name="User" size={32} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              {servant && (
                <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  {servant.rarity}★
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {servant ? servant.name : 'Select a Servant'}
              </h2>
              <p className="text-muted-foreground mb-3">
                {servant ? servant.className : 'Choose a servant to begin calculations'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetLevels}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Icon name="RotateCcw" size={16} />
                  Reset Levels
                </button>
                <button
                  onClick={onReset}
                  className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Icon name="Trash2" size={16} />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Icon name="Crown" size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ascension Cost</p>
              <p className="text-2xl font-bold text-blue-500">{costs.ascensionCost}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">QP Required</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Skill Cost</p>
              <p className="text-2xl font-bold text-purple-500">{costs.skillCost}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">QP Required</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg border border-amber-500/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Levels</p>
              <p className="text-2xl font-bold text-amber-500">{costs.totalLevels}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Levels to Upgrade</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg border border-green-500/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Icon name="Calculator" size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-green-500">{costs.totalCost}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">QP Required</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('ascension')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'ascension'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name="Crown" size={16} />
              Ascension
            </div>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'skills'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={16} />
              Skills
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'ascension' && (
        <div className="bg-card/50 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Crown" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Ascension Levels</h3>
              <p className="text-sm text-muted-foreground">Set current and target ascension levels</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">Current Ascension</h4>
                <span className="px-3 py-1 bg-muted rounded-lg font-semibold">{currentAscension}</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={currentAscension}
                onChange={(e) => setCurrentAscension(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Base</span>
                <span>Ascension 4</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">Target Ascension</h4>
                <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-lg font-semibold">{targetAscension}</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={targetAscension}
                onChange={(e) => setTargetAscension(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Base</span>
                <span>Ascension 4</span>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Ascension Progress</span>
                <span className="text-sm font-semibold text-primary">{targetAscension - currentAscension} to go</span>
              </div>
              <div className="flex justify-between items-center">
                {renderAscensionLevels()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="bg-card/50 rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Icon name="Zap" size={20} className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Skill Levels</h3>
                <p className="text-sm text-muted-foreground">Set current and target skill levels for each skill</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {skillNames.map((skill, index) => renderSkillCard(skill, index))}
            </div>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={!servant}
        className={`
          w-full py-4 rounded-xl font-bold transition-all duration-300
          flex items-center justify-center gap-3 shadow-lg
          ${servant
            ? 'bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:via-primary hover:to-primary/90 text-primary-foreground hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-muted cursor-not-allowed text-muted-foreground'
          }
        `}
      >
        <Icon name={servant ? "Calculator" : "UserX"} size={24} />
        <span className="text-lg">
          {servant ? 'Calculate Material Requirements' : 'Select a Servant First'}
        </span>
        {servant && <Icon name="ArrowRight" size={20} />}
      </button>
    </div>
  );
};

export default Calculator;