import React, { useState } from 'react';
import Icon from './AppIcon';
import Input from './Input';
import { Checkbox } from './Checkbox';

const AdvancedOptions = ({ options, onOptionsChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="advanced-options-content"
      >
        <div className="flex items-center gap-3">
          <Icon name="Settings" size={20} className="text-muted-foreground" />
          <span className="font-medium text-foreground">Advanced Options</span>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground"
        />
      </button>
      {isExpanded && (
        <div id="advanced-options-content" className="p-6 border-t border-border space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Event Bonus (%)"
              type="number"
              min="0"
              max="200"
              value={options?.eventBonus}
              onChange={(e) => onOptionsChange('eventBonus', parseInt(e?.target?.value) || 0)}
              description="Additional drop rate during events"
            />
            <Input
              label="Drop Rate Modifier (%)"
              type="number"
              min="0"
              max="100"
              value={options?.dropRateModifier}
              onChange={(e) => onOptionsChange('dropRateModifier', parseInt(e?.target?.value) || 0)}
              description="Adjust expected drop rates"
            />
          </div>

          <div className="space-y-3">
            <Checkbox
              label="Include QP Costs"
              description="Calculate total QP required for leveling and skills"
              checked={options?.includeQP}
              onChange={(e) => onOptionsChange('includeQP', e?.target?.checked)}
            />
            <Checkbox
              label="Prioritize Event Materials"
              description="Recommend farming event quests when available"
              checked={options?.prioritizeEvents}
              onChange={(e) => onOptionsChange('prioritizeEvents', e?.target?.checked)}
            />
            <Checkbox
              label="Show AP Efficiency"
              description="Display AP per material calculations"
              checked={options?.showAPEfficiency}
              onChange={(e) => onOptionsChange('showAPEfficiency', e?.target?.checked)}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Calculation Notes</p>
                <p className="text-xs text-muted-foreground">
                  Drop rates are based on community data and may vary. Event bonuses apply multiplicatively to base drop rates. AP efficiency calculations assume natural AP regeneration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;