const http = require('http');

const data = JSON.stringify({ email: 'admin@talentnetwork.org', password: 'password123' });
const options = { hostname: 'localhost', port: 3001, path: '/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const token = JSON.parse(body).access_token;
        if (!token) {
            console.error("Login failed", body);
            return;
        }

        const user_id = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub;
        ['/children', '/gamification/profile', `/users/${user_id}`].forEach(path => {
            http.get({ hostname: 'localhost', port: 3001, path, headers: { 'Authorization': 'Bearer ' + token } }, (r) => {
                let b = '';
                r.on('data', d => b += d);
                r.on('end', () => console.log(path, r.statusCode, b));
            });
        });
    });
});
req.write(data);
req.end();
