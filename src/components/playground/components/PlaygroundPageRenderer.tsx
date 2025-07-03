/**
 * Playground-specific Page Renderer
 * Extends the base PageRenderer to support dynamic component filtering based on group selection
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageRenderer } from '../../_shared/runtime/PageRenderer';
import { PageConfig, ComponentConfig } from '../../_shared/runtime/types';

interface PlaygroundPageRendererProps {
  pageId: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const PlaygroundPageRenderer: React.FC<PlaygroundPageRendererProps> = ({
  pageId,
  onError,
  onLoad
}) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['headers', 'navigation', 'data', 'interactive']);
  const [originalConfig, setOriginalConfig] = useState<PageConfig | null>(null);
  const [filteredConfig, setFilteredConfig] = useState<PageConfig | null>(null);

  // Load the original configuration
  const loadOriginalConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}/config`);
      if (!response.ok) {
        throw new Error(`Failed to load configuration: ${response.statusText}`);
      }
      const config = await response.json();
      setOriginalConfig(config);
    } catch (error) {
      console.error('Failed to load playground config:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to load configuration'));
    }
  }, [pageId, onError]);

  // Load config on mount
  useEffect(() => {
    loadOriginalConfig();
  }, [loadOriginalConfig]);

  // Filter components based on selected groups
  useEffect(() => {
    if (!originalConfig) return;

    const filteredComponents = originalConfig.components.filter((component: ComponentConfig) => {
      // Always show the GroupSelector component
      if (component.type === 'GroupSelector') {
        return true;
      }
      
      // Filter other components based on their group
      const componentGroup = (component as any).group;
      if (!componentGroup) {
        // Components without a group are always shown
        return true;
      }
      
      return selectedGroups.includes(componentGroup);
    });

    // Create filtered config
    const newFilteredConfig: PageConfig = {
      ...originalConfig,
      components: filteredComponents
    };

    setFilteredConfig(newFilteredConfig);
  }, [originalConfig, selectedGroups]);

  // Handle group selection changes from the GroupSelector component
  const handleGroupSelectionChange = useCallback((groups: string[]) => {
    setSelectedGroups(groups);
  }, []);

  // Inject the group selection handler into the GroupSelector component
  const configWithHandler = useMemo(() => {
    if (!filteredConfig) return null;

    const configWithUpdatedGroupSelector = {
      ...filteredConfig,
      components: filteredConfig.components.map((component: ComponentConfig) => {
        if (component.type === 'GroupSelector') {
          return {
            ...component,
            props: {
              ...component.props,
              onSelectionChange: handleGroupSelectionChange,
              defaultSelected: selectedGroups
            }
          };
        }
        return component;
      })
    };

    return configWithUpdatedGroupSelector;
  }, [filteredConfig, handleGroupSelectionChange, selectedGroups]);

  // Show loading state until we have a config
  if (!configWithHandler) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        <div>Loading playground...</div>
      </div>
    );
  }

  return (
    <PageRenderer
      pageId={pageId}
      config={configWithHandler}
      onError={onError}
      onLoad={onLoad}
    />
  );
};