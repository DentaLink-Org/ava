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

// Register components for page-manager page
componentRegistry.register('page-manager', 'PageHeader', PageHeader);
componentRegistry.register('page-manager', 'PageList', PageList);
componentRegistry.register('page-manager', 'PageActions', PageActions);
componentRegistry.register('page-manager', 'PageEditor', PageEditor);
componentRegistry.register('page-manager', 'PageManager', PageManager);

console.log('Page Manager components registered successfully');