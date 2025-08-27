const { Pool } = require('pg');

let pool = null;

function createPool() {
    if (pool) return pool;
    
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout to 10 seconds
    });
    
    pool.on('error', (err) => {
        console.error('Unexpected database error:', err);
    });
    
    return pool;
}

async function initializeDatabase() {
    const db = createPool();
    
    try {
        // Test connection
        await db.query('SELECT NOW()');
        console.log('Database connection established');
        
        // Create tables if they don't exist
        await createTables();
        
        return db;
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

async function createTables() {
    const db = getPool();
    
    // Enable pgvector extension if available
    try {
        await db.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('pgvector extension enabled');
    } catch (error) {
        console.log('pgvector extension not available, continuing without vector search');
    }
    
    // Products table
    await db.query(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            sku VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            price DECIMAL(10,2),
            availability BOOLEAN DEFAULT true,
            store_location VARCHAR(100),
            image_url VARCHAR(500),
            compatibility TEXT[],
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Project guides table
    await db.query(`
        CREATE TABLE IF NOT EXISTS project_guides (
            id SERIAL PRIMARY KEY,
            project_type VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            difficulty VARCHAR(20) CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
            estimated_time VARCHAR(50),
            steps JSONB,
            required_tools TEXT[],
            required_materials JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Stores table
    await db.query(`
        CREATE TABLE IF NOT EXISTS stores (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            phone VARCHAR(20),
            api_config JSONB,
            settings JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Compatibility rules table
    await db.query(`
        CREATE TABLE IF NOT EXISTS compatibility_rules (
            id SERIAL PRIMARY KEY,
            product_a VARCHAR(255),
            product_b VARCHAR(255),
            compatible BOOLEAN,
            notes TEXT,
            confidence VARCHAR(20) DEFAULT 'medium',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Usage analytics table
    await db.query(`
        CREATE TABLE IF NOT EXISTS usage_analytics (
            id SERIAL PRIMARY KEY,
            store_id INTEGER REFERENCES stores(id),
            date DATE DEFAULT CURRENT_DATE,
            active_users INTEGER DEFAULT 0,
            sessions INTEGER DEFAULT 0,
            queries INTEGER DEFAULT 0,
            completions INTEGER DEFAULT 0,
            metrics JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    console.log('Database tables created/verified successfully');
}

function getPool() {
    if (!pool) {
        return createPool();
    }
    return pool;
}

async function query(text, params) {
    const db = getPool();
    const start = Date.now();
    try {
        const res = await db.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Query error:', { text, error: error.message });
        throw error;
    }
}

async function getClient() {
    const db = getPool();
    return await db.connect();
}

module.exports = {
    query,
    getClient,
    getPool,
    initializeDatabase
};