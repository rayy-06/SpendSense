#!/usr/bin/env node

/**
 * Cache Latency Demo
 * Demonstrates the latency difference between cache hits and misses
 */

console.log('\n' + '='.repeat(70));
console.log('🧪 CACHE LATENCY DEMONSTRATION');
console.log('   (Simulating real database vs in-memory cache performance)');
console.log('='.repeat(70));

// Simulate database query with realistic latency
async function simulateDatabaseQuery(queryType) {
  // Real database queries typically take 50-150ms depending on:
  // - Query complexity
  // - Network latency
  // - Database load
  // - Connection pooling
  const baseLatency = 60;
  const variance = Math.random() * 80; // 0-80ms variance
  const latency = baseLatency + variance;

  await new Promise((resolve) => setTimeout(resolve, latency));
  return {
    data: `Result for ${queryType}`,
    latency: latency,
  };
}

// Simulate in-memory cache lookup (sub-millisecond)
async function simulateCacheHit(queryType) {
  // In-memory lookups are extremely fast:
  // - Map.get() is O(1)
  // - No network latency
  // - No I/O operations
  const latency = Math.random() * 0.8; // 0-0.8ms

  await new Promise((resolve) => setTimeout(resolve, latency));
  return {
    data: `Cached result for ${queryType}`,
    latency: latency,
  };
}

async function runDemo() {
  const queryTypes = [
    'get_transactions',
    'analyze_spending_patterns',
    'get_budgets',
    'get_goals',
    'get_summary',
  ];

  console.log('\n📊 Testing 5 different query types...\n');

  // === ROUND 1: Cache MISSES (First queries) ===
  console.log('🔴 ROUND 1: Cache MISSES (Database Queries)');
  console.log('-'.repeat(70));
  console.log('   First time queries → Must fetch from database\n');

  const missLatencies = [];

  for (const queryType of queryTypes) {
    const result = await simulateDatabaseQuery(queryType);
    missLatencies.push(result.latency);
    console.log(
      `   ${queryType.padEnd(28)} ⏱️  ${result.latency.toFixed(2).padStart(6)}ms  [DATABASE]`
    );
  }

  const avgMiss = missLatencies.reduce((a, b) => a + b, 0) / missLatencies.length;
  console.log(`\n   Average:                            ${avgMiss.toFixed(2)}ms`);

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 300));

  // === ROUND 2: Cache HITS (Repeat queries) ===
  console.log('\n🟢 ROUND 2: Cache HITS (In-Memory Lookup)');
  console.log('-'.repeat(70));
  console.log('   Repeated queries → Served from cache\n');

  const hitLatencies = [];

  for (const queryType of queryTypes) {
    const result = await simulateCacheHit(queryType);
    hitLatencies.push(result.latency);
    console.log(
      `   ${queryType.padEnd(28)} ⏱️  ${result.latency.toFixed(2).padStart(6)}ms  [CACHE]`
    );
  }

  const avgHit = hitLatencies.reduce((a, b) => a + b, 0) / hitLatencies.length;
  console.log(`\n   Average:                            ${avgHit.toFixed(2)}ms`);

  // === STATISTICS ===
  console.log('\n' + '='.repeat(70));
  console.log('📊 PERFORMANCE ANALYSIS');
  console.log('='.repeat(70));

  const reduction = ((avgMiss - avgHit) / avgMiss) * 100;
  const speedup = avgMiss / avgHit;

  console.log(`
⏱️  Latency Comparison:
   Database Query (MISS):    ${avgMiss.toFixed(2)}ms
   Cache Lookup (HIT):       ${avgHit.toFixed(2)}ms
   Time Saved:               ${(avgMiss - avgHit).toFixed(2)}ms per cached query

📈 Performance Metrics:
   Latency Reduction:        ${reduction.toFixed(2)}%
   Speed Increase:           ${speedup.toFixed(0)}x faster

🎯 Real-World Impact (assuming 60% cache hit rate):

   Scenario: 1,000 AI assistant queries per day
   ────────────────────────────────────────────────────────────
   Without Cache:
     All queries hit database: 1,000 × ${avgMiss.toFixed(0)}ms = ${(1000 * avgMiss / 1000).toFixed(1)}s total

   With Cache (60% hit rate):
     400 misses: 400 × ${avgMiss.toFixed(0)}ms = ${(400 * avgMiss / 1000).toFixed(1)}s
     600 hits:   600 × ${avgHit.toFixed(0)}ms  = ${(600 * avgHit / 1000).toFixed(1)}s
     Total:                              ${((400 * avgMiss + 600 * avgHit) / 1000).toFixed(1)}s

   Time Saved:                           ${((1000 * avgMiss - (400 * avgMiss + 600 * avgHit)) / 1000).toFixed(1)}s per day
   Database Load Reduced:                60% (600 fewer queries)
   Response Time Improved:               ${reduction.toFixed(0)}% for cached queries
  `);

  console.log('='.repeat(70));
  console.log('✅ DEMONSTRATION COMPLETE');
  console.log('='.repeat(70));
  console.log('\n💡 Your Implementation:');
  console.log('   ✓ QueryCache tracks avgHitLatency and avgMissLatency');
  console.log('   ✓ Every tool call records its latency');
  console.log('   ✓ Check /api/cache/stats for real metrics');
  console.log('   ✓ Console logs show [Cache HIT] vs [Cache MISS] timing\n');
}

// Run the demo
runDemo().catch(console.error);
