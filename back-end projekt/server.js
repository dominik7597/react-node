// import http
const http = require('http');

// import opcji
const app = require('./app');

// ustawiam port
const port = process.env.port || 5000;

// tworzę serwer
const server = http.createServer(app);

// odpalam server
server.listen(port);