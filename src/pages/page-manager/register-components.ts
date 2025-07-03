/**
 * Register Page Manager Components
 * This file registers all page manager components with the component registry
 */

import { componentRegistry } from '../_shared/runtime/ComponentRegistry';

// Import components
import { PageHeader } from './components/PageHeader';
import { PageList } from './components/PageList';
import { PageActions } from './components/PageActions';
import { PageEditor } from './components/PageEditor';
import { PageManager } from './components/PageManager';

// Create wrapped components that match PageComponent interface
const PageHeaderWrapper = (props: any) => {
  const { title = 'Page Manager', ...rest } = props;
  return PageHeader({ title, ...rest });
};

const PageListWrapper = (props: any) => PageList(props);
const PageActionsWrapper = (props: any) => PageActions(props);
const PageEditorWrapper = (props: any) => PageEditor(props);
const PageManagerWrapper = (props: any) => PageManager(props);

// Register components for page-manager page
componentRegistry.register('page-manager', 'PageHeader', PageHeaderWrapper);
componentRegistry.register('page-manager', 'PageList', PageListWrapper);
componentRegistry.register('page-manager', 'PageActions', PageActionsWrapper);
componentRegistry.register('page-manager', 'PageEditor', PageEditorWrapper);
componentRegistry.register('page-manager', 'PageManager', PageManagerWrapper);

console.log('Page Manager components registered successfully');