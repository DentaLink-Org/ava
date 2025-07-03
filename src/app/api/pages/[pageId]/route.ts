/**
 * Individual Page API Routes
 * Handles operations for specific pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { configParser } from '../../../../components/_shared/runtime/ConfigParser';
import { routeRegistry } from '../../../../components/_shared/runtime/RouteRegistry';

const PAGES_DIR = path.join(process.cwd(), 'src/components');

// GET /api/pages/[pageId] - Get page details
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    const route = routeRegistry.getRoute(pageId);
    
    if (!route) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Failed to get page:', error);
    return NextResponse.json(
      { error: 'Failed to get page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[pageId] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    const body = await request.json();
    const { title, route: routePath, description, category, visible, order, config } = body;

    const route = routeRegistry.getRoute(pageId);
    if (!route) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Update route metadata if provided
    if (title || routePath || description || category !== undefined || visible !== undefined || order !== undefined) {
      routeRegistry.updateRouteMetadata(pageId, {
        title,
        path: routePath,
        description,
        category,
        visible,
        order
      });
    }

    // Update configuration file if config provided
    if (config) {
      const pageDir = path.join(PAGES_DIR, pageId);
      const configPath = path.join(pageDir, 'config.yaml');
      
      // Update the config with new metadata
      const updatedConfig = {
        ...config,
        page: {
          ...config.page,
          title: title || config.page?.title,
          route: routePath || config.page?.route,
          description: description || config.page?.description
        },
        meta: {
          ...config.meta,
          lastModified: new Date().toISOString()
        }
      };

      await configParser.writeConfig(configPath, updatedConfig);
    }

    return NextResponse.json({
      success: true,
      message: `Page '${pageId}' updated successfully`
    });

  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[pageId] - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;

    // Don't allow deletion of core pages
    const corePages = ['dashboard', 'databases', 'tasks', 'themes'];
    if (corePages.includes(pageId)) {
      return NextResponse.json(
        { error: `Cannot delete core page '${pageId}'` },
        { status: 403 }
      );
    }

    const route = routeRegistry.getRoute(pageId);
    if (!route) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Remove page directory
    const pageDir = path.join(PAGES_DIR, pageId);
    try {
      await fs.rm(pageDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to remove page directory:', error);
      // Continue with route removal even if directory removal fails
    }

    // Unregister route
    routeRegistry.unregisterRoute(pageId);

    return NextResponse.json({
      success: true,
      message: `Page '${pageId}' deleted successfully`
    });

  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}