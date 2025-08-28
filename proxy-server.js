const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3333;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Proxy endpoint for chat API
app.post('/api/chat/message', async (req, res) => {
    try {
        console.log('Proxying request to Railway API...');
        const response = await axios.post(
            'https://handycan-api-gateway-new-production.up.railway.app/api/chat/message',
            req.body,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ 
            error: 'Failed to process message',
            message: error.response?.data?.message || 'Connection error'
        });
    }
});

// Serve the test page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/test-web-local.html');
});

app.listen(PORT, () => {
    console.log(`\n🚀 HandyCan Test Server Running!`);
    console.log(`\n📍 Open this URL in your browser:`);
    console.log(`   http://localhost:${PORT}\n`);
    console.log(`✅ This server handles CORS automatically\n`);
});