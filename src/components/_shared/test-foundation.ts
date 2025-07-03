/**
 * Basic test to verify the foundation components are working
 * This is a simple validation that the core architecture is functional
 */

import React from 'react';
import { 
  configParser, 
  componentRegistry, 
  defaultTheme 
} from './runtime';

// Test configuration object - using any for now to avoid type issues
const testConfig: any = {
  page: {
    title: "Test Page",
    route: "/test",
    description: "Test page for foundation validation"
  },
  layout: {
    type: "grid",
    columns: 12,
    gap: 4,
    padding: 6
  },
  theme: {
    colors: {
      primary: "#f97316",
      background: "#f3f4f6",
      text: "#111827"
    },
    spacing: {
      base: 4,
      small: 2,
      large: 8
    }
  },
  components: [
    {
      id: "test-header",
      type: "Header",
      position: { col: 1, row: 1, span: 12 },
      props: { title: "Test Header" }
    },
    {
      id: "test-card",
      type: "Card",
      position: { col: 1, row: 2, span: 6 },
      props: { content: "Test card content" }
    }
  ]
};

// Simple test component
const TestComponent = ({ title, theme }: any) => {
  return React.createElement('div', { 
    style: { color: theme.colors.text } 
  }, title);
};

/**
 * Run foundation tests
 */
export async function testFoundation(): Promise<boolean> {
  try {
    console.log('🧪 Testing foundation components...');

    // Test 1: Configuration validation
    console.log('Testing configuration validation...');
    const validation = configParser.validate(testConfig);
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }
    console.log('✅ Configuration validation passed');

    // Test 2: Component registry
    console.log('Testing component registry...');
    componentRegistry.register('test-page', 'TestComponent', TestComponent);
    const retrievedComponent = componentRegistry.get('test-page', 'TestComponent');
    if (!retrievedComponent) {
      throw new Error('Component registration/retrieval failed');
    }
    console.log('✅ Component registry working');

    // Test 3: Configuration parsing and serialization
    console.log('Testing configuration serialization...');
    const serialized = configParser.serialize(testConfig);
    const parsed = configParser.parseConfigString(serialized);
    if (parsed.page.title !== testConfig.page.title) {
      throw new Error('Configuration serialization/parsing failed');
    }
    console.log('✅ Configuration serialization working');

    // Test 4: Default theme validation
    console.log('Testing default theme...');
    const themeValidation = configParser.validate({ 
      ...testConfig, 
      theme: defaultTheme 
    });
    if (!themeValidation.valid) {
      throw new Error('Default theme validation failed');
    }
    console.log('✅ Default theme working');

    // Test 5: Component positioning validation
    console.log('Testing component positioning...');
    const overlappingComponents = [
      {
        id: "comp1",
        type: "Test",
        position: { col: 1, row: 1, span: 2 },
        props: {}
      },
      {
        id: "comp2", 
        type: "Test",
        position: { col: 2, row: 1, span: 2 },
        props: {}
      }
    ];
    const positionValidation = configParser.validate({
      ...testConfig,
      components: overlappingComponents
    });
    if (positionValidation.valid) {
      throw new Error('Position validation should have caught overlapping components');
    }
    console.log('✅ Component positioning validation working');

    console.log('🎉 All foundation tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Foundation test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testFoundation().then(success => {
    process.exit(success ? 0 : 1);
  });
}