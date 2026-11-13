// Kettle & Kiln store - entry point.   Run: node server.js   (Node.js 20+)
const { PORT } = require('./src/config');
const { load } = require('./src/db/database');
const { createApp } = require('./src/app');

load();
const server = createApp();

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use - another copy of the server is probably still running.`);
    console.error('Windows:  netstat -ano | findstr :' + PORT + '   then   taskkill /PID <pid> /F');
    console.error('Or use another port:  $env:PORT=3001; node server.js   (PowerShell)\n');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => console.log(`Store running: open http://localhost:${PORT}`));
