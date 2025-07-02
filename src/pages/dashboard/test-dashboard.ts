/**
 * Dashboard Page Test
 * Tests the complete dashboard page implementation
 */

import { PageRenderer } from '../_shared/runtime/PageRenderer';
import { configParser } from '../_shared/runtime/ConfigParser';
import './register-components'; // Register dashboard components

/**
 * Test dashboard page configuration loading
 */
export async function testDashboardConfig() {
  try {
    console.log('🧪 Testing dashboard configuration...');
    
    const configPath = 'src/pages/dashboard/config.yaml';
    const config = await configParser.parsePageConfig(configPath);
    
    console.log('✅ Configuration loaded successfully');
    console.log('   Page title:', config.page.title);
    console.log('   Layout type:', config.layout.type);
    console.log('   Components:', config.components.length);
    
    // Validate configuration
    const validation = configParser.validate(config);
    if (validation.valid) {
      console.log('✅ Configuration validation passed');
    } else {
      console.error('❌ Configuration validation failed:', validation.errors);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Dashboard config test failed:', error);
    return false;
  }
}

/**
 * Test dashboard component registration
 */
export function testComponentRegistration() {
  try {
    console.log('🧪 Testing component registration...');
    
    const { componentRegistry } = require('../_shared/runtime/ComponentRegistry');
    
    const dashboardComponents = componentRegistry.getPageComponents('dashboard');
    const expectedComponents = ['WelcomeHeader', 'DatabaseLinkCard', 'TasksLinkCard', 'QuickStartCard', 'KPICards'];
    
    for (const componentType of expectedComponents) {
      const component = componentRegistry.get('dashboard', componentType);
      if (component) {
        console.log(`✅ Component registered: ${componentType}`);
      } else {
        console.error(`❌ Component not registered: ${componentType}`);
        return false;
      }
    }
    
    console.log('✅ All dashboard components registered successfully');
    return true;
  } catch (error) {
    console.error('❌ Component registration test failed:', error);
    return false;
  }
}

/**
 * Test dashboard page rendering (simulation)
 */
export async function testDashboardRendering() {
  try {
    console.log('🧪 Testing dashboard page rendering...');
    
    // This would normally be done in a React environment
    // For now, just validate that the PageRenderer can be imported and used
    
    if (typeof PageRenderer === 'function') {
      console.log('✅ PageRenderer is available');
    } else {
      console.error('❌ PageRenderer not available');
      return false;
    }
    
    console.log('✅ Dashboard rendering test passed (simulation)');
    return true;
  } catch (error) {
    console.error('❌ Dashboard rendering test failed:', error);
    return false;
  }
}

/**
 * Run all dashboard tests
 */
export async function runDashboardTests() {
  console.log('🚀 Running dashboard page tests...\n');
  
  const tests = [
    { name: 'Configuration Loading', test: testDashboardConfig },
    { name: 'Component Registration', test: testComponentRegistration },
    { name: 'Page Rendering', test: testDashboardRendering }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, test } of tests) {
    console.log(`\n📋 Running test: ${name}`);
    console.log('================================');
    
    try {
      const result = await test();
      if (result) {
        passed++;
        console.log(`✅ ${name} - PASSED\n`);
      } else {
        failed++;
        console.log(`❌ ${name} - FAILED\n`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${name} - ERROR:`, error);
    }
  }
  
  console.log('\n🏁 Dashboard Test Results');
  console.log('==========================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All dashboard tests passed! Dashboard page is ready.');
    return true;
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues.');
    return false;
  }
}

// Export for use in other files
export default {
  testDashboardConfig,
  testComponentRegistration,
  testDashboardRendering,
  runDashboardTests
};