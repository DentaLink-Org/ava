/**
 * Page Configuration API Routes
 * Handles page configuration CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { configParser } from '../../../../../pages/_shared/runtime/ConfigParser';
import { routeRegistry } from '../../../../../pages/_shared/runtime/RouteRegistry';

const PAGES_DIR = path.join(process.cwd(), 'src/pages');

// GET /api/pages/[pageId]/config - Get page configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    
    // Validate page exists
    const route = routeRegistry.getRoute(pageId);
    if (!route) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Load configuration
    const configPath = path.join(PAGES_DIR, pageId, 'config.yaml');
    
    try {
      const config = await configParser.parsePageConfig(configPath);
      return NextResponse.json(config);
    } catch (configError) {
      console.error(`Failed to load config for ${pageId}:`, configError);
      return NextResponse.json(
        { error: 'Failed to load page configuration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to get page config:', error);
    return NextResponse.json(
      { error: 'Failed to get page configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[pageId]/config - Update page configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    const body = await request.json();
    const { config } = body;

    // Validate page exists
    const route = routeRegistry.getRoute(pageId);
    if (!route) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration is required' },
        { status: 400 }
      );
    }

    // Validate configuration
    const validation = configParser.validate(config);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      );
    }

    // Update configuration file
    const configPath = path.join(PAGES_DIR, pageId, 'config.yaml');
    
    // Ensure meta.lastModified is updated
    const updatedConfig = {
      ...config,
      meta: {
        ...config.meta,
        lastModified: new Date().toISOString()
      }
    };

    await configParser.writeConfig(configPath, updatedConfig);

    // Update route metadata if page info changed
    if (config.page) {
      routeRegistry.updateRouteMetadata(pageId, {
        title: config.page.title,
        path: config.page.route,
        description: config.page.description
      });
    }

    return NextResponse.json({
      success: true,
      message: `Configuration for page '${pageId}' updated successfully`
    });

  } catch (error) {
    console.error('Failed to update page config:', error);
    return NextResponse.json(
      { error: 'Failed to update page configuration' },
      { status: 500 }
    );
  }
}