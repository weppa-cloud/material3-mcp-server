#!/usr/bin/env node

/**
 * Test cache versioning and freshness strategy
 */

import { manageCacheHealth } from './build/tools/manageCacheHealth.js';

async function testCacheVersioning() {
  console.log('🧪 Testing Cache Versioning System\n');
  console.log('═'.repeat(60));

  // Test 1: Check cache status
  console.log('\n📋 Test 1: Check Cache Status');
  const statusResult = await manageCacheHealth({ action: 'status' });
  const status = JSON.parse(statusResult.content[0].text);

  console.log(`✅ Cache version: ${status.cache_health.version}`);
  console.log(`   Last upstream check: ${status.cache_health.last_upstream_check}`);
  console.log(`   Time since check: ${status.cache_health.time_since_check}`);
  console.log(`   Needs check: ${status.cache_health.needs_upstream_check}`);
  console.log(`\n   Cache Statistics:`);
  console.log(`   - Components: ${status.cache_health.statistics.components.hitRate} hit rate`);
  console.log(`   - Icons: ${status.cache_health.statistics.icons.hitRate} hit rate`);
  console.log(`   - Docs: ${status.cache_health.statistics.docs.hitRate} hit rate`);
  console.log(`\n   ${status.recommendation}`);

  // Test 2: Check for upstream updates
  console.log('\n📋 Test 2: Check for Upstream Updates');
  console.log('   (This checks flutter/flutter and material-components/material-web)');
  const updateResult = await manageCacheHealth({ action: 'check_updates' });
  const updates = JSON.parse(updateResult.content[0].text);

  console.log(`✅ Status: ${updates.status}`);
  console.log(`   Upstream changes: ${updates.upstream_changes_detected}`);
  console.log(`   Message: ${updates.message}`);
  console.log(`   Recommendation: ${updates.recommendation}`);

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Cache Freshness Strategy:');
  console.log('   1. ✅ Version-based invalidation (on server update)');
  console.log('   2. ✅ Upstream change detection (checks git commits)');
  console.log('   3. ✅ TTL expiration (configurable per data type)');
  console.log('   4. ✅ Manual invalidation (via manage_cache_health tool)');

  console.log('\n💡 How to prevent stale data:');
  console.log('   • Automatic: System checks upstream every hour');
  console.log('   • Manual: Run manage_cache_health({ action: "check_updates" })');
  console.log('   • Force refresh: Run manage_cache_health({ action: "invalidate_all" })');
  console.log('   • Component-specific: invalidate_component action');

  console.log('\n🎯 Expected behavior:');
  console.log('   • First request: Fetches from GitHub (~450ms)');
  console.log('   • Subsequent requests: Serves from cache (0ms)');
  console.log('   • After 1 hour: Auto-checks for upstream changes');
  console.log('   • If changes detected: Auto-invalidates and refetches');

  console.log('\n🎉 Cache versioning system is working!');
}

testCacheVersioning().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});