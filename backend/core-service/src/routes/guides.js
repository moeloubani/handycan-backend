const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Get project guide
router.get('/:projectType', async (req, res) => {
    try {
        const { projectType } = req.params;
        const { difficulty } = req.query;
        
        let sql = 'SELECT * FROM project_guides WHERE project_type = $1';
        let params = [projectType];
        
        if (difficulty) {
            sql += ' AND difficulty = $2';
            params.push(difficulty.toUpperCase());
        }
        
        sql += ' ORDER BY difficulty, id LIMIT 1';
        
        const result = await query(sql, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Project guide not found',
                projectType,
                difficulty
            });
        }
        
        res.json({
            guide: result.rows[0]
        });
        
    } catch (error) {
        console.error('Get project guide error:', error);
        res.status(500).json({ error: 'Failed to get project guide' });
    }
});

// Get all project types
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT DISTINCT project_type, title, difficulty FROM project_guides ORDER BY project_type, difficulty'
        );
        
        const guides = result.rows.reduce((acc, row) => {
            if (!acc[row.project_type]) {
                acc[row.project_type] = [];
            }
            acc[row.project_type].push({
                title: row.title,
                difficulty: row.difficulty
            });
            return acc;
        }, {});
        
        res.json({ guides });
        
    } catch (error) {
        console.error('Get project guides error:', error);
        res.status(500).json({ error: 'Failed to get project guides' });
    }
});

// Search guides by keyword
router.post('/search', async (req, res) => {
    try {
        const { query: searchQuery, difficulty } = req.body;
        
        let sql = `
            SELECT * FROM project_guides 
            WHERE (title ILIKE $1 OR description ILIKE $1 OR project_type ILIKE $1)
        `;
        let params = [`%${searchQuery}%`];
        
        if (difficulty) {
            sql += ' AND difficulty = $2';
            params.push(difficulty.toUpperCase());
        }
        
        sql += ' ORDER BY difficulty, title LIMIT 10';
        
        const result = await query(sql, params);
        
        res.json({
            guides: result.rows,
            query: searchQuery,
            difficulty
        });
        
    } catch (error) {
        console.error('Search guides error:', error);
        res.status(500).json({ error: 'Failed to search guides' });
    }
});

// Create new guide (for admin)
router.post('/', async (req, res) => {
    try {
        const {
            projectType,
            title,
            description,
            difficulty = 'BEGINNER',
            estimatedTime,
            steps,
            requiredTools = [],
            requiredMaterials = []
        } = req.body;
        
        const result = await query(
            `INSERT INTO project_guides 
             (project_type, title, description, difficulty, estimated_time, steps, required_tools, required_materials)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [projectType, title, description, difficulty, estimatedTime, steps, requiredTools, requiredMaterials]
        );
        
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        console.error('Create guide error:', error);
        res.status(500).json({ error: 'Failed to create guide' });
    }
});

// Update guide
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            projectType,
            title,
            description,
            difficulty,
            estimatedTime,
            steps,
            requiredTools,
            requiredMaterials
        } = req.body;
        
        const result = await query(
            `UPDATE project_guides 
             SET project_type = $1, title = $2, description = $3, difficulty = $4, 
                 estimated_time = $5, steps = $6, required_tools = $7, required_materials = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
             RETURNING *`,
            [projectType, title, description, difficulty, estimatedTime, steps, requiredTools, requiredMaterials, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guide not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Update guide error:', error);
        res.status(500).json({ error: 'Failed to update guide' });
    }
});

// Get guide by ID
router.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'SELECT * FROM project_guides WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guide not found' });
        }
        
        res.json({ guide: result.rows[0] });
        
    } catch (error) {
        console.error('Get guide by ID error:', error);
        res.status(500).json({ error: 'Failed to get guide' });
    }
});

module.exports = router;