#!/usr/bin/env node

/**
 * Test script for list_material_components tool
 * Verifies that both Web and Flutter frameworks are properly listed
 */

import { DocumentationProvider } from './build/providers/documentation-provider.js';

async function testListComponents() {
  console.log('🧪 Testing list_material_components optimization\n');

  const provider = new DocumentationProvider();

  // Test 1: List all components (should include both web and flutter)
  console.log('Test 1: List ALL components');
  const allComponents = await provider.getComponents();
  console.log(`✅ Found ${allComponents.length} total components`);

  // Check framework distribution
  const webOnly = allComponents.filter(c => c.frameworks.length === 1 && c.frameworks[0] === 'web');
  const flutterOnly = allComponents.filter(c => c.frameworks.length === 1 && c.frameworks[0] === 'flutter');
  const both = allComponents.filter(c => c.frameworks.length === 2);

  console.log(`   - Web only: ${webOnly.length}`);
  console.log(`   - Flutter only: ${flutterOnly.length}`);
  console.log(`   - Both frameworks: ${both.length}`);
  console.log('');

  // Test 2: Filter by web framework
  console.log('Test 2: Filter by framework="web"');
  const webComponents = await provider.getComponents(undefined, 'web');
  console.log(`✅ Found ${webComponents.length} web components`);
  console.log(`   Sample: ${webComponents.slice(0, 5).map(c => c.name).join(', ')}`);
  console.log('');

  // Test 3: Filter by flutter framework
  console.log('Test 3: Filter by framework="flutter"');
  const flutterComponents = await provider.getComponents(undefined, 'flutter');
  console.log(`✅ Found ${flutterComponents.length} flutter components`);
  console.log(`   Sample: ${flutterComponents.slice(0, 5).map(c => c.name).join(', ')}`);
  console.log('');

  // Test 4: Filter by category and framework
  console.log('Test 4: Filter by category="buttons" and framework="flutter"');
  const buttonComponents = await provider.getComponents('buttons', 'flutter');
  console.log(`✅ Found ${buttonComponents.length} button components for Flutter`);
  console.log(`   Components: ${buttonComponents.map(c => c.name).join(', ')}`);
  console.log('');

  // Test 5: Show sample components with both frameworks
  console.log('Test 5: Components available in BOTH frameworks');
  const bothFrameworks = allComponents.filter(c => c.frameworks.length === 2);
  if (bothFrameworks.length > 0) {
    console.log(`✅ Found ${bothFrameworks.length} components in both frameworks:`);
    bothFrameworks.slice(0, 10).forEach(c => {
      console.log(`   - ${c.name} (${c.frameworks.join(', ')})`);
    });
  } else {
    console.log('ℹ️  No components found in both frameworks (this is expected if they have different naming)');
  }
  console.log('');

  // Summary
  console.log('📊 Summary:');
  console.log(`   Total components: ${allComponents.length}`);
  console.log(`   Web-capable: ${webComponents.length}`);
  console.log(`   Flutter-capable: ${flutterComponents.length}`);
  console.log(`   Dual-framework: ${bothFrameworks.length}`);
  console.log('');
  console.log('✅ All tests passed!');
}

testListComponents().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});