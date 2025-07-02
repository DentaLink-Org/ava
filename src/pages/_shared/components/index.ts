/**
 * Shared Components Export Index
 * Exports all reusable components for the page-centric architecture
 */

// Base components
export { Button } from './Button';
export { Card, CardHeader, CardContent, CardFooter } from './Card';
export { Grid } from './Grid';

// Navigation components
export { Navigation, Breadcrumb } from './Navigation';
export { PageWrapper, SimplePageLayout } from './PageWrapper';

// Error handling components
export { 
  ErrorBoundary, 
  PageErrorBoundary, 
  withErrorBoundary, 
  useErrorHandler,
  PageError,
  ConfigurationError,
  ComponentError
} from './ErrorBoundary';