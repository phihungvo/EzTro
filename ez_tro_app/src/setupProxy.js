/* eslint-disable @typescript-eslint/no-var-requires */
const {createProxyMiddleware} = require('http-proxy-middleware');
const {proxy} = require('../package.json');

module.exports = function setupProxy(app) {
    // CRA dev server may serve `index.html` for `/ws/*` which breaks SockJS (`/ws/info` expects JSON).
    // Proxy `/ws` explicitly to the backend to avoid `Unexpected token '<'`.
    const target = process.env.PROXY_TARGET || proxy || 'http://localhost:8080';

    app.use(
        '/ws',
        createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            logLevel: 'warn',
        })
    );
};

