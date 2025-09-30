#!/usr/bin/env node

/**
 * Manual test script para verificar las correcciones de bugs
 * Este script simula llamadas a las herramientas MCP
 */

import { DocumentationProvider } from './build/providers/documentation-provider.js';
import { MaterialWebProvider } from './build/providers/material-web-provider.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function runTests() {
  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}🧪 Pruebas de Corrección de Bugs${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Listar componentes
  console.log(`${YELLOW}Test 1: Listar componentes desde GitHub${RESET}`);
  try {
    const provider = new MaterialWebProvider();
    const components = await provider.listComponents();

    console.log(`  Componentes encontrados: ${components.length}`);
    console.log(`  Lista: ${components.join(', ')}\n`);

    // Verificar que incluya los correctos
    const shouldInclude = ['button', 'chips', 'textfield', 'checkbox', 'fab', 'dialog'];
    const shouldNotInclude = ['card', 'chip', 'text-field'];

    let testPassed = true;

    for (const comp of shouldInclude) {
      if (!components.includes(comp)) {
        console.log(`  ${RED}✗ Falta componente: ${comp}${RESET}`);
        testPassed = false;
      }
    }

    for (const comp of shouldNotInclude) {
      if (components.includes(comp)) {
        console.log(`  ${RED}✗ No debería incluir: ${comp}${RESET}`);
        testPassed = false;
      }
    }

    if (testPassed) {
      console.log(`  ${GREEN}✓ Test 1 pasado${RESET}\n`);
      passed++;
    } else {
      console.log(`  ${RED}✗ Test 1 fallido${RESET}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${RED}✗ Error: ${error.message}${RESET}\n`);
    failed++;
  }

  // Test 2: Obtener componente 'chips' (plural)
  console.log(`${YELLOW}Test 2: Obtener código de 'chips' (plural)${RESET}`);
  try {
    const provider = new MaterialWebProvider();
    const code = await provider.getComponentCode('chips');

    if (code.component === 'chips' && code.framework === 'web') {
      console.log(`  ${GREEN}✓ Test 2 pasado - Componente 'chips' encontrado${RESET}\n`);
      passed++;
    } else {
      console.log(`  ${RED}✗ Test 2 fallido - Respuesta inesperada${RESET}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${RED}✗ Error: ${error.message}${RESET}\n`);
    failed++;
  }

  // Test 3: Obtener componente 'textfield' (sin guión)
  console.log(`${YELLOW}Test 3: Obtener código de 'textfield' (sin guión)${RESET}`);
  try {
    const provider = new MaterialWebProvider();
    const code = await provider.getComponentCode('textfield');

    if (code.component === 'textfield' && code.framework === 'web') {
      console.log(`  ${GREEN}✓ Test 3 pasado - Componente 'textfield' encontrado${RESET}\n`);
      passed++;
    } else {
      console.log(`  ${RED}✗ Test 3 fallido - Respuesta inesperada${RESET}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${RED}✗ Error: ${error.message}${RESET}\n`);
    failed++;
  }

  // Test 4: Intentar obtener 'card' (no existe)
  console.log(`${YELLOW}Test 4: Intentar obtener 'card' (debe fallar)${RESET}`);
  try {
    const provider = new MaterialWebProvider();
    await provider.getComponentCode('card');
    console.log(`  ${RED}✗ Test 4 fallido - No debería encontrar 'card'${RESET}\n`);
    failed++;
  } catch (error) {
    if (error.message.includes('Component not found')) {
      console.log(`  ${GREEN}✓ Test 4 pasado - Error esperado: ${error.message}${RESET}\n`);
      passed++;
    } else {
      console.log(`  ${RED}✗ Error inesperado: ${error.message}${RESET}\n`);
      failed++;
    }
  }

  // Test 5: Verificar DocumentationProvider mock data
  console.log(`${YELLOW}Test 5: Verificar DocumentationProvider mock data${RESET}`);
  try {
    const provider = new DocumentationProvider(false);
    const components = await provider.getComponents('all', 'web');

    const names = components.map(c => c.name);
    console.log(`  Componentes en mock: ${names.join(', ')}\n`);

    const hasChips = names.includes('chips');
    const hasTextField = names.includes('textfield');
    const hasCard = names.includes('card');
    const hasChip = names.includes('chip');

    if (hasChips && hasTextField && !hasCard && !hasChip) {
      console.log(`  ${GREEN}✓ Test 5 pasado - Mock data actualizado correctamente${RESET}\n`);
      passed++;
    } else {
      console.log(`  ${RED}✗ Test 5 fallido - Mock data no coincide${RESET}`);
      console.log(`    chips: ${hasChips}, textfield: ${hasTextField}, card: ${hasCard}, chip: ${hasChip}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${RED}✗ Error: ${error.message}${RESET}\n`);
    failed++;
  }

  // Test 6: Verificar que todos los componentes tienen solo framework 'web'
  console.log(`${YELLOW}Test 6: Verificar frameworks solo 'web'${RESET}`);
  try {
    const provider = new DocumentationProvider(false);
    const components = await provider.getComponents('all', 'all');

    const allWebOnly = components.every(c =>
      c.frameworks.length === 1 && c.frameworks[0] === 'web'
    );

    if (allWebOnly) {
      console.log(`  ${GREEN}✓ Test 6 pasado - Todos los componentes tienen solo 'web'${RESET}\n`);
      passed++;
    } else {
      console.log(`  ${RED}✗ Test 6 fallido - Algunos componentes tienen múltiples frameworks${RESET}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${RED}✗ Error: ${error.message}${RESET}\n`);
    failed++;
  }

  // Resumen
  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}📊 Resumen de Pruebas${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════${RESET}`);
  console.log(`${GREEN}✓ Pasadas: ${passed}${RESET}`);
  console.log(`${RED}✗ Fallidas: ${failed}${RESET}`);
  console.log(`Total: ${passed + failed}\n`);

  if (failed === 0) {
    console.log(`${GREEN}🎉 Todas las pruebas pasaron!${RESET}\n`);
  } else {
    console.log(`${RED}⚠️  Algunas pruebas fallaron${RESET}\n`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error(`${RED}Error fatal: ${error.message}${RESET}`);
  process.exit(1);
});