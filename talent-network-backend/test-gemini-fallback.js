const http = require('http');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  const loginData = JSON.stringify({ email: 'admin@talentnetwork.org', password: 'password123' });
  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  };

  const loginReq = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', async () => {
      const token = JSON.parse(body).access_token;
      if (!token) {
        console.error("Login failed", body);
        return;
      }

      const queries = [
        "Which children need urgent funding right now?",
        "Give me the platform health summary",
        "Identify inactive sponsors",
        "Show pending NGO verification risks"
      ];

      for (const query of queries) {
        console.log(`\nTesting Query: "${query}"`);
        const queryData = JSON.stringify({ prompt: query });
        const queryOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/ai/query',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(queryData),
            'Authorization': 'Bearer ' + token
          }
        };

        await new Promise((resolve) => {
          const req = http.request(queryOptions, (r) => {
            let b = '';
            r.on('data', d => b += d);
            r.on('end', () => {
              console.log("Status:", r.statusCode);
              console.log("Response:", JSON.stringify(JSON.parse(b), null, 2));
              resolve();
            });
          });
          req.write(queryData);
          req.end();
        });
        await delay(1000); // Give backend time to process completely cleanly
      }
    });
  });

  loginReq.write(loginData);
  loginReq.end();
}

runTests();
