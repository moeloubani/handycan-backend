const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Trust proxy for Railway
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins for now
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'core-service',
        mode: 'simplified',
        database: 'not connected'
    });
});

// Mock endpoints for testing
app.post('/api/products/search', (req, res) => {
    const { query, category } = req.body;
    res.json({
        products: [
            {
                sku: 'FAU-001',
                name: 'Moen Arbor Kitchen Faucet',
                description: 'High-arc kitchen faucet',
                price: 179.99,
                availability: true
            },
            {
                sku: 'FAU-002', 
                name: 'Delta Leland Kitchen Faucet',
                description: 'Traditional style faucet',
                price: 198.50,
                availability: true
            }
        ],
        query,
        category,
        totalCount: 2
    });
});

app.get('/api/guides/faucet_installation', (req, res) => {
    res.json({
        guide: {
            id: 'guide-001',
            title: 'Kitchen Faucet Installation',
            description: 'Complete guide to installing a kitchen faucet',
            difficulty: 'BEGINNER',
            estimatedTime: '1-2 hours',
            steps: [
                {
                    stepNumber: 1,
                    title: 'Turn off water supply',
                    description: 'Locate and turn off water valves'
                },
                {
                    stepNumber: 2,
                    title: 'Remove old faucet',
                    description: 'Disconnect and remove existing faucet'
                }
            ]
        }
    });
});

app.post('/api/compatibility/check', (req, res) => {
    const { productA, productB } = req.body;
    res.json({
        compatible: true,
        productA,
        productB,
        notes: 'Products are compatible',
        confidence: 'medium'
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Core Service Error:', error);
    res.status(error.status || 500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server immediately
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Core Service (Simplified) running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Database: Not connected (using mock data)');
    console.log('Health check available at /health');
});