/**
 * Pages API Routes
 * Handles CRUD operations for dashboard pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { configParser } from "@/components/_shared/runtime/ConfigParser";
import { routeRegistry } from "@/components/_shared/runtime/RouteRegistry";

const PAGES_DIR = path.join(process.cwd(), 'src/components');

// GET /api/pages - List all pages
export async function GET() {
  try {
    const routes = routeRegistry.getAllRoutes();
    const pages = routes.map(route => ({
      id: route.id,
      title: route.metadata.title,
      route: route.metadata.path,
      description: route.metadata.description,
      icon: route.metadata.icon,
      order: route.metadata.order,
      visible: route.metadata.visible,
      category: route.metadata.category,
      status: route.isValid ? 'active' : 'disabled',
      lastModified: route.lastValidated?.toISOString() || new Date().toISOString(),
      configPath: route.configPath,
      componentPath: route.componentPath
    }));

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Failed to list pages:', error);
    return NextResponse.json(
      { error: 'Failed to list pages' },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, route: routePath, description, category, visible, order, template } = body;

    // Validate required fields
    if (!id || !title || !routePath) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title, route' },
        { status: 400 }
      );
    }

    // Check if page already exists
    if (routeRegistry.getRoute(id)) {
      return NextResponse.json(
        { error: `Page with ID '${id}' already exists` },
        { status: 409 }
      );
    }

    // Create page directory structure
    const pageDir = path.join(PAGES_DIR, id);
    
    try {
      await fs.mkdir(pageDir, { recursive: true });
      await fs.mkdir(path.join(pageDir, 'components'));
      await fs.mkdir(path.join(pageDir, 'hooks'));
      await fs.mkdir(path.join(pageDir, 'api'));
      await fs.mkdir(path.join(pageDir, 'scripts'));
    } catch (error) {
      console.error('Failed to create page directories:', error);
      return NextResponse.json(
        { error: 'Failed to create page directory structure' },
        { status: 500 }
      );
    }

    // Create default configuration
    const defaultConfig = {
      page: {
        title,
        route: routePath,
        description
      },
      layout: {
        type: 'grid' as const,
        columns: 12,
        gap: 4,
        padding: 6
      },
      components: [
        {
          id: 'page-header',
          type: 'PageHeader',
          position: {
            col: 1,
            row: 1,
            span: 12
          },
          props: {
            title,
            subtitle: description || 'Welcome to your new page'
          }
        }
      ],
      navigation: {
        showSidebar: true,
        customHeader: false,
        breadcrumbs: true
      },
      meta: {
        author: 'Dashboard User',
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        tags: [category || 'custom']
      }
    };

    // Write configuration file
    const configPath = path.join(pageDir, 'config.yaml');
    await configParser.writeConfig(configPath, defaultConfig);

    // Create component index files
    await fs.writeFile(
      path.join(pageDir, 'components/index.ts'),
      '// Page components will be exported here\n'
    );
    
    await fs.writeFile(
      path.join(pageDir, 'hooks/index.ts'),
      '// Page hooks will be exported here\n'
    );
    
    await fs.writeFile(
      path.join(pageDir, 'api/index.ts'),
      '// Page API functions will be exported here\n'
    );

    // Create basic types file
    await fs.writeFile(
      path.join(pageDir, 'types.ts'),
      `/**\n * Types for ${title} page\n */\n\nexport interface ${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, '')}PageProps {\n  // Define page-specific types here\n}\n`
    );

    // Create component registration file
    await fs.writeFile(
      path.join(pageDir, 'register-components.ts'),
      `/**\n * Register ${title} Components\n */\n\nimport { componentRegistry } from '../_shared/runtime/ComponentRegistry';\n\n// Import and register components here\n// Example:\n// import { MyComponent } from './components/MyComponent';\n// componentRegistry.register('${id}', 'MyComponent', MyComponent);\n\nconsole.log('${title} components registered successfully');\n`
    );

    // Create basic styles file
    await fs.writeFile(
      path.join(pageDir, 'styles.css'),
      `/**\n * ${title} Page Styles\n */\n\n.${id}-page {\n  /* Page-specific styles */\n}\n`
    );

    // Register route
    routeRegistry.registerRoute({
      id,
      path: routePath,
      title,
      description,
      category: category || 'custom',
      visible: visible ?? true,
      order: order || 999
    });

    return NextResponse.json({
      success: true,
      pageId: id,
      message: `Page '${title}' created successfully`
    });

  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}