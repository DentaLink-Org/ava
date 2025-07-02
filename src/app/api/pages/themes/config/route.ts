/**
 * Themes Page Configuration API
 * Returns the configuration for the themes page
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as yaml from 'yaml';

export async function GET(request: NextRequest) {
  try {
    // Read the themes page configuration
    const configPath = join(process.cwd(), 'src', 'pages', 'themes', 'config.yaml');
    const configContent = await readFile(configPath, 'utf-8');
    const config = yaml.parse(configContent);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading themes page config:', error);
    
    // Return a fallback configuration
    const fallbackConfig = {
      page: {
        title: "Theme Gallery",
        route: "/themes",
        description: "Browse and customize themes for your dashboard pages"
      },
      layout: {
        type: "flex",
        direction: "column",
        gap: 6,
        padding: 6
      },
      theme: {
        colors: {
          primary: "#6366f1",
          secondary: "#4f46e5",
          background: "#f8fafc",
          surface: "#ffffff",
          text: "#0f172a",
          textSecondary: "#64748b"
        },
        spacing: {
          base: 4,
          small: 2,
          large: 8
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
          lineHeight: 1.5
        }
      },
      components: [
        {
          id: "theme-gallery-header",
          type: "ThemeGalleryHeader",
          position: { order: 1 },
          props: {
            title: "Theme Gallery",
            subtitle: "Customize the appearance of your dashboard pages"
          }
        },
        {
          id: "page-theme-selector",
          type: "PageThemeSelector",
          position: { order: 2 },
          props: {
            pages: [
              {
                id: "dashboard",
                name: "Dashboard", 
                description: "Main admin dashboard"
              },
              {
                id: "databases",
                name: "Databases",
                description: "Database management"
              },
              {
                id: "tasks", 
                name: "Tasks",
                description: "Task management"
              }
            ]
          }
        },
        {
          id: "theme-grid",
          type: "ThemeGrid",
          position: { order: 3 },
          props: {
            columns: 3,
            showPreview: true,
            enableQuickApply: true
          }
        }
      ],
      navigation: {
        showSidebar: true,
        customHeader: false,
        breadcrumbs: true
      },
      meta: {
        author: "Dashboard Theme Team",
        version: "1.0.0",
        lastModified: "2025-06-30",
        tags: ["themes", "customization", "appearance"]
      }
    };

    return NextResponse.json(fallbackConfig);
  }
}