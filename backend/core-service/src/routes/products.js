const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Search products
router.post('/search', async (req, res) => {
    try {
        const { query: searchQuery, category, storeId } = req.body;
        
        let sql = `
            SELECT * FROM products 
            WHERE 1=1
        `;
        let params = [];
        let paramCount = 0;
        
        if (searchQuery) {
            paramCount++;
            sql += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            params.push(`%${searchQuery}%`);
        }
        
        if (category) {
            paramCount++;
            sql += ` AND category ILIKE $${paramCount}`;
            params.push(`%${category}%`);
        }
        
        sql += ` ORDER BY availability DESC, name ASC LIMIT 20`;
        
        const result = await query(sql, params);
        
        res.json({
            products: result.rows,
            totalCount: result.rows.length,
            query: searchQuery,
            category
        });
        
    } catch (error) {
        console.error('Product search error:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
});

// Get product by SKU
router.get('/:sku', async (req, res) => {
    try {
        const { sku } = req.params;
        
        const result = await query(
            'SELECT * FROM products WHERE sku = $1',
            [sku]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        const result = await query(
            'SELECT * FROM products WHERE category ILIKE $1 ORDER BY name ASC LIMIT $2 OFFSET $3',
            [`%${category}%`, limit, offset]
        );
        
        res.json({
            products: result.rows,
            category,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: result.rows.length === parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ error: 'Failed to get products by category' });
    }
});

// Create new product (for admin)
router.post('/', async (req, res) => {
    try {
        const {
            sku,
            name,
            description,
            category,
            price,
            availability = true,
            storeLocation,
            imageUrl,
            compatibility = []
        } = req.body;
        
        const result = await query(
            `INSERT INTO products 
             (sku, name, description, category, price, availability, store_location, image_url, compatibility)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [sku, name, description, category, price, availability, storeLocation, imageUrl, compatibility]
        );
        
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            res.status(400).json({ error: 'Product with this SKU already exists' });
        } else {
            console.error('Create product error:', error);
            res.status(500).json({ error: 'Failed to create product' });
        }
    }
});

// Update product availability
router.patch('/:sku/availability', async (req, res) => {
    try {
        const { sku } = req.params;
        const { availability } = req.body;
        
        const result = await query(
            'UPDATE products SET availability = $1, updated_at = CURRENT_TIMESTAMP WHERE sku = $2 RETURNING *',
            [availability, sku]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ error: 'Failed to update product availability' });
    }
});

// Get all categories
router.get('/meta/categories', async (req, res) => {
    try {
        const result = await query(
            'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
        );
        
        res.json({
            categories: result.rows.map(row => row.category)
        });
        
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

module.exports = router;