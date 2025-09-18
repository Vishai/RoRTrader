import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const API_URL = 'http://localhost:4000/api/analysis/batch';

async function testWithRealAlpaca() {
  console.log('Testing with REAL Alpaca credentials...');
  console.log('Using KEY:', process.env.ALPACA_API_KEY ? 'Present' : 'Missing');

  try {
    const response = await axios.post(API_URL, {
      symbol: 'AAPL',
      timeframe: '1h',
      exchange: 'alpaca',
      indicators: [
        { indicator: 'SMA', params: { period: 20 } },
        { indicator: 'RSI', params: { period: 14 } }
      ]
    });

    console.log('✅ Real Alpaca Response:');
    console.log('- Status:', response.status);
    console.log('- Indicators:', response.data.data.indicators.length);
    console.log('- First values:', response.data.data.indicators[0].values.slice(0, 3));
  } catch (error: any) {
    console.log('❌ Real Alpaca Error:', error.response?.data || error.message);
  }
}

async function testWithDemo() {
  console.log('\nTesting with DEMO data (no Alpaca)...');

  try {
    const response = await axios.post(API_URL, {
      symbol: 'AAPL',
      timeframe: '1h',
      exchange: 'demo',
      indicators: [
        { indicator: 'SMA', params: { period: 20 } }
      ]
    });

    console.log('✅ Demo Response:');
    console.log('- Status:', response.status);
    console.log('- Indicators:', response.data.data.indicators.length);
    console.log('- First values:', response.data.data.indicators[0].values.slice(0, 3));
  } catch (error: any) {
    console.log('❌ Demo Error:', error.response?.data || error.message);
  }
}

async function testWithMockCredentials() {
  console.log('\nTesting with MOCK credentials (should fallback to demo)...');

  // Temporarily override env vars
  const originalKey = process.env.ALPACA_API_KEY_ID;
  const originalSecret = process.env.ALPACA_API_SECRET_KEY;

  process.env.ALPACA_API_KEY_ID = 'INVALID_KEY';
  process.env.ALPACA_API_SECRET_KEY = 'INVALID_SECRET';

  try {
    const response = await axios.post(API_URL, {
      symbol: 'AAPL',
      timeframe: '1h',
      exchange: 'alpaca',
      indicators: [
        { indicator: 'RSI', params: { period: 14 } }
      ]
    });

    console.log('✅ Mock Credentials Response (should use demo fallback):');
    console.log('- Status:', response.status);
    console.log('- Indicators:', response.data.data.indicators.length);
  } catch (error: any) {
    console.log('❌ Mock Credentials Error:', error.response?.data || error.message);
  }

  // Restore original env vars
  process.env.ALPACA_API_KEY_ID = originalKey;
  process.env.ALPACA_API_SECRET_KEY = originalSecret;
}

async function runAllTests() {
  console.log('Starting API endpoint tests...\n');
  console.log('Make sure the API server is running on port 4000!\n');
  console.log('=' .repeat(50));

  await testWithRealAlpaca();
  await testWithDemo();
  await testWithMockCredentials();

  console.log('\n' + '=' .repeat(50));
  console.log('Tests complete!');
}

// Run tests
runAllTests().catch(console.error);