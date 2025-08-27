const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const productRoutes = require('./routes/products');
const guideRoutes = require('./routes/guides');
const compatibilityRoutes = require('./routes/compatibility');
const storeRoutes = require('./routes/stores');
const { createPool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;

// Trust proxy for Railway (behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Higher limit for internal service calls
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'core-service',
        database: 'pending'
    });
});

// API routes - these will work even without database initially
app.use('/api/products', productRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/stores', storeRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Core Service Error:', error);
    res.status(error.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server immediately, try database connection in background
async function startServer() {
    // Start listening immediately
    app.listen(PORT, () => {
        console.log(`Core Service running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('Server is up, attempting database connection...');
    });
    
    // Try database connection with retries
    const maxRetries = 10;
    let retries = 0;
    
    const attemptConnection = async () => {
        try {
            const { initializeDatabase } = require('./database/connection');
            await initializeDatabase();
            console.log('Database initialized successfully');
        } catch (error) {
            retries++;
            console.error(`Database connection attempt ${retries} failed:`, error.message);
            
            if (retries < maxRetries) {
                console.log(`Retrying in 5 seconds... (${maxRetries - retries} attempts remaining)`);
                setTimeout(attemptConnection, 5000);
            } else {
                console.error('Max retries reached. Server will continue without database.');
                console.log('Some functionality may be limited.');
            }
        }
    };
    
    // Start attempting connection after a short delay
    setTimeout(attemptConnection, 2000);
}

startServer();