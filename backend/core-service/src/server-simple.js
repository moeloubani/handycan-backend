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

// Handle all project guide requests
app.get('/api/guides/:projectType', (req, res) => {
    const { projectType } = req.params;
    
    // Return a generic guide for any project type
    res.json({
        guide: {
            id: `guide-${projectType}`,
            title: projectType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Complete guide for ${projectType.replace(/_/g, ' ')}`,
            difficulty: 'BEGINNER',
            estimatedTime: '1-2 hours',
            steps: [
                {
                    stepNumber: 1,
                    title: 'Gather tools and materials',
                    description: 'Collect all necessary tools and materials before starting'
                },
                {
                    stepNumber: 2,
                    title: 'Prepare the work area',
                    description: 'Clear and prepare your workspace for safety'
                },
                {
                    stepNumber: 3,
                    title: 'Follow safety guidelines',
                    description: 'Wear appropriate safety gear and follow precautions'
                },
                {
                    stepNumber: 4,
                    title: 'Begin installation/repair',
                    description: 'Start with the first step of your project'
                },
                {
                    stepNumber: 5,
                    title: 'Test and verify',
                    description: 'Test your work to ensure everything functions properly'
                }
            ],
            requiredTools: [
                'Adjustable wrench',
                'Screwdriver set',
                'Safety glasses',
                'Work gloves'
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