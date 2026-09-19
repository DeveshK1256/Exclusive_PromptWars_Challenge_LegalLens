import fetch from 'node-fetch';

const VERCEL_BASE_URL = 'https://exclusive-prompt-wars-challenge-leg-xi.vercel.app';

async function testVercelLiveAuth() {
  console.log(`--- TESTING LIVE DEPLOYED VERCEL AUTHENTICATION ENDPOINTS ---`);
  console.log(`Target URL: ${VERCEL_BASE_URL}\n`);

  // 1. Random Unregistered Email Login Test
  const randomEmail = `random_vercel_tester_${Date.now()}@domain.com`;
  console.log(`1. Testing Login with Unregistered Email: ${randomEmail}`);
  const res1 = await fetch(`${VERCEL_BASE_URL}/api/auth/login-attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: randomEmail, password: 'RandomPassword123!' }),
  });
  const data1 = await res1.json();
  console.log('HTTP Status Code:', res1.status);
  console.log('Server Response Body:', JSON.stringify(data1, null, 2));

  // 2. Signup New Account Test
  const newEmail = `vercel_newuser_${Date.now()}@domain.com`;
  const newPassword = 'VercelValidPassword123!';
  console.log(`\n2. Creating New Account: ${newEmail}`);
  const res2 = await fetch(`${VERCEL_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Vercel Tester', email: newEmail, password: newPassword }),
  });
  const data2 = await res2.json();
  console.log('HTTP Status Code:', res2.status);
  console.log('Server Response Body:', JSON.stringify(data2, null, 2));

  // 3. Immediate Login with Just-Created Credentials Test
  console.log(`\n3. Immediately Signing In with Just-Created Credentials (${newEmail})`);
  const res3 = await fetch(`${VERCEL_BASE_URL}/api/auth/login-attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newEmail, password: newPassword }),
  });
  const data3 = await res3.json();
  console.log('HTTP Status Code:', res3.status);
  console.log('Server Response Body:', JSON.stringify(data3, null, 2));

  // 4. Case-Insensitive Login Test (Uppercase Email)
  console.log(`\n4. Signing In with Uppercase Variation of New Credentials (${newEmail.toUpperCase()})`);
  const res4 = await fetch(`${VERCEL_BASE_URL}/api/auth/login-attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newEmail.toUpperCase(), password: newPassword }),
  });
  const data4 = await res4.json();
  console.log('HTTP Status Code:', res4.status);
  console.log('Server Response Body:', JSON.stringify(data4, null, 2));
}

testVercelLiveAuth().catch(err => console.error('Vercel Live Test Error:', err));
