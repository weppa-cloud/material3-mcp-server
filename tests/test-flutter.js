#!/usr/bin/env node

/**
 * Quick test script to verify Flutter support
 */

import { FlutterMaterialProvider } from './build/providers/flutter-material-provider.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function testFlutterProvider() {
  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}🧪 Testing Flutter Material Provider${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}\n`);

  const provider = new FlutterMaterialProvider();

  // Test 1: Get button component
  console.log(`${YELLOW}Test 1: Get button component code${RESET}`);
  try {
    const button = await provider.getComponentCode('button');
    console.log(`  ${GREEN}✓ Success${RESET}`);
    console.log(`  Component: ${button.component}`);
    console.log(`  Framework: ${button.framework}`);
    console.log(`  Source code length: ${button.sourceCode.length} characters`);
    console.log(`  Examples: ${button.examples.length}`);
    console.log(`  Available variants: ${button.availableVariants.join(', ')}\n`);
  } catch (error) {
    console.log(`  ${RED}✗ Failed: ${error.message}${RESET}\n`);
  }

  // Test 2: Get elevated button
  console.log(`${YELLOW}Test 2: Get elevated button variant${RESET}`);
  try {
    const elevatedButton = await provider.getComponentCode('button', 'elevated');
    console.log(`  ${GREEN}✓ Success${RESET}`);
    console.log(`  Component: ${elevatedButton.component}`);
    console.log(`  Variant: ${elevatedButton.variant}`);
    console.log(`  Source code length: ${elevatedButton.sourceCode.length} characters\n`);
  } catch (error) {
    console.log(`  ${RED}✗ Failed: ${error.message}${RESET}\n`);
  }

  // Test 3: List all components
  console.log(`${YELLOW}Test 3: List all Flutter Material components${RESET}`);
  try {
    const components = await provider.listComponents();
    console.log(`  ${GREEN}✓ Success${RESET}`);
    console.log(`  Found ${components.length} components`);
    console.log(`  Examples: ${components.slice(0, 10).join(', ')}...\n`);
  } catch (error) {
    console.log(`  ${RED}✗ Failed: ${error.message}${RESET}\n`);
  }

  // Test 4: Get card component
  console.log(`${YELLOW}Test 4: Get card component${RESET}`);
  try {
    const card = await provider.getComponentCode('card');
    console.log(`  ${GREEN}✓ Success${RESET}`);
    console.log(`  Component: ${card.component}`);
    console.log(`  Source code length: ${card.sourceCode.length} characters\n`);
  } catch (error) {
    console.log(`  ${RED}✗ Failed: ${error.message}${RESET}\n`);
  }

  // Test 5: Get text field
  console.log(`${YELLOW}Test 5: Get text-field component${RESET}`);
  try {
    const textField = await provider.getComponentCode('text-field');
    console.log(`  ${GREEN}✓ Success${RESET}`);
    console.log(`  Component: ${textField.component}`);
    console.log(`  Source code length: ${textField.sourceCode.length} characters\n`);
  } catch (error) {
    console.log(`  ${RED}✗ Failed: ${error.message}${RESET}\n`);
  }

  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}`);
  console.log(`${GREEN}✅ Flutter provider tests complete!${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}\n`);
}

testFlutterProvider().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  console.error(error.stack);
  process.exit(1);
});