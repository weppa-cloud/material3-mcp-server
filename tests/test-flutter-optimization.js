#!/usr/bin/env node

/**
 * Comprehensive test for Flutter optimization across all MCP tools
 */

import { listMaterialComponents } from './build/tools/listMaterialComponents.js';
import { getComponentCode } from './build/tools/getComponentCode.js';
import { searchMaterialIcons } from './build/tools/searchMaterialIcons.js';

async function runTests() {
  console.log('🚀 Running comprehensive Flutter optimization tests\n');
  console.log('═'.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: list_material_components - List all components
  console.log('\n📋 Test 1: list_material_components - List ALL components');
  try {
    const result = await listMaterialComponents({
      category: 'all',
      complexity: 'all',
      framework: 'all',
      includeDeprecated: false
    });

    const data = JSON.parse(result.content[0].text);
    console.log(`✅ Found ${data.total} total components`);

    const hasWeb = data.components.some(c => c.frameworks.includes('web'));
    const hasFlutter = data.components.some(c => c.frameworks.includes('flutter'));

    if (hasWeb && hasFlutter) {
      console.log('✅ Components include both Web and Flutter frameworks');
      passed++;
    } else {
      console.log('❌ Missing Web or Flutter frameworks');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Test 2: list_material_components - Filter by Flutter
  console.log('\n📋 Test 2: list_material_components - Filter by Flutter');
  try {
    const result = await listMaterialComponents({
      category: 'all',
      complexity: 'all',
      framework: 'flutter',
      includeDeprecated: false
    });

    const data = JSON.parse(result.content[0].text);
    const allFlutter = data.components.every(c => c.frameworks.includes('flutter'));

    if (allFlutter && data.total > 0) {
      console.log(`✅ All ${data.total} components support Flutter`);
      passed++;
    } else {
      console.log('❌ Not all components support Flutter');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Test 3: list_material_components - Filter by Web
  console.log('\n📋 Test 3: list_material_components - Filter by Web');
  try {
    const result = await listMaterialComponents({
      category: 'all',
      complexity: 'all',
      framework: 'web',
      includeDeprecated: false
    });

    const data = JSON.parse(result.content[0].text);
    const allWeb = data.components.every(c => c.frameworks.includes('web'));

    if (allWeb && data.total > 0) {
      console.log(`✅ All ${data.total} components support Web`);
      passed++;
    } else {
      console.log('❌ Not all components support Web');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Test 4: get_component_code - Default framework is Flutter
  console.log('\n🎨 Test 4: get_component_code - Default framework (should be Flutter)');
  try {
    const result = await getComponentCode({
      componentName: 'button'
      // framework not specified - should default to flutter
    });

    const data = JSON.parse(result.content[0].text);

    if (data.framework === 'flutter') {
      console.log('✅ Default framework is Flutter');
      console.log(`   Component: ${data.component} (${data.sourceCode.length} chars)`);
      passed++;
    } else {
      console.log(`❌ Default framework is ${data.framework}, expected Flutter`);
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Test 5: get_component_code - Explicit Flutter request
  console.log('\n🎨 Test 5: get_component_code - Explicit Flutter request');
  try {
    const result = await getComponentCode({
      componentName: 'card',
      framework: 'flutter'
    });

    const data = JSON.parse(result.content[0].text);

    if (data.framework === 'flutter' && data.sourceCode.length > 0) {
      console.log('✅ Flutter component code fetched successfully');
      console.log(`   Component: ${data.component} (${data.sourceCode.length} chars)`);
      passed++;
    } else {
      console.log('❌ Failed to fetch Flutter component');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Test 6: get_component_code - Web still works
  console.log('\n🎨 Test 6: get_component_code - Web framework still works');
  try {
    const result = await getComponentCode({
      componentName: 'button',
      framework: 'web'
    });

    const data = JSON.parse(result.content[0].text);

    if (data.framework === 'web' && data.sourceCode.length > 0) {
      console.log('✅ Web component code still works');
      console.log(`   Component: ${data.component} (${data.sourceCode.length} chars)`);
      passed++;
    } else {
      console.log('❌ Web framework broken');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Test 7: search_material_icons - Flutter usage code
  console.log('\n🔍 Test 7: search_material_icons - Flutter usage code included');
  try {
    const result = await searchMaterialIcons({
      query: 'home',
      limit: 1
    });

    const data = JSON.parse(result.content[0].text);
    const icon = data.results[0];

    if (icon.usage.flutter && icon.usage.flutter.includes('Icon(Icons.')) {
      console.log('✅ Flutter usage code included in icon search');
      console.log(`   Icon: ${icon.name}`);
      console.log(`   Frameworks: ${Object.keys(icon.usage).join(', ')}`);
      passed++;
    } else {
      console.log('❌ Flutter usage code missing or incorrect');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Test 8: search_material_icons - All frameworks included
  console.log('\n🔍 Test 8: search_material_icons - All frameworks included');
  try {
    const result = await searchMaterialIcons({
      query: 'settings',
      limit: 1
    });

    const data = JSON.parse(result.content[0].text);
    const icon = data.results[0];
    const frameworks = Object.keys(icon.usage);

    const expectedFrameworks = ['web', 'react', 'angular', 'vue', 'flutter'];
    const hasAll = expectedFrameworks.every(fw => frameworks.includes(fw));

    if (hasAll) {
      console.log('✅ All frameworks included in icon usage');
      console.log(`   Frameworks: ${frameworks.join(', ')}`);
      passed++;
    } else {
      console.log('❌ Missing frameworks in icon usage');
      console.log(`   Expected: ${expectedFrameworks.join(', ')}`);
      console.log(`   Got: ${frameworks.join(', ')}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}/8`);
  console.log(`   ❌ Failed: ${failed}/8`);
  console.log(`   Success Rate: ${Math.round((passed / 8) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All Flutter optimization tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});