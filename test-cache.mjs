#!/usr/bin/env node

/**
 * Cache Performance Test Script
 * Tests the latency difference between cache hits and misses
 */

const BASE_URL = 'http://localhost:3000';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Cookie: `token=${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Extract token from Set-Cookie header if present
  const setCookie = response.headers.get('set-cookie');
  if (setCookie && setCookie.includes('token=')) {
    const match = setCookie.match(/token=([^;]+)/);
    if (match) authToken = match[1];
  }

  return response;
}

async function register() {
  console.log('\n🔐 Registering test user...');
  const response = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(TEST_USER),
  });

  if (!response.ok && response.status !== 400) {
    throw new Error(`Registration failed: ${response.statusText}`);
  }

  // Try to login if user already exists
  if (response.status === 400) {
    console.log('   User exists, logging in instead...');
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_USER),
    });

    if (!loginResponse.ok) {
      // Create new user with unique email
      TEST_USER.email = `test-${Date.now()}@example.com`;
      return register();
    }
  }

  console.log('✅ Authenticated successfully');
}

async function createSampleData() {
  console.log('\n📊 Creating sample transactions...');

  const transactions = [
    { amount: 50.0, description: 'Grocery Store', date: new Date(), type: 'expense' },
    { amount: 1200.0, description: 'Salary', date: new Date(), type: 'income' },
    { amount: 30.5, description: 'Gas Station', date: new Date(), type: 'expense' },
    { amount: 15.0, description: 'Coffee Shop', date: new Date(), type: 'expense' },
    { amount: 80.0, description: 'Restaurant', date: new Date(), type: 'expense' },
  ];

  for (const tx of transactions) {
    await makeRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  }

  console.log(`✅ Created ${transactions.length} sample transactions`);
}

async function testAIQuery(query, round) {
  const start = Date.now();

  const response = await makeRequest('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [{ role: 'user', content: query }],
    }),
  });

  const latency = Date.now() - start;

  if (!response.ok) {
    throw new Error(`AI query failed: ${response.statusText}`);
  }

  return latency;
}

async function getCacheStats() {
  const response = await makeRequest('/api/cache/stats');
  if (!response.ok) {
    throw new Error(`Failed to get cache stats: ${response.statusText}`);
  }
  return response.json();
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 CACHE PERFORMANCE TEST');
  console.log('='.repeat(60));

  try {
    // Step 1: Auth
    await register();

    // Step 2: Create sample data
    await createSampleData();

    // Wait a moment for data to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 3: Test queries
    console.log('\n📝 Testing AI queries...\n');

    const testQueries = [
      'Show me my recent transactions',
      'What are my spending patterns?',
      'Give me a financial summary',
    ];

    console.log('🔴 ROUND 1: Cache MISSES (First Queries)');
    console.log('-'.repeat(60));
    const missLatencies = [];

    for (const query of testQueries) {
      const latency = await testAIQuery(query, 1);
      missLatencies.push(latency);
      console.log(`   "${query}"`);
      console.log(`   ⏱️  ${latency}ms\n`);
    }

    // Wait for cache to be populated
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('\n🟢 ROUND 2: Cache HITS (Repeat Queries)');
    console.log('-'.repeat(60));
    const hitLatencies = [];

    for (const query of testQueries) {
      const latency = await testAIQuery(query, 2);
      hitLatencies.push(latency);
      console.log(`   "${query}"`);
      console.log(`   ⏱️  ${latency}ms\n`);
    }

    // Step 4: Get cache stats
    console.log('\n📊 CACHE STATISTICS');
    console.log('='.repeat(60));

    const stats = await getCacheStats();

    console.log(`
📈 Performance Metrics:
   Cache Hits:           ${stats.hits}
   Cache Misses:         ${stats.misses}
   Hit Rate:             ${stats.hitRate.toFixed(2)}%
   Cache Size:           ${stats.size} entries

⏱️  Latency Analysis:
   Avg Cache HIT:        ${stats.avgHitLatency.toFixed(2)}ms
   Avg Cache MISS:       ${stats.avgMissLatency.toFixed(2)}ms
   Latency Reduction:    ${stats.latencyReduction.toFixed(2)}%

🎯 Manual Test Results:
   Avg MISS (Round 1):   ${(missLatencies.reduce((a, b) => a + b, 0) / missLatencies.length).toFixed(2)}ms
   Avg HIT (Round 2):    ${(hitLatencies.reduce((a, b) => a + b, 0) / hitLatencies.length).toFixed(2)}ms
   Manual Reduction:     ${(((missLatencies.reduce((a, b) => a + b, 0) / missLatencies.length - hitLatencies.reduce((a, b) => a + b, 0) / hitLatencies.length) / (missLatencies.reduce((a, b) => a + b, 0) / missLatencies.length)) * 100).toFixed(2)}%
    `);

    console.log('='.repeat(60));
    console.log('✅ TEST COMPLETE\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
