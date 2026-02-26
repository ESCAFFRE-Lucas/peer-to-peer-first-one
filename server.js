const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Create a PeerJS server instance
const peerServer = ExpressPeerServer(server, {
    debug: true
});

// Mount the PeerJS server on the /peerjs route
app.use('/peerjs', peerServer);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
server.listen(9000, '10.31.37.225');
