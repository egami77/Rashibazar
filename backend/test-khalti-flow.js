// Test script for Khalti payment flow using fetch
const API_BASE = 'http://localhost:52987/api';

async function makeRequest(method, endpoint, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await response.text();
  
  if (!response.ok) {
    console.error(`❌ ${method} ${endpoint} returned ${response.status}`);
    console.error('Response:', text);
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

async function runTests() {
  try {
    console.log('🧪 Starting Khalti Payment Flow Test\n');

    // Step 1: Test Khalti Config
    console.log('Step 1: Testing Khalti Config...');
    const configRes = await makeRequest('GET', '/khalti/test-config');
    console.log('✅ Khalti Config:', configRes.config);
    if (!configRes.config.secretKeyPresent || !configRes.config.publicKeyPresent) {
      throw new Error('Khalti config is incomplete!');
    }
    console.log('✅ Config test passed!\n');

    // Step 2: Register a test user
    console.log('Step 2: Registering test user...');
    const testEmail = `test-${Date.now()}@test.com`;
    const registerRes = await makeRequest('POST', '/auth/register/user', {
      name: 'Test User',
      email: testEmail,
      password: 'Test@123',
      phone: '+977-9800000001',
      gender: 'male',
    });
    console.log('✅ User registered:', registerRes.message);
    console.log('✅ Test email:', testEmail, '\n');

    // Step 3: Login
    console.log('Step 3: Logging in...');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: 'Test@123',
      role: 'user',
    });
    const token = loginRes.token;
    console.log('✅ Login successful!\n');

    // Step 4: Get all astrologers
    console.log('Step 4: Fetching astrologers...');
    const astrologersRes = await makeRequest('GET', '/astrologer', null, token);
    if (!astrologersRes || astrologersRes.length === 0) {
      throw new Error('No astrologers available for booking!');
    }
    const astrologer = astrologersRes[0];
    console.log('✅ Found astrologer:', astrologer.name, '(ID:', astrologer._id, ')\n');

    // Step 5: Create a booking
    console.log('Step 5: Creating booking...');
    const futureDate = new Date(Date.now() + 86400000);
    const bookingRes = await makeRequest('POST', '/booking', {
      astrologerId: astrologer._id,
      date: futureDate.toISOString(),
      time: '10:00',
      duration: 30,
      sessionType: 'video_call',
      paymentMethod: 'khalti',
      amount: 500,
    }, token);
    const bookingId = bookingRes._id;
    console.log('✅ Booking created:', bookingId, '\n');

    // Step 6: Initiate Khalti payment
    console.log('Step 6: Initiating Khalti payment...');
    const paymentRes = await makeRequest('POST', '/khalti/initiate', {
      bookingId,
      amount: 500,
      customerInfo: {
        name: 'Test User',
        email: testEmail,
        phone: '9800000001',
      },
    }, token);
    console.log('✅ Payment initiation successful!\n');
    console.log('Payment Response:', JSON.stringify(paymentRes, null, 2));

    if (paymentRes.payment_url) {
      console.log('\n✅ SUCCESS! Payment URL received:');
      console.log(paymentRes.payment_url);
    } else if (paymentRes.pidx) {
      console.log('\n✅ SUCCESS! Payment initiated with pidx:');
      console.log(paymentRes.pidx);
    } else {
      console.log('\n⚠️ Payment initiated but response format unexpected');
    }

    console.log('\n✨ All tests passed! Khalti integration working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
