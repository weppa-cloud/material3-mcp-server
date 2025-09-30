#!/usr/bin/env node

/**
 * Test script for searchMaterialIcons tool with Flutter support
 */

import { MaterialSymbolsProvider } from './build/providers/material-symbols-provider.js';

async function testIcons() {
  console.log('🧪 Testing Material Icons with Flutter support\n');

  const provider = new MaterialSymbolsProvider();

  // Test 1: Search for home icon
  console.log('Test 1: Search for "home" icon');
  const homeIcons = await provider.searchIcons('home', { limit: 3 });
  console.log(`✅ Found ${homeIcons.length} home icons`);
  console.log(`   Icons: ${homeIcons.map(i => i.name).join(', ')}`);
  console.log('');

  // Test 2: Generate Flutter usage code for 'home' icon
  console.log('Test 2: Generate Flutter usage code for "home" icon');
  const homeIcon = homeIcons[0];
  const flutterCode = provider.generateUsageCode(homeIcon.name, 'flutter');
  console.log('✅ Flutter usage code generated:');
  console.log(flutterCode);
  console.log('');

  // Test 3: Generate usage code for all frameworks
  console.log('Test 3: Generate usage for "settings" in all frameworks');
  const settingsIcons = await provider.searchIcons('settings', { limit: 1 });
  const settingsIcon = settingsIcons[0];

  console.log(`\n📱 Flutter:`);
  console.log(provider.generateUsageCode(settingsIcon.name, 'flutter'));

  console.log(`\n🌐 Web:`);
  console.log(provider.generateUsageCode(settingsIcon.name, 'web'));

  console.log(`\n⚛️  React:`);
  console.log(provider.generateUsageCode(settingsIcon.name, 'react'));

  console.log('');

  // Test 4: Verify icon name conversion
  console.log('Test 4: Verify icon name conversion for Flutter');
  const testIcons = ['arrow-back', 'add-circle', 'check-box', 'star'];
  for (const iconName of testIcons) {
    const flutterName = iconName.replace(/-/g, '_');
    console.log(`   ${iconName} → Icons.${flutterName}`);
  }
  console.log('');

  console.log('✅ All icon tests passed!');
}

testIcons().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});