import axios from 'axios';
import http from 'http';
import https from 'https';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL,
    // Maintain a persistent connection for all dashboard widgets firing concurrently
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        // We only access localStorage on the client-side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
