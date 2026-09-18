const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const request = require('http');

// Import routes and models
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const runTests = async () => {
  console.log('🧪 Starting Email Verification & Auth Flow Tests...\n');

  // Test 1: User Schema check
  console.log('1️⃣ Checking User Schema for isVerified field...');
  const schemaPath = User.schema.paths.isVerified;
  if (!schemaPath) {
    throw new Error('User schema is missing isVerified field!');
  }
  if (schemaPath.defaultValue !== false && schemaPath.options.default !== false) {
    throw new Error(`isVerified default value is not false (got: ${schemaPath.options.default})`);
  }
  console.log('   ✅ User schema has isVerified boolean field defaulting to false.\n');

  // Set up Express app for testing routes
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const makeRequest = (method, urlPath, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const url = new URL(urlPath, baseUrl);
      const reqHeaders = {
        'Content-Type': 'application/json',
        ...headers,
      };
      const req = request.request(
        url,
        {
          method,
          headers: reqHeaders,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            let json = null;
            try {
              json = JSON.parse(data);
            } catch {
              json = data;
            }
            resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
          });
        }
      );
      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    // Test 2: Signup creates unverified user and generates token
    console.log('2️⃣ Testing POST /api/auth/signup...');
    const testEmail = `farmer_${Date.now()}@test.com`;
    const signupRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Kisan Test User',
      email: testEmail,
      password: 'password123',
      location: 'Patna, Bihar',
    });

    console.log('   Status Code:', signupRes.statusCode);
    console.log('   Response Message:', signupRes.body.data?.message || signupRes.body.message);
    if (signupRes.statusCode !== 201) {
      throw new Error(`Expected 201 Created, got ${signupRes.statusCode}: ${JSON.stringify(signupRes.body)}`);
    }
    if (signupRes.body.data?.user?.isVerified !== false) {
      throw new Error(`Expected isVerified to be false upon signup, got ${signupRes.body.data?.user?.isVerified}`);
    }
    console.log('   ✅ Signup succeeded with isVerified: false.\n');

    // Test 3: Login blocked for unverified user
    console.log('3️⃣ Testing POST /api/auth/login with unverified account...');
    const unverifiedLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'password123',
    });

    console.log('   Status Code:', unverifiedLoginRes.statusCode);
    console.log('   Response:', unverifiedLoginRes.body);
    if (unverifiedLoginRes.statusCode !== 403) {
      throw new Error(`Expected 403 Forbidden, got ${unverifiedLoginRes.statusCode}`);
    }
    if (!unverifiedLoginRes.body.message?.toLowerCase().includes('verify')) {
      throw new Error(`Expected error message to prompt for verification, got: ${unverifiedLoginRes.body.message}`);
    }
    console.log('   ✅ Login correctly blocked for unverified account.\n');

    // Test 4: Invalid and Expired Token Verification
    console.log('4️⃣ Testing GET /api/auth/verify-email with invalid/expired tokens...');
    const invalidTokenRes = await makeRequest('GET', '/api/auth/verify-email?token=invalid.token.here');
    console.log('   Invalid Token Status:', invalidTokenRes.statusCode);
    if (invalidTokenRes.statusCode !== 400) {
      throw new Error(`Expected 400 for invalid token, got ${invalidTokenRes.statusCode}`);
    }

    const expiredToken = jwt.sign(
      { email: testEmail, type: 'email-verification' },
      process.env.JWT_SECRET || 'kisaan-saathi-super-secret-jwt-key-2025',
      { expiresIn: '-1s' }
    );
    const expiredTokenRes = await makeRequest('GET', `/api/auth/verify-email?token=${expiredToken}`);
    console.log('   Expired Token Status:', expiredTokenRes.statusCode);
    if (expiredTokenRes.statusCode !== 400) {
      throw new Error(`Expected 400 for expired token, got ${expiredTokenRes.statusCode}`);
    }
    console.log('   ✅ Invalid and expired tokens correctly rejected.\n');

    // Test 5: Valid Token Verification
    console.log('5️⃣ Testing GET /api/auth/verify-email with valid token...');
    const validToken = jwt.sign(
      { email: testEmail, type: 'email-verification' },
      process.env.JWT_SECRET || 'kisaan-saathi-super-secret-jwt-key-2025',
      { expiresIn: '24h' }
    );
    const verifyRes = await makeRequest('GET', `/api/auth/verify-email?token=${validToken}`, null, {
      Accept: 'application/json',
    });
    console.log('   Valid Verification Status:', verifyRes.statusCode);
    console.log('   Valid Verification Response:', verifyRes.body);
    if (verifyRes.statusCode !== 200) {
      throw new Error(`Expected 200 OK for verification, got ${verifyRes.statusCode}`);
    }
    console.log('   ✅ Account verified successfully.\n');

    // Test 6: Login after verification
    console.log('6️⃣ Testing POST /api/auth/login after verification...');
    const verifiedLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'password123',
    });
    console.log('   Verified Login Status:', verifiedLoginRes.statusCode);
    console.log('   User verified status in login response:', verifiedLoginRes.body.data?.user?.isVerified);
    console.log('   Auth Token Received:', Boolean(verifiedLoginRes.body.data?.token));
    if (verifiedLoginRes.statusCode !== 200) {
      throw new Error(`Expected 200 OK for verified login, got ${verifiedLoginRes.statusCode}`);
    }
    if (!verifiedLoginRes.body.data?.token) {
      throw new Error('Expected auth token on verified login');
    }
    console.log('   ✅ Login successful for verified account.\n');

    // Test 7: Browser HTML rendering for verify-email link
    console.log('7️⃣ Testing GET /api/auth/verify-email HTML rendering for email clients...');
    const htmlVerifyRes = await makeRequest('GET', `/api/auth/verify-email?token=${validToken}`, null, {
      Accept: 'text/html,application/xhtml+xml',
    });
    console.log('   HTML Status:', htmlVerifyRes.statusCode);
    if (!String(htmlVerifyRes.body).includes('KisaanSaathi') || !String(htmlVerifyRes.body).includes('Email Verified')) {
      throw new Error('Expected HTML verification page with KisaanSaathi branding');
    }
    console.log('   ✅ HTML verification confirmation rendered correctly.\n');

    // Test 8: Demo Account Access
    console.log('8️⃣ Testing Demo Account Login...');
    const demoLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'ramesh@kisaansaathi.in',
      password: 'demo123',
    });
    console.log('   Demo Login Status:', demoLoginRes.statusCode);
    if (demoLoginRes.statusCode !== 200) {
      throw new Error(`Expected 200 for demo login, got ${demoLoginRes.statusCode}`);
    }
    console.log('   ✅ Demo account login works seamlessly.\n');

    // Test 9: Resend Verification Email for Unverified Account
    console.log('9️⃣ Testing POST /api/auth/resend-verification for unverified account...');
    const unverifiedUserEmail = `resend_tester_${Date.now()}@test.com`;
    await makeRequest('POST', '/api/auth/signup', {
      name: 'Resend Test Farmer',
      email: unverifiedUserEmail,
      password: 'password123',
    });

    const resendSuccessRes = await makeRequest('POST', '/api/auth/resend-verification', {
      email: unverifiedUserEmail,
    });
    console.log('   Resend Status:', resendSuccessRes.statusCode);
    console.log('   Resend Response:', resendSuccessRes.body);
    if (resendSuccessRes.statusCode !== 200) {
      throw new Error(`Expected 200 OK for resend-verification, got ${resendSuccessRes.statusCode}`);
    }
    if (!resendSuccessRes.body.data?.message?.toLowerCase().includes('verification email sent')) {
      throw new Error(`Expected success message in response, got: ${JSON.stringify(resendSuccessRes.body)}`);
    }
    console.log('   ✅ Resend verification email sent successfully.\n');

    // Test 10: Resend Verification for Non-existent and Already Verified Accounts
    console.log('🔟 Testing POST /api/auth/resend-verification error handling...');
    const resendNotFoundRes = await makeRequest('POST', '/api/auth/resend-verification', {
      email: 'nonexistent_user_999@test.com',
    });
    console.log('   Non-existent email status:', resendNotFoundRes.statusCode);
    if (resendNotFoundRes.statusCode !== 404) {
      throw new Error(`Expected 404 for non-existent email, got ${resendNotFoundRes.statusCode}`);
    }

    const resendAlreadyVerifiedRes = await makeRequest('POST', '/api/auth/resend-verification', {
      email: 'ramesh@kisaansaathi.in',
    });
    console.log('   Already verified email status:', resendAlreadyVerifiedRes.statusCode);
    if (resendAlreadyVerifiedRes.statusCode !== 400) {
      throw new Error(`Expected 400 for already verified email, got ${resendAlreadyVerifiedRes.statusCode}`);
    }
    console.log('   ✅ Resend verification error handling works correctly.\n');

    console.log('🎉 ALL 10 TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
};

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
