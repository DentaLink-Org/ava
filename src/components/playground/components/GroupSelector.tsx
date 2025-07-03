/**
 * Group Selector Component
 * Multi-select component for filtering playground component groups
 */

import React, { useState, useEffect } from 'react';
import { GroupSelectorProps } from '../types';

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  defaultSelected = [],
  onSelectionChange,
  componentId,
  pageId
}) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);

  // Component group definitions
  const groupDefinitions = {
    headers: { name: "Headers & Welcome", color: "#3B82F6", icon: "🏠" },
    navigation: { name: "Navigation & Links", color: "#10B981", icon: "🧭" },
    data: { name: "Data Display", color: "#8B5CF6", icon: "📊" },
    interactive: { name: "Interactive Components", color: "#F59E0B", icon: "🎮" }
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedGroups);
    }
  }, [selectedGroups, onSelectionChange]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const selectAll = () => {
    setSelectedGroups(groups);
  };

  const clearAll = () => {
    setSelectedGroups([]);
  };

  return (
    <div className="group-selector compact" data-component-id={componentId}>
      <div className="group-selector-header">
        <h3 className="selector-title">Filter Components</h3>
      </div>
      
      <div className="group-selector-controls">
        <div className="group-toggle-container">
          {groups.map(groupId => {
            const groupDef = groupDefinitions[groupId as keyof typeof groupDefinitions];
            const isSelected = selectedGroups.includes(groupId);
            
            return (
              <button
                key={groupId}
                className={`group-toggle ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleGroup(groupId)}
                style={{ 
                  '--group-color': groupDef?.color || '#6B7280',
                  borderColor: isSelected ? groupDef?.color : '#E5E7EB'
                } as React.CSSProperties}
                title={groupDef?.name || groupId}
              >
                <span className="group-icon">{groupDef?.icon || '📦'}</span>
                <span className="group-name">{groupDef?.name || groupId}</span>
                <span className={`group-indicator ${isSelected ? 'active' : ''}`}>
                  {isSelected ? '✓' : '○'}
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={selectAll}
            disabled={selectedGroups.length === groups.length}
            title="Select All"
          >
            All
          </button>
          <button 
            className="quick-action-btn"
            onClick={clearAll}
            disabled={selectedGroups.length === 0}
            title="Clear All"
          >
            None
          </button>
        </div>
      </div>
    </div>
  );
};