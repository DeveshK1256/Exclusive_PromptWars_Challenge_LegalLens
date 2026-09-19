import fetch from 'node-fetch';

async function testLiveAuth() {
  console.log('--- TESTING LIVE AUTHENTICATION ENDPOINTS ON PORT 3000 ---');

  // 1. Random Unregistered Email Login Test
  const randomEmail = `random_test_${Date.now()}@domain.com`;
  console.log(`\n1. Testing Login with Unregistered Email: ${randomEmail}`);
  const res1 = await fetch('http://localhost:3000/api/auth/login-attempt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: randomEmail, password: 'RandomPassword123!' }),
  });
  const data1 = await res1.json();
  console.log('HTTP Status Code:', res1.status);
  console.log('Server Response Body:', JSON.stringify(data1, null, 2));

  // 2. Signup New Account Test
  const newEmail = `newuser_${Date.now()}@domain.com`;
  const newPassword = 'ValidPassword123!';
  console.log(`\n2. Creating New Account: ${newEmail}`);
  const res2 = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: newEmail, password: newPassword }),
  });
  const data2 = await res2.json();
  console.log('HTTP Status Code:', res2.status);
  console.log('Server Response Body:', JSON.stringify(data2, null, 2));

  // 3. Immediate Login with Just-Created Credentials Test
  console.log(`\n3. Immediately Signing In with Just-Created Credentials (${newEmail})`);
  const res3 = await fetch('http://localhost:3000/api/auth/login-attempt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newEmail, password: newPassword }),
  });
  const data3 = await res3.json();
  console.log('HTTP Status Code:', res3.status);
  console.log('Server Response Body:', JSON.stringify(data3, null, 2));

  // 4. Case-Insensitive Login Test (Uppercase Email)
  console.log(`\n4. Signing In with Uppercase Variation of New Credentials (${newEmail.toUpperCase()})`);
  const res4 = await fetch('http://localhost:3000/api/auth/login-attempt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newEmail.toUpperCase(), password: newPassword }),
  });
  const data4 = await res4.json();
  console.log('HTTP Status Code:', res4.status);
  console.log('Server Response Body:', JSON.stringify(data4, null, 2));
}

testLiveAuth().catch(err => console.error('Live Test Error:', err));
