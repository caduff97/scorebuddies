const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app, server) {
  app.use('/api', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));

  const wsProxy = createProxyMiddleware({ target: 'http://localhost:3001', ws: true, changeOrigin: true });
  app.use('/ws', wsProxy);
  server.on('upgrade', wsProxy.upgrade);
};
