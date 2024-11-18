const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 5002;

let items = ['Item 1', 'Item 2', 'Item 3'];

app.use(cors());

const wss = new WebSocket.Server({ noServer: true, clientTracking: true });

const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

app.server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
    console.log('Handling WebSocket upgrade request...');
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    // Send initial data to the client
    ws.send(JSON.stringify({ type: 'initial', items }));

    // Handle incoming WebSocket messages for add/remove actions
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received message from client:', data);

        if (data.type === 'add') {
            items.push(data.item);
            broadcast({ type: 'update', items });
        } else if (data.type === 'remove') {
            items = items.filter(item => item !== data.item);
            broadcast({ type: 'update', items });
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
        console.log('WebSocket error:', error);
    });
});
