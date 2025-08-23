const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Get all stores
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT id, name, address, phone, settings FROM stores ORDER BY name'
        );
        
        res.json({
            stores: result.rows
        });
        
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Failed to get stores' });
    }
});

// Get store by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'SELECT * FROM stores WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ error: 'Failed to get store' });
    }
});

// Create new store
router.post('/', async (req, res) => {
    try {
        const {
            name,
            address,
            phone,
            apiConfig = {},
            settings = {}
        } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Store name is required' });
        }
        
        const result = await query(
            `INSERT INTO stores (name, address, phone, api_config, settings)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, address, phone, apiConfig, settings]
        );
        
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ error: 'Failed to create store' });
    }
});

// Update store
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            address,
            phone,
            apiConfig,
            settings
        } = req.body;
        
        const result = await query(
            `UPDATE stores 
             SET name = $1, address = $2, phone = $3, api_config = $4, settings = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [name, address, phone, apiConfig, settings, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ error: 'Failed to update store' });
    }
});

// Delete store
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'DELETE FROM stores WHERE id = $1 RETURNING id, name',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        res.json({
            message: 'Store deleted successfully',
            store: result.rows[0]
        });
        
    } catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
});

// Get store analytics
router.get('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        const { days = 30 } = req.query;
        
        const result = await query(
            `SELECT * FROM usage_analytics 
             WHERE store_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
             ORDER BY date DESC`,
            [id]
        );
        
        res.json({
            analytics: result.rows,
            storeId: id,
            period: `${days} days`
        });
        
    } catch (error) {
        console.error('Get store analytics error:', error);
        res.status(500).json({ error: 'Failed to get store analytics' });
    }
});

// Update store analytics
router.post('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            activeUsers = 0,
            sessions = 0,
            queries = 0,
            completions = 0,
            metrics = {}
        } = req.body;
        
        const today = new Date().toISOString().split('T')[0];
        
        // Check if analytics record exists for today
        const existingResult = await query(
            'SELECT id FROM usage_analytics WHERE store_id = $1 AND date = $2',
            [id, today]
        );
        
        let result;
        if (existingResult.rows.length > 0) {
            // Update existing record
            result = await query(
                `UPDATE usage_analytics 
                 SET active_users = active_users + $1, sessions = sessions + $2, 
                     queries = queries + $3, completions = completions + $4,
                     metrics = $5
                 WHERE store_id = $6 AND date = $7
                 RETURNING *`,
                [activeUsers, sessions, queries, completions, metrics, id, today]
            );
        } else {
            // Create new record
            result = await query(
                `INSERT INTO usage_analytics (store_id, date, active_users, sessions, queries, completions, metrics)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [id, today, activeUsers, sessions, queries, completions, metrics]
            );
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Update store analytics error:', error);
        res.status(500).json({ error: 'Failed to update store analytics' });
    }
});

module.exports = router;