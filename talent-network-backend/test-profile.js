const http = require('http');

const data = JSON.stringify({ email: 'sponsor.john@example.com', password: 'password123' });
const options = { hostname: '127.0.0.1', port: 3001, path: '/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const token = JSON.parse(body).access_token;
        if (!token) {
            console.error("Login failed", body);
            return;
        }

        http.get({ hostname: '127.0.0.1', port: 3001, path: '/gamification/profile', headers: { 'Authorization': 'Bearer ' + token } }, (r) => {
            let b = '';
            r.on('data', d => b += d);
            r.on('end', () => console.log('/gamification/profile', r.statusCode, b));
        });
    });
});
req.write(data);
req.end();
