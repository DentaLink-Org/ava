/**
 * JSON Schema validation for page configuration
 * Ensures page configs conform to the expected structure and data types
 */

export const pageConfigSchema = {
  type: "object",
  properties: {
    page: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1 },
        route: { type: "string", pattern: "^/.*" },
        description: { type: "string" }
      },
      required: ["title", "route"],
      additionalProperties: false
    },
    layout: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["grid", "flex", "custom"] },
        columns: { type: "number", minimum: 1, maximum: 24 },
        rows: { type: "number", minimum: 1 },
        gap: { type: "number", minimum: 0 },
        padding: { type: "number", minimum: 0 }
      },
      required: ["type", "gap", "padding"],
      additionalProperties: false
    },
    theme: {
      type: "object",
      properties: {
        colors: {
          type: "object",
          properties: {
            primary: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
            secondary: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
            background: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
            surface: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
            text: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
            textSecondary: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" }
          },
          required: ["primary", "background", "text"],
          additionalProperties: false
        },
        spacing: {
          type: "object",
          properties: {
            base: { type: "number", minimum: 0 },
            small: { type: "number", minimum: 0 },
            large: { type: "number", minimum: 0 }
          },
          required: ["base"],
          additionalProperties: false
        },
        typography: {
          type: "object",
          properties: {
            fontFamily: { type: "string" },
            fontSize: { type: "string" },
            lineHeight: { type: "number", minimum: 0 }
          },
          additionalProperties: false
        }
      },
      required: ["colors", "spacing"],
      additionalProperties: false
    },
    components: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", minLength: 1 },
          type: { type: "string", minLength: 1 },
          position: {
            type: "object",
            properties: {
              col: { type: "number", minimum: 1 },
              row: { type: "number", minimum: 1 },
              span: { type: "number", minimum: 1 },
              rowSpan: { type: "number", minimum: 1 }
            },
            required: ["col", "row", "span"],
            additionalProperties: false
          },
          props: {
            type: "object",
            additionalProperties: true
          },
          style: {
            type: "object",
            additionalProperties: true
          },
          className: { type: "string" }
        },
        required: ["id", "type", "position", "props"],
        additionalProperties: false
      }
    },
    data: {
      type: "object",
      properties: {
        sources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", minLength: 1 },
              type: { type: "string", enum: ["supabase", "api", "static", "internal"] },
              query: { type: "string" },
              endpoint: { type: "string" },
              method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"] },
              refresh: { type: "string", pattern: "^\\d+(s|m|h)$" },
              transform: { type: "string" }
            },
            required: ["name", "type"],
            additionalProperties: false
          }
        }
      },
      required: ["sources"],
      additionalProperties: false
    },
    navigation: {
      type: "object",
      properties: {
        showSidebar: { type: "boolean" },
        customHeader: { type: "boolean" },
        breadcrumbs: { type: "boolean" }
      },
      additionalProperties: false
    },
    scripts: {
      type: "object",
      properties: {
        onLoad: {
          type: "array",
          items: { type: "string" }
        },
        onUnload: {
          type: "array",
          items: { type: "string" }
        }
      },
      additionalProperties: false
    },
    meta: {
      type: "object",
      properties: {
        author: { type: "string" },
        version: { type: "string" },
        lastModified: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        }
      },
      additionalProperties: false
    }
  },
  required: ["page", "layout", "components"],
  additionalProperties: false
};

// Custom validation rules for component positioning
export const validateComponentPositioning = (components: any[]): string[] => {
  const errors: string[] = [];
  const positions = new Map<string, Set<number>>();

  components.forEach((component, index) => {
    const { position } = component;
    const { col, row, span, rowSpan = 1 } = position;

    // Check for overlapping positions
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + span; c++) {
        const key = `${r}`;
        if (!positions.has(key)) {
          positions.set(key, new Set());
        }
        const rowPositions = positions.get(key)!;
        if (rowPositions.has(c)) {
          errors.push(`Component ${component.id} at index ${index} overlaps with another component at position (${r}, ${c})`);
        }
        rowPositions.add(c);
      }
    }

    // Check for out-of-bounds positions (assuming default 12-column grid)
    if (col + span > 13) {
      errors.push(`Component ${component.id} at index ${index} extends beyond grid boundaries (col: ${col}, span: ${span})`);
    }
  });

  return errors;
};

// Theme color validation
export const validateThemeColors = (colors: any): string[] => {
  const errors: string[] = [];
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;

  const requiredColors = ['primary', 'background', 'text'];
  const optionalColors = ['secondary', 'surface', 'textSecondary'];
  
  requiredColors.forEach(color => {
    if (!colors[color]) {
      errors.push(`Required theme color '${color}' is missing`);
    } else if (!hexPattern.test(colors[color])) {
      errors.push(`Theme color '${color}' must be a valid hex color (e.g., #FF0000)`);
    }
  });

  optionalColors.forEach(color => {
    if (colors[color] && !hexPattern.test(colors[color])) {
      errors.push(`Theme color '${color}' must be a valid hex color (e.g., #FF0000)`);
    }
  });

  return errors;
};

// Data source validation
export const validateDataSources = (sources: any[]): string[] => {
  const errors: string[] = [];
  const names = new Set<string>();

  sources.forEach((source, index) => {
    // Check for duplicate names
    if (names.has(source.name)) {
      errors.push(`Duplicate data source name '${source.name}' at index ${index}`);
    }
    names.add(source.name);

    // Type-specific validation
    switch (source.type) {
      case 'supabase':
        if (!source.query) {
          errors.push(`Supabase data source '${source.name}' requires a query`);
        }
        break;
      case 'api':
        if (!source.endpoint) {
          errors.push(`API data source '${source.name}' requires an endpoint`);
        }
        break;
      case 'static':
        // Static sources don't require additional fields
        break;
      case 'internal':
        // Internal sources for system data
        break;
    }

    // Validate refresh interval format
    if (source.refresh && !/^\\d+(s|m|h)$/.test(source.refresh)) {
      errors.push(`Data source '${source.name}' has invalid refresh interval format. Use format like '30s', '5m', '1h'`);
    }
  });

  return errors;
};