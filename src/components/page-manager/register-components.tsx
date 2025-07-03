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
const PageHeaderWrapper = (props: any): React.ReactElement => {
  const { title = 'Page Manager', ...rest } = props;
  return <PageHeader title={title} {...rest} />;
};

const PageListWrapper = (props: any): React.ReactElement => <PageList {...props} />;
const PageActionsWrapper = (props: any): React.ReactElement => <PageActions {...props} />;
const PageEditorWrapper = (props: any): React.ReactElement => <PageEditor {...props} />;
const PageManagerWrapper = (props: any): React.ReactElement => <PageManager {...props} />;

// Register components for page-manager page
componentRegistry.register('page-manager', 'PageHeader', PageHeaderWrapper);
componentRegistry.register('page-manager', 'PageList', PageListWrapper);
componentRegistry.register('page-manager', 'PageActions', PageActionsWrapper);
componentRegistry.register('page-manager', 'PageEditor', PageEditorWrapper);
componentRegistry.register('page-manager', 'PageManager', PageManagerWrapper);

console.log('Page Manager components registered successfully');