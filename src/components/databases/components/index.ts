/**
 * Database page components exports
 * This file provides clean exports for all database-specific components
 */

// Export all database components
export { DatabaseCard } from './DatabaseCard';
export { SchemaEditor } from './SchemaEditor';
export { ConnectionForm } from './ConnectionForm';
export { PageHeader } from './PageHeader';
export { DatabaseGrid } from './DatabaseGrid';
export { ConnectionStatus } from './ConnectionStatus';
export { DatabaseStats } from './DatabaseStats';
export { RecentActivity } from './RecentActivity';

// Export new real-time components
export { DatabaseManager } from './DatabaseManager';
export { DatabaseCreator } from './DatabaseCreator';
export { DatabaseEditor } from './DatabaseEditor';
export { DatabaseInfo } from './DatabaseInfo';
export { DataManager } from './DataManager';
export { FeaturesDatabase } from './FeaturesDatabase';
export { ComponentsDatabase } from './ComponentsDatabase';

// Export component types
export type { DatabaseCardProps } from './DatabaseCard';
export type { SchemaEditorProps } from './SchemaEditor';
export type { ConnectionFormProps, ConnectionConfig } from './ConnectionForm';
export type { PageHeaderProps } from './PageHeader';
export type { DatabaseGridProps } from './DatabaseGrid';
export type { ConnectionStatusProps } from './ConnectionStatus';
export type { DatabaseStatsProps } from './DatabaseStats';
export type { RecentActivityProps, Activity } from './RecentActivity';

// Export new component types
export type { DatabaseManagerProps } from './DatabaseManager';
export type { DatabaseCreatorProps } from './DatabaseCreator';
export type { DatabaseEditorProps } from './DatabaseEditor';
export type { DatabaseInfoProps } from './DatabaseInfo';
export type { DataManagerProps } from './DataManager';