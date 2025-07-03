/**
 * Register Page Manager Components
 * This file registers all page manager components with the component registry
 */

import React from 'react';
import { componentRegistry } from '../_shared/runtime/ComponentRegistry';

// Import components
import { PageHeader } from './components/PageHeader';
import { PageList } from './components/PageList';
import { PageActions } from './components/PageActions';
import { PageEditor } from './components/PageEditor';
import { PageManager } from './components/PageManager';

// Create wrapped components that match PageComponent interface
const PageHeaderWrapper: React.FC<any> = (props) => {
  const { title = 'Page Manager', ...rest } = props;
  return <PageHeader title={title} {...rest} />;
};

const PageListWrapper: React.FC<any> = (props) => <PageList {...props} />;
const PageActionsWrapper: React.FC<any> = (props) => <PageActions {...props} />;
const PageEditorWrapper: React.FC<any> = (props) => <PageEditor {...props} />;
const PageManagerWrapper: React.FC<any> = (props) => <PageManager {...props} />;

// Register components for page-manager page
componentRegistry.register('page-manager', 'PageHeader', PageHeaderWrapper);
componentRegistry.register('page-manager', 'PageList', PageListWrapper);
componentRegistry.register('page-manager', 'PageActions', PageActionsWrapper);
componentRegistry.register('page-manager', 'PageEditor', PageEditorWrapper);
componentRegistry.register('page-manager', 'PageManager', PageManagerWrapper);

console.log('Page Manager components registered successfully');