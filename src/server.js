'use strict';

const http = require('node:http');
const { handleRequest } = require('./app');

const PORT = Number(process.env.PORT) || 8080;

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
