// Quick test script for admin login
const http = require('http');

function testAdminLogin() {
  const postData = JSON.stringify({
    email: 'bhanu@aptitude.com',
    password: 'Ncb8008535@'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n✅ Response:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.token) {
          console.log('\n🔑 Token received:', response.token.substring(0, 50) + '...');
        }
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testAdminLogin();
